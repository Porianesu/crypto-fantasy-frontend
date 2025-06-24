import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import styles from './TournamentPage.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getHomePath } from '@/navigation/routes.tsx'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchPrizePools } from '@/utils/mockHelper.ts'
import dayjs from 'dayjs'
import TournamentPageLeaderboard from '@/pages/TournamentPage/TournamentPageLeaderboard.tsx'
import TournamentPageCardsFormation, {
  type ITournamentPageCardsFormationHandle,
} from '@/pages/TournamentPage/TournamentPageCardsFormation.tsx'
import { BigNumber } from 'bignumber.js'
import CountUp from 'react-countup'
import { CARD_RARITY } from '@/components/Card.tsx'
import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'
import TournamentPageCountDown from '@/pages/TournamentPage/TournamentPageCountDown.tsx'

const FormationRules = {
  totalCrystal: 8,
  rarity: [
    {
      key: CARD_RARITY.NORMAL,
      crystal: 1,
    },
    {
      key: CARD_RARITY.RARE,
      crystal: 2,
    },
    {
      key: CARD_RARITY.EPIC,
      crystal: 3,
    },
    {
      key: CARD_RARITY.LEGENDARY,
      crystal: 4,
    },
  ],
}
const TournamentPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentPrizePool, setCurrentPrizePool] = useState<IPrizePool | undefined>(undefined)
  const queryClient = useQueryClient()
  const cardsFormationRef = useRef<ITournamentPageCardsFormationHandle>(null)

  const { data: prizePools, isLoading: prizePoolsLoading } = useQuery({
    queryKey: ['prizePools'],
    queryFn: () => fetchPrizePools(FormationRules),
    staleTime: 5 * 60 * 1000,
  })
  useEffect(() => {
    if (!prizePools?.length) return
    setCurrentPrizePool(prizePools.find((p) => p.status === PRIZE_POOL_STATUS.PROCESSING))
  }, [prizePools?.length])

  // joined状态由当前奖池数据决定
  const isJoined = !!currentPrizePool?.user_participated
  const canUserJoin = !isJoined && currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING

  useEffect(() => {
    if (!currentPrizePool) return
    const update = () => {
      setCurrentPrizePool((prev) => {
        if (!prev) return prev
        let updated: IPrizePool = prev
        if (prev.status === PRIZE_POOL_STATUS.UPCOMING) {
          updated = {
            ...prev,
            price: new BigNumber(prev.price)
              .plus(Math.random() * 10)
              .decimalPlaces(2)
              .toNumber(),
            user_deck_power: prev.user_participated
              ? Math.floor(Math.random() * (990 - 225 + 1)) + 225
              : 0,
          }
        } else if (prev.user_participated && prev.status !== PRIZE_POOL_STATUS.END) {
          updated = {
            ...prev,
            user_deck_power: Math.floor(Math.random() * (990 - 225 + 1)) + 225,
          }
        }
        // 更新prizePools缓存
        queryClient.setQueryData(['prizePools'], (old: IPrizePool[] | undefined) => {
          if (!old) return old
          return old.map((pool) => (pool.id === updated.id ? updated : pool))
        })
        return updated
      })
    }
    const timer = setInterval(update, 5000)
    return () => clearInterval(timer)
  }, [currentPrizePool?.id, currentPrizePool?.user_participated, currentPrizePool?.status])

  const handleBack = () => {
    navigate(getHomePath())
  }
  const handleComingSoon = () => {
    toast.info('Coming soon')
  }

  const handleJoinButtonClick = () => {
    if (currentPrizePool?.status !== PRIZE_POOL_STATUS.UPCOMING) return
    if (cardsFormationRef.current) {
      const formation = cardsFormationRef.current.tempCardsFormation
      if (formation.length < 5) return toast.warning('Please select at 5 cards')
      // 更新prizePools缓存
      const newPool: IPrizePool = {
        ...currentPrizePool,
        user_participated: true,
        user_card_formation: formation,
        user_deck_power: Math.floor(Math.random() * (990 - 225 + 1)) + 225, // 随机生成一个225-990之间的数0
      }
      setCurrentPrizePool(newPool)
      queryClient.setQueryData(['prizePools'], (old: IPrizePool[] | undefined) => {
        if (!old) return old
        return old.map((pool) => (pool.id === newPool.id ? newPool : pool))
      })
      toast.success('Joined successfully!')
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        {/* 左侧返回按钮 */}
        <div className={styles.headerLeft}>
          <button className={classNames(styles.backBtn, 'button')} onClick={handleBack}></button>
        </div>
        {/* 中间Bronze/Silver/Gold按钮 */}
        <div className={styles.headerCenter}>
          <button className={classNames('button', styles.tierBtn, styles.tierBtnSelected)} disabled>
            Bronze
          </button>
          <button className={classNames('button', styles.tierBtn)} onClick={handleComingSoon}>
            Silver
          </button>
          <button className={classNames('button', styles.tierBtn)} onClick={handleComingSoon}>
            Gold
          </button>
        </div>
        {/* 右侧History/Rules按钮 */}
        <div className={styles.headerRight}>
          <button
            className={classNames(styles.historyBtn, 'button')}
            onClick={handleComingSoon}
          ></button>
          <button
            className={classNames(styles.rulesBtn, 'button')}
            onClick={handleComingSoon}
          ></button>
        </div>
      </div>
      {/* poolsContainer 横向按钮组 */}
      <div className={styles.poolsContainer}>
        <div className={styles.poolsClickHelper}>
          {prizePools?.map((pool) => {
            return (
              <button
                key={pool.id}
                onClick={() => setCurrentPrizePool(pool)}
                disabled={currentPrizePool?.id === pool.id}
              ></button>
            )
          })}
        </div>
        {prizePools?.map((pool) => (
          <div
            key={pool.id}
            className={classNames(
              styles.poolBtn,
              currentPrizePool?.id === pool.id && styles.poolBtnSelected,
            )}
          >
            <div className={styles.poolStatus}>
              {pool.status === PRIZE_POOL_STATUS.PROCESSING
                ? 'Ongoing'
                : pool.status === PRIZE_POOL_STATUS.UPCOMING
                  ? 'Upcoming'
                  : ''}
            </div>
            <div className={styles.poolStartDate}>{dayjs(pool.start_date).format('MMMM D')}</div>
          </div>
        ))}
      </div>
      {/* body部分后续实现 */}
      <div className={styles.body}>
        {prizePoolsLoading ? (
          <div className={styles.loadingWrapper}>Loading...</div>
        ) : (
          <>
            {/* 左侧排行榜 */}
            <TournamentPageLeaderboard
              currentPrizePool={currentPrizePool}
            ></TournamentPageLeaderboard>
            {/* 中间奖池信息区 */}
            <div className={styles.prizeInfoContainer}>
              <TournamentPageCountDown
                currentPrizePool={currentPrizePool}
              ></TournamentPageCountDown>
              <div className={styles.prizeInfoBottomPartContainer}>
                <div className={styles.prizeAmountContainer}>
                  <div className={styles.prizeDescription}>The Current Prize pool</div>
                  <div className={styles.prizeAmount}>
                    <CountUp
                      start={undefined}
                      end={currentPrizePool?.price ?? 0}
                      decimals={2}
                      duration={1}
                      separator=","
                      preserveValue
                      easingFn={(t, b, c, d) => {
                        // easeOutQuad: 先快后慢
                        t /= d
                        return -c * t * (t - 2) + b
                      }}
                    />
                    <div className={styles.prizeAmountIcon}></div>
                  </div>
                </div>
                <button
                  className={classNames(styles.joinBtn, {
                    [styles.joinedBtn]: !canUserJoin,
                    button: canUserJoin,
                  })}
                  disabled={!canUserJoin}
                  onClick={!canUserJoin ? undefined : handleJoinButtonClick}
                >
                  {isJoined ? (
                    'Joined'
                  ) : currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING ? (
                    <>
                      {'Join 100'}
                      <div className={styles.joinBtnIcon}></div>
                    </>
                  ) : (
                    'Completed'
                  )}
                </button>
              </div>
            </div>
            {/* 右侧出战卡组信息区 */}
            <TournamentPageCardsFormation
              ref={cardsFormationRef}
              currentPrizePool={currentPrizePool}
              rules={FormationRules}
            />
          </>
        )}
      </div>
    </div>
  )
}
export default observer(TournamentPage)

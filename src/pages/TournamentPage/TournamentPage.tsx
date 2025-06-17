import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import styles from './Tournament.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import { GiftIcon } from '@heroicons/react/24/solid'
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

const FormationRules = [
  {
    key: CARD_RARITY.NORMAL,
    value: 5,
  },
  {
    key: CARD_RARITY.RARE,
    value: 4,
  },
  {
    key: CARD_RARITY.EPIC,
    value: 3,
  },
  {
    key: CARD_RARITY.LEGENDARY,
    value: 1,
  },
]
const TournamentPage: React.FC = () => {
  const navigate = useNavigate()
  const [currentPrizePool, setCurrentPrizePool] = useState<IPrizePool | undefined>(undefined)
  const queryClient = useQueryClient()
  const cardsFormationRef = useRef<ITournamentPageCardsFormationHandle>(null)

  const { data: prizePools, isLoading: prizePoolsLoading } = useQuery({
    queryKey: ['prizePools'],
    queryFn: fetchPrizePools,
    staleTime: 5 * 60 * 1000,
  })
  useEffect(() => {
    if (!prizePools?.length) return
    setCurrentPrizePool(prizePools.find((p) => p.status === PRIZE_POOL_STATUS.UPCOMING))
  }, [prizePools?.length])

  // joined状态由当前奖池数据决定
  const isJoined = !!currentPrizePool?.user_participated

  // 倒计时逻辑
  const [countdown, setCountdown] = React.useState('')
  useEffect(() => {
    if (!currentPrizePool || currentPrizePool.status !== PRIZE_POOL_STATUS.PROCESSING) {
      setCountdown('')
      return
    }
    const updateCountdown = () => {
      const now = dayjs()
      const end = dayjs(currentPrizePool.end_date)
      const diff = end.diff(now, 'second')
      if (diff <= 0) {
        setCountdown('00:00:00')
        return
      }
      const h = String(Math.floor(diff / 3600)).padStart(2, '0')
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0')
      const s = String(diff % 60).padStart(2, '0')
      setCountdown(`${h}:${m}:${s}`)
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [currentPrizePool])

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
          <button className={styles.backBtn} onClick={handleBack}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        {/* 中间Bronze/Silver/Gold按钮 */}
        <div className={styles.headerCenter}>
          <button className={classNames(styles.tierBtn, styles.tierBtnSelected)} disabled>
            Bronze
          </button>
          <button className={styles.tierBtn} disabled>
            Silver
          </button>
          <button className={styles.tierBtn} disabled>
            Gold
          </button>
        </div>
        {/* 右侧History/Rules按钮 */}
        <div className={styles.headerRight}>
          <button className={styles.actionBtn} onClick={handleComingSoon}>
            History
          </button>
          <button className={styles.actionBtn} onClick={handleComingSoon}>
            Rules
          </button>
        </div>
      </div>
      {/* poolsContainer 横向按钮组 */}
      <div className={styles.poolsContainer}>
        {prizePools?.map((pool) => (
          <button
            key={pool.id}
            className={classNames(
              styles.poolBtn,
              currentPrizePool?.id === pool.id && styles.poolBtnSelected,
            )}
            onClick={() => setCurrentPrizePool(pool)}
            disabled={currentPrizePool?.id === pool.id}
          >
            {dayjs(pool.start_date).format('MMMM D')} - {dayjs(pool.end_date).format('MMMM D')}
          </button>
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
              {/* 顶部倒计时，仅PROCESSING显示 */}
              {currentPrizePool?.status === PRIZE_POOL_STATUS.PROCESSING && (
                <div className={styles.prizeCountdown}>
                  <ClockIcon className="w-6 h-6 text-blue-400" />
                  <span>Ends in {countdown}</span>
                </div>
              )}
              {/* 中间奖池icon和金额 */}
              <div className="flex flex-col items-center justify-center flex-1">
                <GiftIcon className={styles.prizeIcon} />
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
                  SOL
                </div>
                <div className={styles.prizeLabel}>Prize Pool</div>
              </div>
              {/* 底部参与按钮/状态 */}
              {isJoined || currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING ? (
                <button
                  className={isJoined ? styles.joinedBtn : styles.joinBtn}
                  disabled={isJoined}
                  onClick={isJoined ? undefined : handleJoinButtonClick}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              ) : null}
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

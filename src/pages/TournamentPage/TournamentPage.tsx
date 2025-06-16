import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styles from './Tournament.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeftIcon, ClockIcon } from '@heroicons/react/24/outline'
import { GiftIcon } from '@heroicons/react/24/solid'
import { getHomePath } from '@/navigation/routes.tsx'
import { useQuery } from '@tanstack/react-query'
import { fetchPrizePools, fetchPrizePoolLeaderboard } from '@/utils/mockHelper.ts'
import dayjs from 'dayjs'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

export enum PRIZE_POOL_STATUS {
  END,
  PROCESSING,
  UPCOMING,
}

export interface IPrizePool {
  id: number
  start_date: number
  end_date: number
  price: number
  status: PRIZE_POOL_STATUS
  player_count: number
  user_participated: boolean
  user_card_formation?: Array<number>
  user_deck_power?: number
}

const TournamentPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const [currentPrizePool, setCurrentPrizePool] = React.useState<IPrizePool | undefined>(undefined)

  const { data: prizePools, isLoading: prizePoolsLoading } = useQuery({
    queryKey: ['prizePools'],
    queryFn: fetchPrizePools,
    staleTime: 5 * 60 * 1000,
  })
  useEffect(() => {
    if (!prizePools?.length) return
    setCurrentPrizePool(prizePools.find((p) => p.status === PRIZE_POOL_STATUS.UPCOMING))
  }, [prizePools])

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey:
      currentPrizePool && currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING
        ? ['prizePoolLeaderboard', currentPrizePool.id]
        : [],
    queryFn: () => (currentPrizePool ? fetchPrizePoolLeaderboard(currentPrizePool, userInfo!) : []),
    enabled: !!currentPrizePool && currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING,
    refetchInterval:
      currentPrizePool && currentPrizePool.status === PRIZE_POOL_STATUS.PROCESSING ? 10000 : false,
    staleTime: 0,
  })

  // 模拟用户是否已参与当前奖池
  const [isJoined, setIsJoined] = React.useState(false)

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

  const handleBack = () => {
    navigate(getHomePath())
  }
  const handleComingSoon = () => {
    toast.info('Coming soon')
  }
  const handleJoin = () => {
    setIsJoined(true)
    toast.success('Joined successfully!')
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
            <div className={styles.leaderboardContainer}>
              {/* Leaderboard Title */}
              <div className={styles.leaderboardTitle}>Leaderboard</div>
              {currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING ? (
                <div className={styles.upcomingWrapper}>
                  <ClockIcon className={styles.upcomingIcon} />
                  <span className={styles.upcomingText}>Coming Soon</span>
                  <span className={styles.upcomingSubText}>
                    Please stay tuned for the event start time!
                  </span>
                </div>
              ) : leaderboardLoading ? (
                <div className={styles.loadingWrapper}>
                  <span>Loading...</span>
                </div>
              ) : (
                <>
                  <ul className={styles.leaderboardList}>
                    {leaderboard?.map((user) => (
                      <li key={user.rank} className={styles.leaderboardItem}>
                        <span className={styles.rank}>{user.rank}</span>
                        <img className={styles.avatar} src={user.avatar} alt={user.name} />
                        <span className={styles.username}>{user.name}</span>
                        <span className={styles.deckPower}>{user.deckPower}</span>
                        <span className={styles.prize}>{user.prize.sol.toFixed(2)} SOL</span>
                        <span className={styles.faithCoin}>{user.prize.faithCoin} FC</span>
                      </li>
                    ))}
                  </ul>
                  {/* 当前用户信息条 */}
                  <div className={styles.currentUserBar}>
                    <span className={styles.currentUserRank}>12</span>
                    <img
                      className={styles.currentUserAvatar}
                      src="/src/assets/images/avatars/1.png"
                      alt="You"
                    />
                    <span className={styles.currentUserName}>You</span>
                    <span className={styles.currentUserDeckPower}>1,234</span>
                    <span className={styles.currentUserPrize}>0.00 SOL</span>
                    <span className={styles.currentUserFaithCoin}>0 FC</span>
                  </div>
                </>
              )}
            </div>
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
                <div className={styles.prizeAmount}>{currentPrizePool?.price ?? '--'} SOL</div>
                <div className={styles.prizeLabel}>Prize Pool</div>
              </div>
              {/* 底部参与按钮/状态 */}
              {currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING ? (
                <button
                  className={isJoined ? styles.joinedBtn : styles.joinBtn}
                  disabled={isJoined}
                  onClick={isJoined ? undefined : handleJoin}
                >
                  {isJoined ? 'Joined' : 'Join'}
                </button>
              ) : null}
            </div>
            {/* 右侧和中间后续实现 */}
          </>
        )}
      </div>
    </div>
  )
}
export default observer(TournamentPage)

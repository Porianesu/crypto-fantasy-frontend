import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styles from './Tournament.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getHomePath } from '@/navigation/routes.tsx'
import { useQuery } from '@tanstack/react-query'
import { fetchPrizePools, fetchPrizePoolLeaderboard } from '@/utils/mockHelper.ts'
import dayjs from 'dayjs'

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
}

const TournamentPage: React.FC = () => {
  const navigate = useNavigate()
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
    queryFn: () => (currentPrizePool ? fetchPrizePoolLeaderboard(currentPrizePool) : []),
    enabled: !!currentPrizePool && currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING,
    refetchInterval:
      currentPrizePool && currentPrizePool.status === PRIZE_POOL_STATUS.PROCESSING ? 10000 : false,
    staleTime: 0,
  })

  console.log('leaderboard', leaderboard)

  const handleBack = () => {
    navigate(getHomePath())
  }
  const handleComingSoon = () => {
    toast.info('Coming soon')
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
              {currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING ? (
                <div className={styles.loadingWrapper}>
                  <span>Upcoming</span>
                </div>
              ) : leaderboardLoading ? (
                <div className={styles.loadingWrapper}>
                  <span>Loading...</span>
                </div>
              ) : (
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
              )}
            </div>
            {/* 右侧和中间后续实现 */}
          </>
        )}
      </div>
    </div>
  )
}
export default observer(TournamentPage)

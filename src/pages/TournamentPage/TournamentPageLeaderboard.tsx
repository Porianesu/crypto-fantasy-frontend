import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import styles from './TournamentPageLeaderboard.module.css'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { fetchPrizePoolLeaderboard } from '@/utils/mockHelper.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'

interface ITournamentPageLeaderboardProps {
  currentPrizePool: IPrizePool | undefined
}

const TournamentPageLeaderboard: React.FC<ITournamentPageLeaderboardProps> = ({
  currentPrizePool,
}) => {
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey:
      currentPrizePool && currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING
        ? [
            'prizePoolLeaderboard',
            currentPrizePool.id,
            currentPrizePool.user_participated,
            currentPrizePool.user_deck_power,
          ]
        : [],
    // 传入userInfo参数
    queryFn: () => (currentPrizePool ? fetchPrizePoolLeaderboard(currentPrizePool, userInfo!) : []),
    enabled: !!currentPrizePool && currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING,
    refetchInterval:
      currentPrizePool &&
      currentPrizePool.status === PRIZE_POOL_STATUS.PROCESSING &&
      !currentPrizePool.user_participated
        ? 10000
        : false,
    staleTime: 0,
  })

  // 当前用户排行榜信息
  const currentUserLeaderboardInfo = useMemo(() => {
    if (!leaderboard) return undefined
    return leaderboard.find((item) => item.name === userInfo?.email)
  }, [leaderboard, userInfo?.email])

  return (
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
          <div className={styles.leaderboardListWrapper}>
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
          </div>
          {/* 当前用户信息条 */}
          {currentUserLeaderboardInfo && (
            <div className={styles.currentUserBar}>
              <span className={styles.currentUserRank}>{currentUserLeaderboardInfo.rank}</span>
              <img
                className={styles.currentUserAvatar}
                src={currentUserLeaderboardInfo.avatar}
                alt="You"
              />
              <span className={styles.currentUserName}>{currentUserLeaderboardInfo.name}</span>
              <span className={styles.currentUserDeckPower}>
                {currentUserLeaderboardInfo.deckPower}
              </span>
              <span className={styles.currentUserPrize}>
                {currentUserLeaderboardInfo.prize.sol.toFixed(2)} SOL
              </span>
              <span className={styles.currentUserFaithCoin}>
                {currentUserLeaderboardInfo.prize.faithCoin} FC
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default observer(TournamentPageLeaderboard)

import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef } from 'react'
import styles from './TournamentPageLeaderboard.module.css'
import { ClockIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { fetchPrizePoolLeaderboard } from '@/utils/mockHelper.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'
import classNames from 'classnames'

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

  // 缓存上一次有效的 leaderboard
  const lastLeaderboardRef = useRef<typeof leaderboard>([])
  if (leaderboard && leaderboard.length > 0) {
    lastLeaderboardRef.current = leaderboard
  }
  const displayLeaderboard =
    leaderboard && leaderboard.length > 0 ? leaderboard : lastLeaderboardRef.current

  const renderUserGroup = (user: { group?: string; prize: { sol: number; faithCoin: number } }) => {
    if (!user.group) return null
    let rankPart
    if (['1', '2', '3'].includes(user.group)) {
      rankPart = <div className={styles[`rankImage${user.group}`]}></div>
    } else {
      rankPart = <div className={'mr-auto'}>{user.group}</div>
    }
    return (
      <div className={styles.groupContainer}>
        {rankPart}
        {user.prize.sol ? (
          <>
            <div className={styles.groupPrizeAssetSolImage}></div>
            <div className={styles.groupPrizeAssetSol}>{user.prize.sol.toFixed(2)}</div>
          </>
        ) : null}
        <div className={styles.groupPrizeAssetFaithImage}></div>
        <div className={styles.groupPrizeAssetFaith}>{user.prize.faithCoin}</div>
      </div>
    )
  }

  // 当前用户排行榜信息
  const currentUserLeaderboardInfo = useMemo(() => {
    if (!displayLeaderboard) return undefined
    return displayLeaderboard.find((item) => item.name === userInfo?.email)
  }, [displayLeaderboard, userInfo?.email])

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
      ) : !displayLeaderboard && leaderboardLoading ? (
        <div className={styles.loadingWrapper}>
          <span>Loading...</span>
        </div>
      ) : (
        <>
          <div className={classNames(styles.leaderboardListWrapper, 'no-scrollbar')}>
            <ul className={styles.leaderboardList}>
              {displayLeaderboard?.map((user) => (
                <li key={user.rank} className={styles.leaderboardItem}>
                  {renderUserGroup(user)}
                  <div className={styles.rankUserInfoContainer}>
                    <img className={styles.avatar} src={user.avatar} alt={user.name} />
                    <span className={styles.username}>{user.name}</span>
                    <span className={styles.deckPower}>{`${user.deckPower} power`}</span>
                  </div>
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
                {`${currentUserLeaderboardInfo.deckPower} power`}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}
export default observer(TournamentPageLeaderboard)

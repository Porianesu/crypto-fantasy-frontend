import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import styles from '@/pages/HomePage/Leaderboard.module.css'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import { fetchHomeLeaderboard } from '@/utils/mockHelper.ts'

const Leaderboard: React.FC = () => {
  const {
    appStore: { userInfo, userCardsFormationScore },
  } = useMobxStore()
  const { data, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchHomeLeaderboard,
    refetchInterval: 10000, // 5分钟
    refetchOnWindowFocus: false,
  })

  const leaderboardData = useMemo(() => {
    if (!data || !userInfo) return []
    const finalData = data.concat({
      name: userInfo.email,
      score: userCardsFormationScore,
      avatar: userInfo.avatarUrl,
    })
    return finalData
      .sort((a, b) => b.score - a.score)
      .map((item, idx) => ({ ...item, rank: idx + 1 }))
  }, [data, userCardsFormationScore, userInfo])

  const renderCurrentUserRank = () => {
    if (!userInfo) return null
    const item = leaderboardData.find((item) => item.name === userInfo.email)
    if (!item) return null
    let rankContent: React.ReactNode
    if (item.rank <= 3) {
      rankContent = (
        <div className={classNames(styles.rankContent, styles[`rank${item.rank}`])}></div>
      )
    } else {
      rankContent = item.rank
    }
    return (
      <div className={classNames(styles.leaderboardCurrentUserBar)}>
        <div className={styles.leaderboardRankContainer}>{rankContent}</div>
        <div className={styles.leaderboardInfo}>
          <img alt={'user_avatar'} src={item.avatar} className={styles.leaderboardAvatar}></img>
          <div className={styles.leaderboardUserInfo}>
            <div className={styles.leaderboardUserName}>{item.name}</div>
            <div className={styles.leaderboardUserScore}>
              Score: <span className="text-[#B80001]">{item.score}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className={styles.leaderboardWrapper}>
        <div className={styles.leaderboardTitle}>Leaderboard</div>
        {leaderboardLoading ? (
          <div className={styles.leaderboardLoading}>
            <ArrowPathIcon className={styles.loadingSpinner} />
            <div className={styles.loadingText}>Loading...</div>
          </div>
        ) : (
          <div className={styles.leaderboardContent}>
            {leaderboardData?.map((item) => {
              let rankContent: React.ReactNode
              if (item.rank <= 3) {
                rankContent = (
                  <div className={classNames(styles.rankContent, styles[`rank${item.rank}`])}></div>
                )
              } else {
                rankContent = item.rank
              }
              return (
                <div key={item.rank} className={styles.leaderboardItem}>
                  <div className={styles.leaderboardRankContainer}>{rankContent}</div>
                  <div className={styles.leaderboardInfo}>
                    <img
                      alt={'user_avatar'}
                      src={item.avatar}
                      className={styles.leaderboardAvatar}
                    ></img>
                    <div className={styles.leaderboardUserInfo}>
                      <div className={styles.leaderboardUserName}>{item.name}</div>
                      <div className={styles.leaderboardUserScore}>
                        Score: <span className="text-[#B80001]">{item.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {renderCurrentUserRank()}
      </div>
    </div>
  )
}
export default observer(Leaderboard)

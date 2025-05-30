import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import styles from '@/pages/Leaderboard.module.css'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { StarIcon, SparklesIcon, FireIcon } from '@heroicons/react/24/solid'
import { useQuery } from '@tanstack/react-query'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

// mock异步获取排行榜数据
const fetchLeaderboard = async () => {
  const originalData = Array.from({ length: 20 }).map((_, i) => ({
    name: `用户${i + 1}`,
    score: Math.floor(Math.random() * 10000),
  }))
  return new Promise<Array<{ name: string; score: number }>>((resolve) => {
    setTimeout(() => {
      resolve(originalData)
    }, 1000)
  })
}

const Leaderboard: React.FC = () => {
  const {
    appStore: { userInfo, userCardsFormationScore },
  } = useMobxStore()
  const { data, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 10000, // 5分钟
    refetchOnWindowFocus: false,
  })

  const leaderboardData = useMemo(() => {
    if (!data || !userInfo) return []
    const finalData = data.concat({
      name: userInfo.email,
      score: userCardsFormationScore,
    })
    return finalData
      .sort((a, b) => b.score - a.score)
      .map((item, idx) => ({ ...item, rank: idx + 1 }))
  }, [data, userCardsFormationScore, userInfo])

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
              let rankClass = styles.leaderboardRankNormal
              let icon = null
              if (item.rank === 1) {
                rankClass = styles.leaderboardRankTop1
                icon = (
                  <span className={styles.leaderboardRankIcon}>
                    <StarIcon className="w-6 h-6 text-yellow-400" />
                  </span>
                )
              } else if (item.rank === 2) {
                rankClass = styles.leaderboardRankTop2
                icon = (
                  <span className={styles.leaderboardRankIcon}>
                    <SparklesIcon className="w-6 h-6 text-gray-400" />
                  </span>
                )
              } else if (item.rank === 3) {
                rankClass = styles.leaderboardRankTop3
                icon = (
                  <span className={styles.leaderboardRankIcon}>
                    <FireIcon className="w-6 h-6 text-orange-400" />
                  </span>
                )
              }
              return (
                <div key={item.rank} className={styles.leaderboardItem}>
                  <div className={`${styles.leaderboardRank} ${rankClass} relative`}>
                    {icon}
                    <span className={styles.leaderboardRankText}>{item.rank}</span>
                  </div>
                  <div className={styles.leaderboardInfo}>
                    <div className={styles.leaderboardAvatar}>
                      {/* 这里可替换为真实头像 */}
                      <span className="text-lg text-gray-400">{item.name[2] || 'U'}</span>
                    </div>
                    <div className={styles.leaderboardUserInfo}>
                      <div className={styles.leaderboardUserName}>{item.name}</div>
                      <div className={styles.leaderboardUserScore}>
                        Score: <span className="text-yellow-600 font-bold">{item.score}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
        {/* 当前用户信息绝对定位覆盖底部 */}
        {userInfo && (
          <div className={styles.leaderboardCurrentUserBar}>
            <div className={styles.leaderboardCurrentUserAvatar}>
              {/* 真实头像可替换此处 */}
              <span className="text-lg text-gray-400">{userInfo.email?.[2] || 'U'}</span>
            </div>
            <div className={styles.leaderboardCurrentUserInfo}>
              <div className={styles.leaderboardCurrentUserName}>{userInfo.email}</div>
              <div className={styles.leaderboardCurrentUserScore}>
                Score: <span className="text-yellow-600 font-bold">{userCardsFormationScore}</span>
              </div>
            </div>
            <div className={styles.leaderboardCurrentUserRank}>
              Rank:
              <span className="text-yellow-600 font-bold">
                {leaderboardData.find((item) => item.name === userInfo.email)?.rank || '-'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default observer(Leaderboard)

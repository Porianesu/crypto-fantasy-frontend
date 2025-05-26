import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import styles from '@/pages/Leaderboard.module.css'
import { ArrowPathIcon } from '@heroicons/react/24/outline'

const Leaderboard: React.FC = () => {
  // 排行榜加载态
  const [leaderboardLoading, setLeaderboardLoading] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setLeaderboardLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [])

  // mock排行榜数据
  const leaderboardData = Array.from({ length: 20 }).map((_, i) => ({
    rank: i + 1,
    name: `用户${i + 1}`,
    score: Math.floor(Math.random() * 10000),
  }))

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
            {leaderboardData.map((item) => (
              <div key={item.rank} className={styles.leaderboardItem}>
                <div className={styles.leaderboardRank}>{item.rank}</div>
                <div className={styles.leaderboardInfo}>
                  <span className="font-semibold mr-2">{item.name}</span>
                  <span className="text-gray-500">分数: {item.score}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default observer(Leaderboard)

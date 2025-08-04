import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import styles from '@/pages/HomePage/Leaderboard.module.css'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import API from '@/axios/api.ts'
import { getDefaultAvatar } from '@/utils/common.ts'

const Leaderboard: React.FC = () => {
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const { data, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: API.deckLeaderboard,
    refetchInterval: 10000,
    refetchOnWindowFocus: false,
  })
  const leaderboardData = useMemo(() => {
    return data?.data?.leaderboard
      ? data.data.leaderboard.map((item, index) => ({
          ...item,
          avatar: item.avatar || getDefaultAvatar(index),
        }))
      : []
  }, [data])

  const renderCurrentUserRank = () => {
    if (!userInfo) return null
    if (!data?.data) return null
    let rankContent: React.ReactNode
    if (data.data.myRank <= 3) {
      rankContent = (
        <div className={classNames(styles.rankContent, styles[`rank${data.data.myRank}`])}></div>
      )
    } else {
      rankContent = data.data.myRank
    }
    return (
      <div className={classNames(styles.leaderboardCurrentUserBar)}>
        <div className={styles.leaderboardRankContainer}>{rankContent}</div>
        <div className={styles.leaderboardInfo}>
          <img alt={'user_avatar'} src={userInfo.avatar} className={styles.leaderboardAvatar}></img>
          <div className={styles.leaderboardUserInfo}>
            <div className={styles.leaderboardUserName}>{userInfo.nickname}</div>
            <div className={styles.leaderboardUserScore}>
              Score: <span className="text-[#B80001]">{userInfo.deckPower}</span>
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
            {leaderboardData.map((item, index) => {
              const rank = index + 1
              let rankContent: React.ReactNode
              if (rank <= 3) {
                rankContent = (
                  <div className={classNames(styles.rankContent, styles[`rank${rank}`])}></div>
                )
              } else {
                rankContent = rank
              }
              return (
                <div key={rank} className={styles.leaderboardItem}>
                  <div className={styles.leaderboardRankContainer}>{rankContent}</div>
                  <div className={styles.leaderboardInfo}>
                    <img
                      alt={'user_avatar'}
                      src={item.avatar}
                      className={styles.leaderboardAvatar}
                    ></img>
                    <div className={styles.leaderboardUserInfo}>
                      <div className={styles.leaderboardUserName}>{item.nickname}</div>
                      <div className={styles.leaderboardUserScore}>
                        Score: <span className="text-[#B80001]">{item.deckPower}</span>
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

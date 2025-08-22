import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import styles from './RewardPageCheckInContent.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import dayjs from 'dayjs'
import classNames from 'classnames'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import type { ISignInResponse } from '@/axios/api.ts'

interface IRewardPageCheckInContentProps {
  openRewardResultModal: (data: RewardResultModalData, title?: string) => void
}

const RewardPageCheckInContent: React.FC<IRewardPageCheckInContentProps> = ({
  openRewardResultModal,
}) => {
  const {
    rewardStore: { totalSignInCount, signInStatus, signIn },
  } = useMobxStore()
  const [buttonLoading, setButtonLoading] = useState(false)
  const today = useMemo(() => dayjs(), [])

  const handleSignIn = async () => {
    if (buttonLoading) return
    setButtonLoading(true)
    try {
      const result = (await signIn()) as unknown as ISignInResponse
      if (result.success) {
        openRewardResultModal({
          solAmount: result.reward.solAmount,
          faithAmount: result.reward.faithAmount,
        })
      }
    } catch (error) {
      console.error('Sign-in failed:', error)
    } finally {
      setButtonLoading(false)
    }
  }

  return (
    <div className={styles.contentContainer}>
      <div className={styles.title}>7-Day Check-In</div>
      <div className={styles.count}>
        <span>{totalSignInCount}</span> cumulative check-ins
      </div>
      <div className={styles.description}>Rewards can be claimed at 00:00(UTC) daily.</div>
      <div className={styles.checkInContainer}>
        {signInStatus.length ? (
          signInStatus.map((item) => {
            const targetDate = dayjs(item.date)
            const isToday = targetDate.isSame(today, 'day')
            const todayUnsigned = !item.signed && isToday
            const dayOfWeek = targetDate.format('d')
            const displayDay = dayOfWeek === '0' ? '7' : dayOfWeek // Convert Sunday (0) to 7 for display
            const isAfterToday = targetDate.isAfter(today, 'day')
            return (
              <div
                key={item.date}
                className={classNames(styles.checkInItemContainer, {
                  [styles.checkInItemContainerToday]: isToday,
                  [styles.checkInItemContainerNotToday]: !isToday,
                })}
              >
                <div className={styles.checkInItemDate}>
                  0{displayDay}
                  <span>day</span>
                </div>
                <div
                  className={classNames(
                    styles.checkInItemRewardContainer,
                    styles.checkInItemRewardContainerSol,
                  )}
                >
                  <div className={styles.checkInItemRewardImage}></div>
                  <div className={styles.checkInItemRewardAmount}>{item.reward.solAmount}</div>
                </div>
                <div
                  className={classNames(
                    styles.checkInItemRewardContainer,
                    styles.checkInItemRewardContainerFaith,
                  )}
                >
                  <div className={styles.checkInItemRewardImage}></div>
                  <div className={styles.checkInItemRewardAmount}>{item.reward.faithAmount}</div>
                </div>
                {isAfterToday ? null : (
                  <button
                    className={classNames(styles.claimText, {
                      button: todayUnsigned,
                      [styles.claimTextClaimable]: todayUnsigned,
                      [styles.claimTextNotClaimable]: !todayUnsigned,
                    })}
                    disabled={!todayUnsigned || buttonLoading}
                    onClick={todayUnsigned ? handleSignIn : undefined}
                  >
                    {item.signed ? 'Claimed' : 'Claim'}
                  </button>
                )}
              </div>
            )
          })
        ) : (
          <div>Loading</div>
        )}
      </div>
    </div>
  )
}
export default observer(RewardPageCheckInContent)

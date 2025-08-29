import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import styles from './RewardPageCheckInContent.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import dayjs from 'dayjs'
import classNames from 'classnames'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import type { ISignInResponse } from '@/axios/api.ts'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

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
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const signInItemRefs = useRef<Array<HTMLButtonElement>>([])

  useGSAP(
    () => {
      if (!signInItemRefs.current.length) return
      gsap.fromTo(
        signInItemRefs.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        },
      )
    },
    {
      scope: contentContainerRef,
      dependencies: [],
    },
  )

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
      {signInStatus.length ? (
        <div className={styles.checkInContainer} ref={contentContainerRef}>
          {signInStatus.map((item, index) => {
            const targetDate = dayjs(item.date)
            const isToday = targetDate.isSame(today, 'day')
            const todayUnsigned = !item.signed && isToday
            const dayOfWeek = targetDate.format('d')
            const displayDay = dayOfWeek === '0' ? '7' : dayOfWeek // Convert Sunday (0) to 7 for display
            const isAfterToday = targetDate.isAfter(today, 'day')
            return (
              <button
                key={item.date}
                className={classNames(styles.checkInItemContainer, {
                  [styles.checkInButton]: todayUnsigned,
                  [styles.checkInItemContainerToday]: isToday,
                  [styles.checkInItemContainerNotToday]: !isToday,
                })}
                ref={(el) => {
                  if (el) {
                    signInItemRefs.current[index] = el
                  }
                }}
                disabled={!todayUnsigned || buttonLoading}
                onClick={todayUnsigned ? handleSignIn : undefined}
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
                  <div
                    className={classNames(styles.claimText, {
                      [styles.claimTextClaimable]: todayUnsigned,
                      [styles.claimTextNotClaimable]: !todayUnsigned,
                    })}
                  >
                    {item.signed ? 'Claimed' : isToday ? 'Claim' : 'Expired'}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className={styles.loading}>Loading . . .</div>
      )}
    </div>
  )
}
export default observer(RewardPageCheckInContent)

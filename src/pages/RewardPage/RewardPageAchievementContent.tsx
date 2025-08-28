import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import styles from './RewardPageAchievementContent.module.css'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import {
  ACHIEVEMENT_STATUS,
  type IAchievement,
  type IClaimAchievementResponse,
} from '@/axios/api.ts'
import classNames from 'classnames'
import { Textfit } from 'react-textfit'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface IRewardPageAchievementContentProps {
  openRewardResultModal: (data: RewardResultModalData, title?: string) => void
}

const RewardPageAchievementContent: React.FC<IRewardPageAchievementContentProps> = ({
  openRewardResultModal,
}) => {
  const {
    rewardStore: { achievements, claimAchievement, claimAchievementNetworkFlag },
  } = useMobxStore()
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const achievementContainerRefs = useRef<Array<HTMLDivElement>>([])

  useGSAP(
    () => {
      if (!achievements.length) return
      if (!achievementContainerRefs.current.length) return
      gsap.from(achievementContainerRefs.current, {
        opacity: 0,
        y: 40,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    },
    {
      scope: contentContainerRef,
      dependencies: [achievements.length],
    },
  )

  const renderAchievementStatus = (status: ACHIEVEMENT_STATUS) => {
    switch (status) {
      case ACHIEVEMENT_STATUS.UNCOMPLETED:
        return 'Uncompleted'
      case ACHIEVEMENT_STATUS.COMPLETED:
        return 'Claim'
      case ACHIEVEMENT_STATUS.REWARD_CLAIMED:
        return 'Completed'
      default:
        return 'Uncompleted'
    }
  }

  const handleClaimAchievement = async (achievement: IAchievement) => {
    const result = (await claimAchievement(achievement)) as unknown as IClaimAchievementResponse
    if (result.success) {
      // 显示奖励弹窗
      openRewardResultModal(
        {
          solAmount: achievement.rewardSolAmount,
          faithAmount: achievement.rewardFaithAmount,
        },
        'Achievement Reward',
      )
    }
  }

  return (
    <div className={styles.contentContainer} ref={contentContainerRef}>
      {achievements.length === 0 ? (
        <div className={styles.loadingText}>Loading . . .</div>
      ) : (
        achievements.map((achievement, index) => (
          <div
            key={achievement.id}
            className={styles.achievementContainer}
            ref={(el) => {
              if (el) {
                achievementContainerRefs.current[index] = el
              }
            }}
          >
            <div className={styles.descriptionContainer}>
              <Textfit>
                {achievement.description}
                {achievement.description}
                {achievement.description}
              </Textfit>
            </div>
            <div className={styles.progressContainer}>
              {achievement.progress}/{achievement.target}
            </div>
            <button
              className={classNames(styles.claimButton, {
                button: achievement.status === ACHIEVEMENT_STATUS.COMPLETED,
              })}
              disabled={
                claimAchievementNetworkFlag || achievement.status !== ACHIEVEMENT_STATUS.COMPLETED
              }
              onClick={async () => {
                await handleClaimAchievement(achievement)
              }}
            >
              {renderAchievementStatus(achievement.status)}
            </button>
          </div>
        ))
      )}
    </div>
  )
}
export default observer(RewardPageAchievementContent)

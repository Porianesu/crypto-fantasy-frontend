import { observer } from 'mobx-react-lite'
import React, { type RefObject, useMemo, useRef, useState } from 'react'
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

interface IAchievementItemProps {
  index: number
  achievementContainerRefs: RefObject<HTMLDivElement[]>
  achievement: IAchievement
  handleClaimAchievement: (achievement: IAchievement) => Promise<void>
}

const AchievementItem: React.FC<IAchievementItemProps> = ({
  index,
  achievementContainerRefs,
  achievement,
  handleClaimAchievement,
}) => {
  const renderButtonContent = () => {
    switch (achievement.status) {
      case ACHIEVEMENT_STATUS.REWARD_CLAIMED:
        return 'Claimed'
      case ACHIEVEMENT_STATUS.COMPLETED:
        return (
          <button
            className={classNames(styles.claimButton, {
              button: achievement.status === ACHIEVEMENT_STATUS.COMPLETED,
            })}
            disabled={achievement.status !== ACHIEVEMENT_STATUS.COMPLETED}
            onClick={async () => {
              await handleClaimAchievement(achievement)
            }}
          ></button>
        )
      case ACHIEVEMENT_STATUS.UNCOMPLETED:
        return (
          <div>
            {achievement.progress}/{achievement.target}
          </div>
        )
      default:
        return null
    }
  }
  return (
    <div
      className={classNames(styles.achievementContainer, {
        [styles.achievementContainerClaimed]:
          achievement.status === ACHIEVEMENT_STATUS.REWARD_CLAIMED,
        [styles.achievementContainerCompleted]: achievement.status === ACHIEVEMENT_STATUS.COMPLETED,
        [styles.achievementContainerUncompleted]:
          achievement.status === ACHIEVEMENT_STATUS.UNCOMPLETED,
      })}
      ref={(el) => {
        if (el) {
          achievementContainerRefs.current[index] = el
        }
      }}
    >
      <div className={styles.descriptionWrapper}>
        <Textfit className={styles.descriptionContainer}>{achievement.description}</Textfit>
      </div>
      <div className={styles.rewardWrapper}>
        <div className={classNames(styles.rewardContainer, styles.rewardContainerSol)}>
          {achievement.status === ACHIEVEMENT_STATUS.REWARD_CLAIMED ? (
            <div className={styles.rewardClaimedMask}>Received</div>
          ) : null}
          <div className={styles.rewardImage}></div>
          <div className={styles.rewardAmount}>{achievement.rewardSolAmount}</div>
        </div>
        <div className={classNames(styles.rewardContainer, styles.rewardContainerFaith)}>
          {achievement.status === ACHIEVEMENT_STATUS.REWARD_CLAIMED ? (
            <div className={styles.rewardClaimedMask}>Received</div>
          ) : null}
          <div className={styles.rewardImage}></div>
          <div className={styles.rewardAmount}>{achievement.rewardFaithAmount}</div>
        </div>
      </div>
      <div className={styles.buttonWrapper}>{renderButtonContent()}</div>
    </div>
  )
}

interface IRewardPageAchievementContentProps {
  openRewardResultModal: (data: RewardResultModalData, title?: string) => void
}

const AchievementStatusSortPriority = {
  [ACHIEVEMENT_STATUS.COMPLETED]: 0,
  [ACHIEVEMENT_STATUS.UNCOMPLETED]: 1,
  [ACHIEVEMENT_STATUS.REWARD_CLAIMED]: 2,
}

const RewardPageAchievementContent: React.FC<IRewardPageAchievementContentProps> = ({
  openRewardResultModal,
}) => {
  const {
    rewardStore: { achievements, claimAchievement },
  } = useMobxStore()
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const achievementContainerRefs = useRef<Array<HTMLDivElement>>([])
  const [showOnlyAchieved, setShowOnlyAchieved] = useState<boolean>(false)
  const formattedAchievements = useMemo(() => {
    const filteredAchievements = showOnlyAchieved
      ? achievements.filter(
          (achievements) => achievements.status !== ACHIEVEMENT_STATUS.UNCOMPLETED,
        )
      : achievements
    return filteredAchievements.slice().sort((a, b) => {
      return AchievementStatusSortPriority[a.status] - AchievementStatusSortPriority[b.status] // 按状态权重排序
    })
  }, [achievements, showOnlyAchieved])

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

  const handleFilterButtonClick = () => {
    setShowOnlyAchieved((prevState) => !prevState)
  }

  return (
    <div className={styles.contentContainer} ref={contentContainerRef}>
      <div className={styles.header}>
        <div className={styles.title}>Achievement List</div>
        <div className={styles.headerRightPart}>
          <button
            className={classNames(styles.radioButtonOutside, 'button')}
            onClick={handleFilterButtonClick}
          >
            {showOnlyAchieved ? <div className={styles.radioButtonInside}></div> : null}
          </button>
          <div>Only show achieved</div>
        </div>
      </div>
      <div className={styles.bodyContainer}>
        {achievements.length === 0 ? (
          <div className={styles.loadingText}>Loading . . .</div>
        ) : (
          <div className={styles.body}>
            {formattedAchievements.map((achievement, index) => (
              <AchievementItem
                key={achievement.id}
                index={index}
                achievementContainerRefs={achievementContainerRefs}
                achievement={achievement}
                handleClaimAchievement={handleClaimAchievement}
              ></AchievementItem>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
export default observer(RewardPageAchievementContent)

import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './RewardPageAchievementContent.module.css'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import {
  ACHIEVEMENT_STATUS,
  type IAchievement,
  type IClaimAchievementResponse,
} from '@/axios/api.ts'
import classNames from 'classnames'

interface IRewardPageAchievementContentProps {
  openRewardResultModal: (data: RewardResultModalData, title?: string) => void
}

const RewardPageAchievementContent: React.FC<IRewardPageAchievementContentProps> = ({
  openRewardResultModal,
}) => {
  const {
    rewardStore: { achievements, claimAchievement, claimAchievementNetworkFlag },
  } = useMobxStore()

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
    <div className={styles.contentContainer}>
      {achievements.length === 0 ? (
        <div>Loading . . .</div>
      ) : (
        achievements.map((achievement) => (
          <div key={achievement.id} className={'flex items-center justify-between'}>
            <div>
              <div>
                {achievement.type}-{achievement.subType}
              </div>
              <div>{achievement.description}</div>
            </div>
            <div>
              {achievement.progress}/{achievement.target}
            </div>
            <button
              className={classNames({
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

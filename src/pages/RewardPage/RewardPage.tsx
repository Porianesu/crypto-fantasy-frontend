import { observer } from 'mobx-react-lite'
import React, { Suspense, useMemo, useState } from 'react'
import CommonPageLayout, { type CommonPageLayoutTab } from '@/components/CommonPageLayout.tsx'
import {
  CalendarDaysIcon,
  EnvelopeOpenIcon,
  StarIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline'
import styles from './RewardPage.module.css'
import RewardModalCheckInContent from '@/pages/RewardPage/RewardPageCheckInContent.tsx'
import classNames from 'classnames'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import RewardPageAchievementsContent from '@/pages/RewardPage/RewardPageAchievementsContent.tsx'
import RewardPageInviteContent from '@/pages/RewardPage/RewardPageInviteContent.tsx'
import RewardPageTasksContent from '@/pages/RewardPage/RewardPageTasksContent.tsx'

const RewardResultModal = React.lazy(() => import('@/components/RewardResultModal.tsx'))

const RewardPage: React.FC = () => {
  const {
    preloadStore: { audioInstanceMap },
    rewardStore: {
      isCheckInRewardAvailable,
      isAchievementRewardAvailable,
      isReferralRewardAvailable,
    },
  } = useMobxStore()
  const Tabs = useMemo<Array<CommonPageLayoutTab>>(
    () => [
      {
        label: 'Check in',
        key: 'check_in',
        icon: (className: string) => <CalendarDaysIcon className={className} />,
        showRedDot: isCheckInRewardAvailable,
      },
      {
        label: 'Achievements',
        key: 'achievements',
        icon: (className: string) => <StarIcon className={className} />,
        showRedDot: isAchievementRewardAvailable,
      },
      {
        label: 'Referral',
        key: 'invite',
        icon: (className: string) => <EnvelopeOpenIcon className={className} />,
        showRedDot: isReferralRewardAvailable,
      },
      {
        label: 'Tasks',
        key: 'tasks',
        icon: (className: string) => <ClipboardDocumentCheckIcon className={className} />,
        showRedDot: false,
      },
    ],
    [isAchievementRewardAvailable, isCheckInRewardAvailable, isReferralRewardAvailable],
  )
  const [selectedTab, setSelectedTab] = useState<string>(Tabs[0].key)
  const [rewardResultModalVisible, setRewardResultModalVisible] = useState<boolean>(false)
  const [rewardResultModalData, setRewardResultModalData] = useState<RewardResultModalData>({})
  const [rewardResultModalTitle, setRewardResultModalTitle] = useState<string>(
    'Congratulations! You got rewards!',
  )
  const successSound = audioInstanceMap.get(AudioInstanceId.CraftSuccessSound)

  const openRewardResultModal = (data: RewardResultModalData, title?: string) => {
    if (successSound) {
      successSound.play({
        volume: 1,
      })
    }
    setRewardResultModalData(data)
    if (title) {
      setRewardResultModalTitle(title)
    }
    setRewardResultModalVisible(true)
  }

  const renderContent = () => {
    switch (selectedTab) {
      case 'achievements':
        return (
          <RewardPageAchievementsContent
            openRewardResultModal={openRewardResultModal}
          ></RewardPageAchievementsContent>
        )
      case 'check_in':
        return (
          <RewardModalCheckInContent
            openRewardResultModal={openRewardResultModal}
          ></RewardModalCheckInContent>
        )
      case 'invite':
        return (
          <RewardPageInviteContent
            openRewardResultModal={openRewardResultModal}
          ></RewardPageInviteContent>
        )
      case 'tasks':
        return (
          <RewardPageTasksContent
            openRewardResultModal={openRewardResultModal}
          ></RewardPageTasksContent>
        )
      default:
        return null
    }
  }

  return (
    <CommonPageLayout
      title={'Reward'}
      Tabs={Tabs}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      containerClassName={styles.pageContainer}
    >
      <div
        className={classNames(styles.body, {
          [styles.bodyCheckIn]: selectedTab === 'check_in',
          [styles.bodyAchievement]: selectedTab === 'achievements' || selectedTab === 'tasks',
          [styles.bodyInvite]: selectedTab === 'invite',
        })}
      >
        {renderContent()}
      </div>
      <Suspense fallback={null}>
        <RewardResultModal
          open={rewardResultModalVisible}
          onOpenChange={setRewardResultModalVisible}
          title={rewardResultModalTitle}
          reward={rewardResultModalData}
        ></RewardResultModal>
      </Suspense>
    </CommonPageLayout>
  )
}
export default observer(RewardPage)

import { observer } from 'mobx-react-lite'
import React, { Suspense, useState } from 'react'
import CommonPageLayout from '@/components/CommonPageLayout.tsx'
import { CalendarDaysIcon, StarIcon } from '@heroicons/react/24/outline'
import styles from './RewardPage.module.css'
import RewardModalCheckInContent from '@/pages/RewardPage/RewardPageCheckInContent.tsx'
import classNames from 'classnames'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import RewardPageAchievementContent from '@/pages/RewardPage/RewardPageAchievementContent.tsx'

const RewardResultModal = React.lazy(() => import('@/components/RewardResultModal.tsx'))

const Tabs = [
  {
    label: 'Achievements',
    key: 'achievements',
    icon: (className: string) => <StarIcon className={className} />,
  },
  {
    label: 'Check in',
    key: 'check_in',
    icon: (className: string) => <CalendarDaysIcon className={className} />,
  },
  // {
  //   label: 'Invite',
  //   key: 'invite',
  //   icon: (className: string) => <EnvelopeOpenIcon className={className} />,
  // },
]

const RewardPage: React.FC = () => {
  const {
    preloadStore: { audioInstanceMap },
  } = useMobxStore()
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
          <RewardPageAchievementContent
            openRewardResultModal={openRewardResultModal}
          ></RewardPageAchievementContent>
        )
      case 'check_in':
        return (
          <RewardModalCheckInContent
            openRewardResultModal={openRewardResultModal}
          ></RewardModalCheckInContent>
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
          [styles.bodyAchievement]: selectedTab === 'achievements',
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

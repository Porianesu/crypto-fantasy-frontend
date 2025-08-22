import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import CommonPageLayout from '@/components/CommonPageLayout.tsx'
import { EnvelopeOpenIcon, CalendarDaysIcon } from '@heroicons/react/24/outline'

const Tabs = [
  {
    label: 'Invite',
    key: 'invite',
    icon: (className: string) => <EnvelopeOpenIcon className={className} />,
  },
  {
    label: 'Check in',
    key: 'check_in',
    icon: (className: string) => <CalendarDaysIcon className={className} />,
  },
]

const RewardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>(Tabs[0].key)

  return (
    <CommonPageLayout
      title={'Reward'}
      Tabs={Tabs}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
    >
      <div>123</div>
    </CommonPageLayout>
  )
}
export default observer(RewardPage)

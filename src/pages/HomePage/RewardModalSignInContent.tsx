import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import styles from './RewardModalSignInContent.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import dayjs from 'dayjs'
import classNames from 'classnames'

interface IRewardModalSignInContentProps {
  open: boolean
}

const RewardModalSignInContent: React.FC<IRewardModalSignInContentProps> = () => {
  const {
    rewardStore: { signInStatus, signIn },
  } = useMobxStore()
  const [buttonLoading, setButtonLoading] = useState(false)
  const today = useMemo(() => dayjs(), [])

  const handleSignIn = async () => {
    if (buttonLoading) return
    setButtonLoading(true)
    try {
      await signIn()
    } catch (error) {
      console.error('Sign-in failed:', error)
    } finally {
      setButtonLoading(false)
    }
  }

  return (
    <div className={styles.contentContainer}>
      {signInStatus.length ? (
        signInStatus.map((item) => {
          const todayUnsigned = !item.signed && dayjs(item.date).isSame(today, 'day')
          return (
            <div key={item.date}>
              <div>{dayjs(item.date).format('YYYY-MM-DD')}</div>
              <div>
                {item.reward.solAmount}-{item.reward.faithAmount}
              </div>
              <button
                className={classNames({
                  button: todayUnsigned,
                })}
                disabled={!todayUnsigned}
                onClick={todayUnsigned ? handleSignIn : undefined}
              >
                {item.signed ? 'Signed' : 'Unsigned'}
              </button>
            </div>
          )
        })
      ) : (
        <div>Loading</div>
      )}
    </div>
  )
}
export default observer(RewardModalSignInContent)

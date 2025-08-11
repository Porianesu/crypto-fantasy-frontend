import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './RewardModalSignInContent.module.css'

interface IRewardModalSignInContentProps {
  open: boolean
}

const RewardModalSignInContent: React.FC<IRewardModalSignInContentProps> = () => {
  return <div className={styles.contentContainer}>123</div>
}
export default observer(RewardModalSignInContent)

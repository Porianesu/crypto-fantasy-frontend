import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './Tournament.module.css'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getHomePath } from '@/navigation/routes.tsx'

export enum PRIZE_POOL_STATUS {
  END,
  PROCESSING,
  UPCOMING,
}

export interface IPrizePool {
  id: number
  start_date: number
  end_date: number
  price: number
  status: PRIZE_POOL_STATUS
}

const TournamentPage: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => {
    navigate(getHomePath())
  }
  const handleComingSoon = () => {
    toast.info('Coming soon')
  }
  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        {/* 左侧返回按钮 */}
        <div className={styles.headerLeft}>
          <button className={styles.backBtn} onClick={handleBack}>
            <ArrowLeftIcon className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        {/* 中间Bronze/Silver/Gold按钮 */}
        <div className={styles.headerCenter}>
          <button className={classNames(styles.tierBtn, styles.tierBtnSelected)} disabled>
            Bronze
          </button>
          <button className={styles.tierBtn} disabled>
            Silver
          </button>
          <button className={styles.tierBtn} disabled>
            Gold
          </button>
        </div>
        {/* 右侧History/Rules按钮 */}
        <div className={styles.headerRight}>
          <button className={styles.actionBtn} onClick={handleComingSoon}>
            History
          </button>
          <button className={styles.actionBtn} onClick={handleComingSoon}>
            Rules
          </button>
        </div>
      </div>
      {/* body部分后续实现 */}
      <div className={styles.body}></div>
    </div>
  )
}
export default observer(TournamentPage)

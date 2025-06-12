import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './Tournament.module.css'

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
  return <div className={styles.pageContainer}>TournamentPage</div>
}
export default observer(TournamentPage)

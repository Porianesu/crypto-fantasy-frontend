import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './Tournament.module.css'

const TournamentPage: React.FC = () => {
  return <div className={styles.pageContainer}>TournamentPage</div>
}
export default observer(TournamentPage)

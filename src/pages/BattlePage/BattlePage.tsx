import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './BattlePage.module.css'
import { useNavigate } from 'react-router-dom'
import { getTournamentPath } from '@/navigation/routes.tsx'

const BattlePage: React.FC = () => {
  const navigate = useNavigate()
  const handleTournamentClick = () => {
    navigate(getTournamentPath())
  }
  return (
    <div className={styles.pageContainer}>
      123123
      <button onClick={handleTournamentClick}>click</button>
    </div>
  )
}
export default observer(BattlePage)

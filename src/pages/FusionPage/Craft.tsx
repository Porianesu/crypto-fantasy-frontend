import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './Craft.module.css'

const Craft: React.FC = () => {
  return (
    <div className={styles.bodyContainer}>
      <div className={styles.checklistContainer}></div>
      <div></div>
      <div></div>
    </div>
  )
}
export default observer(Craft)

import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './Craft.module.css'
import classNames from 'classnames'

const Craft: React.FC = () => {
  return (
    <div className={styles.bodyContainer}>
      <div className={styles.checklistContainer}></div>
      <div className={styles.middleContainer}>
        <div className={styles.magicContainer}></div>
        <button className={classNames(styles.craftButton, 'button text-shadow')}>
          Craft 256<div className={styles.assetIcon}></div>
        </button>
      </div>
      <div className={styles.additiveContainer}></div>
    </div>
  )
}
export default observer(Craft)

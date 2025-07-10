import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './Melt.module.css'

const Melt: React.FC = () => {
  return <div className={styles.bodyContainer}></div>
}
export default observer(Melt)

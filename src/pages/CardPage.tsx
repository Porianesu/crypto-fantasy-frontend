import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from '@/pages/CardPage.module.css'

const CardPage: React.FC = () => {
  return <div className={styles.pageContainer}></div>
}
export default observer(CardPage)

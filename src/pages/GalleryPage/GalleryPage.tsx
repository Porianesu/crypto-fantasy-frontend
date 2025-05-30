import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './GalleryPage.module.css'
import { useParams } from 'react-router-dom'

const GalleryPage: React.FC = () => {
  const { cardId } = useParams()

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}></div>
      <div className={styles.pageBody}></div>
    </div>
  )
}
export default observer(GalleryPage)

import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './GalleryPage.module.css'

const GalleryPage: React.FC = () => {
  return <div className={styles.pageContainer}></div>
}
export default observer(GalleryPage)

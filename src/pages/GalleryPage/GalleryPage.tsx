import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './GalleryPage.module.css'
import { useParams } from 'react-router-dom'

const GalleryPage: React.FC = () => {
  const { cardId } = useParams()

  console.log('GalleryPage cardId:', cardId)

  return <div className={styles.pageContainer}></div>
}
export default observer(GalleryPage)

import { observer } from 'mobx-react-lite'
import React, { useLayoutEffect } from 'react'
import styles from './GeneratedImage.module.css'
import type { IGenerateImage } from '@/axios/api.ts'
import dayjs from 'dayjs'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { PhotoIcon, PencilSquareIcon } from '@heroicons/react/24/outline'

interface IGeneratedImageProps {
  image: IGenerateImage
}

const GeneratedImage: React.FC<IGeneratedImageProps> = ({ image }) => {
  const {
    cardGenerateStore: { fetchSingleImageById, generatedImageCache },
  } = useMobxStore()
  const cachedImageUrl = generatedImageCache.get(image.id)

  useLayoutEffect(() => {
    fetchSingleImageById(image.id)
  }, [fetchSingleImageById, image.id])

  return (
    <div className={styles.card} role="button" tabIndex={0}>
      {cachedImageUrl ? (
        <div className={styles.toolsContainer}>
          <button type="button" aria-label="Edit image" title="Edit" className={styles.editButton}>
            <PencilSquareIcon className={styles.editButtonIcon} aria-hidden="true" />
          </button>
        </div>
      ) : null}
      <div className={styles.thumbWrap}>
        {cachedImageUrl ? (
          <img
            src={cachedImageUrl}
            alt={`image-${image.id}`}
            className={styles.thumb}
            loading="lazy"
          />
        ) : (
          <div className={styles.imageLoading}>
            <div className={styles.imageLoadingBox}>
              <PhotoIcon className={styles.placeholderIcon} />
            </div>
          </div>
        )}
      </div>
      <div className={styles.cardMeta}>
        <div className={styles.cardSub}>{dayjs(image.createdAt).format('YYYY-MM-DD HH:mm:ss')}</div>
      </div>
    </div>
  )
}
export default observer(GeneratedImage)

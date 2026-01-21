import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'
import styles from './CardGenerateHistoryPage.module.css'
import { useMobxStore } from '@/stores/StoreProvider'
import GeneratedImage from '@/pages/CardGeneratePage/GeneratedImage.tsx'
import classNames from 'classnames'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { useNavigate } from 'react-router-dom'

const CardGenerateHistoryPage: React.FC = () => {
  const {
    cardGenerateStore: { userGallery, initUserGallery, galleryPagination, changeGalleryPagination },
  } = useMobxStore()
  const navigate = useNavigate()
  const totalPages = Math.max(1, Math.ceil(galleryPagination.total / galleryPagination.limit))
  // clamp page when items change
  const currentPage = Math.min(Math.max(1, galleryPagination.page), totalPages)

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * galleryPagination.limit
    return userGallery.slice(start, start + galleryPagination.limit)
  }, [currentPage, galleryPagination.limit, userGallery])

  const handleBack = () => navigate(-1)

  useEffect(() => {
    initUserGallery()
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button
          type="button"
          aria-label="Go back"
          title="Go back"
          className={styles.backButton}
          onClick={handleBack}
        >
          Back
          <ArrowLeftIcon className={styles.backButtonIcon}></ArrowLeftIcon>
        </button>
        <div className={styles.title}>Gallery History</div>
      </div>

      <div className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Your creations</div>
          {/*scrollable grid area */}
          <div
            className={classNames(styles.gridWrap, {
              [styles.gridWrapNotData]: pagedItems.length === 0,
            })}
          >
            {pagedItems.length === 0 ? (
              <div className={styles.placeholder}>
                <div className={styles.placeholderTitle}>No images yet</div>
                <div className={styles.placeholderText}>
                  Create some images and they'll appear here.
                </div>
              </div>
            ) : (
              <div className={styles.grid}>
                {pagedItems.map((it) => (
                  <GeneratedImage key={it.id} image={it}></GeneratedImage>
                ))}
              </div>
            )}
          </div>
          {/* paginator */}
          <div className={styles.paginator}>
            <button
              className={styles.pageButton}
              onClick={() =>
                changeGalleryPagination({
                  page: Math.max(1, currentPage - 1),
                })
              }
              disabled={currentPage <= 1}
            >
              Prev
            </button>

            <div className={styles.pageInfo}>
              Page {currentPage} of {totalPages}
            </div>

            <button
              className={styles.pageButton}
              onClick={() =>
                changeGalleryPagination({
                  page: Math.min(totalPages, currentPage + 1),
                })
              }
              disabled={currentPage >= totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default observer(CardGenerateHistoryPage)

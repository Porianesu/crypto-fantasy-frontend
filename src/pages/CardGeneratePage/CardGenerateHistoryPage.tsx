import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo } from 'react'
import styles from './CardGenerateHistoryPage.module.css'
import { useMobxStore } from '@/stores/StoreProvider'

const CardGenerateHistoryPage: React.FC = () => {
  const {
    cardGenerateStore: { userGallery, initUserGallery, galleryPagination, changeGalleryPagination },
  } = useMobxStore()
  const totalPages = Math.max(1, Math.ceil(galleryPagination.total / galleryPagination.page))
  // clamp page when items change
  const currentPage = Math.min(Math.max(1, galleryPagination.page), totalPages)

  const pagedItems = useMemo(() => {
    const start = (currentPage - 1) * galleryPagination.page
    return userGallery.slice(start, start + galleryPagination.page)
  }, [currentPage, galleryPagination.page, userGallery])

  useEffect(() => {
    initUserGallery()
  }, [])

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.title}>Gallery History</div>
        <div className={styles.subtitle}>
          Browse the images you have created. Click any thumbnail to preview in the generator.
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.panel}>
          <div className={styles.panelTitle}>Your creations</div>
          {/*scrollable grid area */}
          <div className={styles.gridWrap}>
            {pagedItems.length === 0 ? (
              <div className={styles.placeholder}>
                <div className={styles.placeholderTitle}>No images yet</div>
                <div className={styles.placeholderText}>
                  Create some images and they'll appear here.
                </div>
              </div>
            ) : (
              <div className={styles.grid}>
                {pagedItems.map(
                  () => null,
                  // <div key={it.id ?? it.url} className={styles.card} role="button" tabIndex={0}>
                  //   <div className={styles.thumbWrap}>
                  //     <img
                  //       src={it.url}
                  //       alt={it.name ?? 'image'}
                  //       className={styles.thumb}
                  //       loading="lazy"
                  //     />
                  //   </div>
                  //   <div className={styles.cardMeta}>
                  //     <div className={styles.cardTitle}>{it.name ?? 'Untitled'}</div>
                  //     <div className={styles.cardSub}>{it.createdAt ?? ''}</div>
                  //   </div>
                  // </div>
                )}
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

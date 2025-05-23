import { observer } from 'mobx-react-lite'
import React, { Suspense, useEffect, useRef } from 'react'
import styles from './EntrancePage.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import { checkIsAuth } from '@/utils/common.ts'
const LoginModal = React.lazy(() => import('@/components/LoginModal.tsx'))

const EntrancePage: React.FC = () => {
  const {
    appStore: { initData, preloadProgress },
    modalStore: { changeLoginModalVisible },
  } = useMobxStore()
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarContainerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const startButtonRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    initData()
  }, [])

  useGSAP(
    () => {
      gsap.killTweensOf(progressBarRef.current)
      gsap.to(progressBarRef.current, {
        width: `${preloadProgress * 100}%`,
        duration: 0.1,
        ease: 'power2.out',
      })
      if (preloadProgress === 1) {
        const tl = gsap.timeline()
        tl.to(progressBarContainerRef.current, {
          autoAlpha: 0,
          duration: 0.5,
        })
          .to(startButtonRef.current, {
            autoAlpha: 1,
            duration: 0.5,
            onComplete: () => {
              gsap.set(progressBarContainerRef.current, {
                zIndex: -1,
              })
            },
          })
          .to(startButtonRef.current, {
            scale: 1.1,
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: 'power1.inOut',
          })
      }
    },
    {
      dependencies: [preloadProgress],
      scope: containerRef,
    },
  )

  const handleStartButtonClick = () => {
    if (checkIsAuth()) {
      return navigate(getHomePath())
    }
    changeLoginModalVisible(true)
  }

  return (
    <div className={styles.pageContainer} ref={containerRef}>
      <div className={styles.title}>Crypto Fantasy</div>
      <div className={styles.loadingPart}>
        <div className={styles.progressBarContainer} ref={progressBarContainerRef}>
          <div ref={progressBarRef} className={styles.progressBar} />
        </div>
        <div
          ref={startButtonRef}
          className={classNames(styles.startButton)}
          onClick={handleStartButtonClick}
        >
          {'Start the game'}
        </div>
      </div>
      <Suspense fallback={null}>
        <LoginModal></LoginModal>
      </Suspense>
    </div>
  )
}
export default observer(EntrancePage)

import { observer } from 'mobx-react-lite'
import React, { Suspense, useEffect, useRef } from 'react'
import styles from './EntrancePage.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
const LoginModal = React.lazy(() => import('@/pages/EntrancePage/LoginModal.tsx'))

const EntrancePage: React.FC = () => {
  const {
    preloadStore: { preloadProgress, audioInstanceMap },
    appStore: { initData, userInfo },
    modalStore: { changeLoginModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const bgmSound = audioInstanceMap.get(AudioInstanceId.BGM)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarWrapperRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const startButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initData()
  }, [])

  useGSAP(
    () => {
      gsap.killTweensOf(progressBarRef.current)
      gsap.to(progressBarRef.current, {
        x: `${(preloadProgress - 1) * 100}%`,
        duration: 0.1,
        ease: 'power2.out',
      })
      if (preloadProgress === 1) {
        const tl = gsap.timeline()
        tl.to(progressBarWrapperRef.current, {
          autoAlpha: 0,
          duration: 0.5,
        })
          .to(startButtonRef.current, {
            autoAlpha: 1,
            duration: 0.5,
            onComplete: () => {
              gsap.set(progressBarWrapperRef.current, {
                zIndex: -1,
              })
            },
          })
          .to(startButtonRef.current, {
            scale: 1.2,
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
    if (bgmSound) {
      bgmSound.play({
        loop: -1,
        volume: 0.3,
      })
    }
    if (userInfo?.email) {
      navigate(getHomePath())
    } else {
      changeLoginModalVisible(true)
    }
  }

  return (
    <div className={styles.pageContainer} ref={containerRef}>
      <div className={styles.title}></div>
      <div className={styles.loadingPart}>
        <div className={styles.progressBarWrapper} ref={progressBarWrapperRef}>
          <div className={styles.progressBarContainer}>
            <div ref={progressBarRef} className={styles.progressBar} />
          </div>
        </div>
        <div
          ref={startButtonRef}
          className={classNames(styles.startButton)}
          onClick={handleStartButtonClick}
        ></div>
      </div>
      <Suspense fallback={null}>
        <LoginModal></LoginModal>
      </Suspense>
    </div>
  )
}
export default observer(EntrancePage)

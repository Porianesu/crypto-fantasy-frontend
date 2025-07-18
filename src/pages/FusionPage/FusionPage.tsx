import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import styles from './FusionPage.module.css'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import Craft from '@/pages/FusionPage/Craft.tsx'
import Melt from '@/pages/FusionPage/Melt.tsx'
import { gsap } from 'gsap'
import PreloadElement, { type IPreloadElementHandle } from '@/components/PreloadElement.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { toast } from 'react-toastify'

enum FUSION_PAGE_TYPE {
  CRAFT = 'craft',
  MELT = 'melt',
}

const PageType = [
  {
    key: FUSION_PAGE_TYPE.CRAFT,
    label: 'Craft',
  },
  {
    key: FUSION_PAGE_TYPE.MELT,
    label: 'Melt',
  },
]

const FusionPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const [pageType, setPageType] = useState<FUSION_PAGE_TYPE>(FUSION_PAGE_TYPE.CRAFT)
  const [craftRender, setCraftRender] = useState(true)
  const craftRenderRef = useRef<HTMLDivElement>(null)
  const [meltRender, setMeltRender] = useState(false)
  const meltRenderRef = useRef<HTMLDivElement>(null)
  const isAnimationRunning = useRef(false)
  const videoRef = useRef<IPreloadElementHandle>(null)

  const handleBack = () => {
    navigate(getHomePath())
  }

  const handlePageTypeChange = (type: FUSION_PAGE_TYPE) => {
    if (isAnimationRunning.current) return
    const tl = gsap.timeline({
      onStart: () => {
        isAnimationRunning.current = true
        setMeltRender(true)
        setCraftRender(true)
      },
      onComplete: () => {
        setCraftRender(type === FUSION_PAGE_TYPE.CRAFT)
        setMeltRender(type === FUSION_PAGE_TYPE.MELT)
        setPageType(type)
        isAnimationRunning.current = false
      },
    })
    if (type === FUSION_PAGE_TYPE.CRAFT) {
      tl.to(craftRenderRef.current, {
        xPercent: 0,
        duration: 0.4,
      }).to(
        meltRenderRef.current,
        {
          xPercent: 0,
          duration: 0.4,
        },
        '0',
      )
    } else {
      tl.to(meltRenderRef.current, {
        xPercent: -100,
        duration: 0.4,
      }).to(
        craftRenderRef.current,
        {
          xPercent: -100,
          duration: 0.4,
        },
        '0',
      )
    }
  }

  const playMeltCardVideo = () => {
    return new Promise<void>((resolve, reject) => {
      if (videoRef.current) {
        gsap.set(videoRef.current.getContainer(), {
          zIndex: 20,
          width: '100%',
          height: '100%',
        })
        gsap.to(videoRef.current.getContainer(), {
          autoAlpha: 1,
          duration: 0.3,
          onStart: () => {
            const videoEl = videoRef.current!.getElement() as HTMLVideoElement
            videoEl.loop = false
            videoEl.onended = () => {
              gsap.to(videoRef.current!.getContainer(), {
                autoAlpha: 0,
                duration: 0.3,
                onStart: () => {
                  gsap.set(videoRef.current!.getContainer(), { zIndex: -1 })
                  resolve()
                },
              })
            }
            videoEl.play()
          },
        })
      } else {
        reject(new Error('Video element not found'))
      }
    })
  }

  const comingSoon = () => {
    toast.info('Coming Soon!')
  }

  return (
    <div className={classNames(styles.pageContainer)}>
      <PreloadElement
        ref={videoRef}
        id={'meltCardVideo'}
        className={styles.videoContainer}
      ></PreloadElement>
      <div className={styles.header}>
        <button className={classNames(styles.backButton, 'button')} onClick={handleBack}></button>
        <div className={styles.typeButtons}>
          {PageType.map((item) => (
            <button
              key={item.key}
              onClick={() => handlePageTypeChange(item.key)}
              className={classNames(
                styles.typeButton,
                {
                  [styles.typeButtonActive]: pageType === item.key,
                },
                'button text-shadow',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className={styles.headerRight}>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon1}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.solAmount || 0}</span>
            <div className={styles.assetPlusButton} onClick={comingSoon}></div>
          </div>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon2}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.faithAmount || 0}</span>
            <div className={styles.assetPlusButton} onClick={comingSoon}></div>
          </div>
        </div>
      </div>
      <div className={styles.swipeContainer}>
        <div
          className={classNames(styles.swipeSlideContainer, styles.craftPageContainer)}
          ref={craftRenderRef}
        >
          {craftRender ? <Craft></Craft> : null}
        </div>
        <div
          className={classNames(styles.swipeSlideContainer, styles.meltPageContainer)}
          ref={meltRenderRef}
        >
          {meltRender ? (
            <>
              <div className={styles.meltBackground}></div>
              <Melt playMeltCardVideo={playMeltCardVideo}></Melt>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default observer(FusionPage)

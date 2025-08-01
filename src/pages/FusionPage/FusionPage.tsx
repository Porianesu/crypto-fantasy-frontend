import { observer } from 'mobx-react-lite'
import React, { Suspense, useRef, useState } from 'react'
import styles from './FusionPage.module.css'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import Craft from '@/pages/FusionPage/Craft.tsx'
import Melt from '@/pages/FusionPage/Melt.tsx'
import { gsap } from 'gsap'
import PreloadElement, { type IPreloadElementHandle } from '@/components/PreloadElement.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { AudioInstanceId } from '@/stores/preload-store.ts'

const RedeemCodeModal = React.lazy(() => import('@/components/RedeemCodeModal.tsx'))

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
    preloadStore: { audioInstanceMap },
    appStore: { userInfo },
  } = useMobxStore()
  const [redeemCodeModalVisible, setRedeemCodeModalVisible] = useState(false)
  const bgmSound = audioInstanceMap.get(AudioInstanceId.BGM)
  const craftSound = audioInstanceMap.get(AudioInstanceId.CraftSound)
  const meltSound = audioInstanceMap.get(AudioInstanceId.MeltSound)
  const [pageType, setPageType] = useState<FUSION_PAGE_TYPE>(FUSION_PAGE_TYPE.CRAFT)
  const [craftRender, setCraftRender] = useState(true)
  const craftRenderRef = useRef<HTMLDivElement>(null)
  const [meltRender, setMeltRender] = useState(false)
  const meltRenderRef = useRef<HTMLDivElement>(null)
  const isAnimationRunning = useRef(false)
  const meltVideoRef = useRef<IPreloadElementHandle>(null)
  const craftVideoRef = useRef<IPreloadElementHandle>(null)

  const openRedeemCodeModal = () => {
    setRedeemCodeModalVisible(true)
  }

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
      if (meltVideoRef.current) {
        gsap.set(meltVideoRef.current.getContainer(), {
          zIndex: 20,
          width: '100%',
          height: '100%',
        })
        gsap.to(meltVideoRef.current.getContainer(), {
          autoAlpha: 1,
          duration: 0.3,
          onStart: () => {
            const videoEl = meltVideoRef.current!.getElement() as HTMLVideoElement
            videoEl.loop = false
            videoEl.onended = () => {
              if (bgmSound) {
                bgmSound.volume = 0.5
              }
              gsap.to(meltVideoRef.current!.getContainer(), {
                autoAlpha: 0,
                duration: 0.3,
                onStart: () => {
                  gsap.set(meltVideoRef.current!.getContainer(), { zIndex: -1 })
                  resolve()
                },
              })
            }
            if (bgmSound) {
              bgmSound.volume = 0.2
            }
            if (meltSound) {
              meltSound.play({
                volume: 1,
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

  const playCraftCardVideo = () => {
    return new Promise<void>((resolve, reject) => {
      if (craftVideoRef.current) {
        gsap.set(craftVideoRef.current.getContainer(), {
          zIndex: 20,
          width: '100%',
          height: '100%',
        })
        gsap.to(craftVideoRef.current.getContainer(), {
          autoAlpha: 1,
          duration: 0.3,
          onStart: () => {
            const videoEl = craftVideoRef.current!.getElement() as HTMLVideoElement
            videoEl.loop = false
            videoEl.onended = () => {
              if (bgmSound) {
                bgmSound.volume = 0.5
              }
              gsap.to(craftVideoRef.current!.getContainer(), {
                autoAlpha: 0,
                duration: 0.3,
                onStart: () => {
                  gsap.set(craftVideoRef.current!.getContainer(), { zIndex: -1 })
                  resolve()
                },
              })
            }
            if (bgmSound) {
              bgmSound.volume = 0.2
            }
            if (craftSound) {
              craftSound.play({
                volume: 1,
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

  return (
    <div className={classNames(styles.pageContainer)}>
      <PreloadElement
        ref={meltVideoRef}
        id={'meltCardVideo'}
        className={styles.videoContainer}
      ></PreloadElement>
      <PreloadElement
        ref={craftVideoRef}
        id={'craftCardVideo'}
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
            <div className={styles.assetPlusButton} onClick={openRedeemCodeModal}></div>
          </div>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon2}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.faithAmount || 0}</span>
            <div className={styles.assetPlusButton} onClick={openRedeemCodeModal}></div>
          </div>
        </div>
      </div>
      <div className={styles.swipeContainer}>
        <div
          className={classNames(styles.swipeSlideContainer, styles.craftPageContainer)}
          ref={craftRenderRef}
        >
          {craftRender ? <Craft playCraftCardVideo={playCraftCardVideo}></Craft> : null}
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
      <Suspense fallback={null}>
        <RedeemCodeModal
          open={redeemCodeModalVisible}
          onOpenChange={setRedeemCodeModalVisible}
        ></RedeemCodeModal>
      </Suspense>
    </div>
  )
}
export default observer(FusionPage)

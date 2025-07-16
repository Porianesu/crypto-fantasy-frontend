import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import styles from './FusionPage.module.css'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import Craft from '@/pages/FusionPage/Craft.tsx'
import Melt from '@/pages/FusionPage/Melt.tsx'
import { gsap } from 'gsap'

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
  const [pageType, setPageType] = useState<FUSION_PAGE_TYPE>(FUSION_PAGE_TYPE.CRAFT)
  const [craftRender, setCraftRender] = useState(true)
  const craftRenderRef = useRef<HTMLDivElement>(null)
  const [meltRender, setMeltRender] = useState(false)
  const meltRenderRef = useRef<HTMLDivElement>(null)
  const isAnimationRunning = useRef(false)

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

  return (
    <div className={classNames(styles.pageContainer)}>
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
        <button className={classNames(styles.questionButton, 'button')}></button>
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
              <Melt></Melt>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}
export default observer(FusionPage)

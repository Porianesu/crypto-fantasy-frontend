import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import styles from './RewardResultContent.module.css'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { Close, Description, Title } from '@radix-ui/react-dialog'
import classNames from 'classnames'

interface IRewardResultContentProps {
  title?: string
  reward: {
    solAmount?: number
    faithAmount?: number
    melt?: number
  }
}

const RewardResultContent: React.FC<IRewardResultContentProps> = ({ title, reward }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline()
      gsap.to(backgroundRef.current, {
        rotate: 360,
        duration: 5,
        ease: 'linear',
        repeat: -1,
      })
      tl.from(backgroundRef.current, {
        scale: 0,
        duration: 1,
      })
    },
    {
      scope: contentRef,
      dependencies: [],
    },
  )

  return (
    <div className={styles.modalContentContainer} ref={contentRef}>
      <div className={styles.backgroundImage} ref={backgroundRef}></div>
      {title ? <Title className={styles.title}>{title}</Title> : null}
      <Description className={'hidden'}></Description>
      <div className={classNames(styles.faithCoinPile, styles.faithCoinPileLarge)}></div>
      <div className={styles.rewardContainer}>
        {reward.solAmount ? (
          <div>
            {reward.solAmount}
            <div className={styles.solCoinIcon}></div>
          </div>
        ) : null}
        {reward.faithAmount ? (
          <div>
            {reward.faithAmount}
            <div className={styles.faithCoinIcon}></div>
          </div>
        ) : null}
        {reward.melt ? (
          <div>
            {reward.melt}
            <div className={styles.meltIcon}></div>
          </div>
        ) : null}
      </div>
      <Close className={classNames(styles.button, 'text-shadow')}>OK</Close>
    </div>
  )
}
export default observer(RewardResultContent)

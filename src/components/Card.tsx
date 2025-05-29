import React, { type CSSProperties, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Card.module.css'
import classNames from 'classnames'
import { useGSAP } from '@gsap/react'

const timeRate = 1
export enum CARD_RARITY {
  NORMAL = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}
export interface ICardData {
  name: string
  id: number
  description: string
  imageUrl: string
  rarity: CARD_RARITY
  score: number
  '30_pnl': number
  '30_win_rate': number
  avg_duration: number
}
export interface ICardProps {
  style?: CSSProperties
  card: ICardData
}

const CardRotation_Once = [0.15, 0.25]
const CardRotation_ThreeTimes = [0.1, 0.1, 0.2, 0.2, 0.2, 0.3]
const CardRotation_FiveTimes = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.25, 0.25, 0.3]
const RarityRotationMap = {
  [CARD_RARITY.NORMAL]: CardRotation_Once,
  [CARD_RARITY.RARE]: CardRotation_Once,
  [CARD_RARITY.EPIC]: CardRotation_ThreeTimes,
  [CARD_RARITY.LEGENDARY]: CardRotation_FiveTimes,
}
const Card: React.FC<ICardProps> = ({ style, card }) => {
  const cardIsFlipped = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const flipAnimationTimelineRef = useRef<gsap.core.Timeline>(null)

  useGSAP(
    () => {
      if (!flipAnimationTimelineRef.current) {
        const tl = gsap.timeline({
          onStart: () => {},
          onComplete: () => {
            console.log('onComplete')
            cardIsFlipped.current = true
          },
        })
        const targetRotation = RarityRotationMap[card.rarity]
        targetRotation.forEach((duration, index) => {
          tl.to(cardRef.current, {
            duration: duration * timeRate,
            rotationY: 90 * (index + 1),
            ease: 'none', // 设置匀速缓动
          })
        })
        tl.reverse()
        flipAnimationTimelineRef.current = tl
      }
    },
    {
      dependencies: [],
      revertOnUpdate: true,
      scope: cardRef,
    },
  )

  const flipCard = () => {
    if (!flipAnimationTimelineRef.current) return
    if (flipAnimationTimelineRef.current.isActive()) {
      return
    }
    if (cardIsFlipped.current) {
      return
    } else {
      flipAnimationTimelineRef.current.reversed(!flipAnimationTimelineRef.current.reversed())
    }
  }

  const handleMouseOver = () => {
    // 放大效果
    gsap.to(cardRef.current, {
      duration: 0.3,
      scale: 1.05,
    })
  }

  const handleMouseLeave = () => {
    // 恢复缩放
    gsap.to(cardRef.current, {
      duration: 0.3,
      scale: 1,
    })
  }

  return (
    <div
      style={style}
      className={styles.card}
      ref={cardRef}
      onClick={flipCard}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <div className={classNames(styles.cardFront)}>卡牌背面</div>
      <div className={classNames(styles.cardBack, styles[`card${card.rarity}`])}>
        <div className={styles.cardContent}>
          <img alt={`${card.name}-${card.rarity}-image`} src={card.imageUrl}></img>
        </div>
      </div>
    </div>
  )
}

export default Card

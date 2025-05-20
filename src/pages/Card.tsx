import React, { type CSSProperties, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Card.module.css'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect.tsx'
import classNames from 'classnames'

const timeRate = 1
export enum CARD_RARITY {
  NORMAL = 'Normal',
  RARE = 'Rare',
  EPIC = 'Epic',
  LEGENDARY = 'Legendary',
}
export interface ICardProps {
  style?: CSSProperties
  rarity?: CARD_RARITY
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
const Card: React.FC<ICardProps> = ({ style, rarity = CARD_RARITY.NORMAL }) => {
  const cardIsFlipped = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const flipAnimationTimelineRef = useRef<gsap.core.Timeline>(null)

  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {}, cardRef)
    if (!flipAnimationTimelineRef.current) {
      const tl = gsap.timeline({
        onStart: () => {},
        onComplete: () => {
          console.log('onComplete')
          cardIsFlipped.current = true
        },
      })
      const targetRotation = RarityRotationMap[rarity]
      targetRotation.forEach((duration, index) => {
        tl.to(cardRef.current, {
          duration: duration * timeRate,
          rotationY: 90 * (index + 1),
          ease: 'none', // 设置匀速缓动
          onComplete:
            index % 2 === 0
              ? () => {
                  // 翻转到90度时切换内容
                  console.log('翻过了', gsap.getProperty(cardRef.current, 'rotationY'))
                  cardRef.current?.classList.toggle(styles.isFlipped)
                }
              : undefined,
        })
      })
      tl.pause()
      flipAnimationTimelineRef.current = tl
    }
    return () => ctx.revert()
  }, [])

  const flipCard = () => {
    if (!flipAnimationTimelineRef.current) return
    if (flipAnimationTimelineRef.current.isActive()) {
      return
    }
    if (cardIsFlipped.current) {
      return
    } else {
      flipAnimationTimelineRef.current.play()
    }
  }

  const handleMouseOver = () => {
    gsap.to(cardRef.current, {
      duration: 0.3,
      scale: 1.05,
    })
  }

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      duration: 0.3,
      scale: 1,
    })
    flipCard()
  }

  console.log('CardRarity', rarity)
  return (
    <div
      style={style}
      className={styles.card}
      ref={cardRef}
      onClick={flipCard}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.cardFront}>卡牌背面</div>
      <div className={classNames(styles.cardBack, styles[`card${rarity}`])}>
        <div>{rarity}</div>
      </div>
    </div>
  )
}

export default Card

import React, { type CSSProperties, useImperativeHandle, useMemo, useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Card.module.css'
import classNames from 'classnames'
import { useGSAP } from '@gsap/react'
import { Textfit } from 'react-textfit'
import { getCardImageById } from '@/utils/common.ts'

const timeRate = 1
export enum CARD_RARITY {
  NORMAL = 0,
  RARE = 1,
  EPIC = 2,
  LEGENDARY = 3,
}
export interface ICardData {
  id: number
  name: string
  nickname: string
  description: string
  imageUrl: string
  rarity: CARD_RARITY
  score: number
  '30_pnl': number
  '30_winrate': number
  average_duration: number
  faction: string
  tag: string
  quote: string
  backstory: string
}
export interface ICardHandle {
  flipCard: () => void
}
export interface ICardProps {
  style?: CSSProperties
  card: ICardData
  type?: 'static' | 'animate' // 是否静态卡片
  scale?: number // 缩放比例
  undetected?: boolean // 是否未检测到
}

const CardRotation_Once = [0.15, 0.25]
// const CardRotation_ThreeTimes = [0.1, 0.1, 0.2, 0.2, 0.2, 0.3]
// const CardRotation_FiveTimes = [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.15, 0.25, 0.25, 0.3]
const RarityRotationMap = {
  [CARD_RARITY.NORMAL]: CardRotation_Once,
  [CARD_RARITY.RARE]: CardRotation_Once,
  [CARD_RARITY.EPIC]: CardRotation_Once,
  [CARD_RARITY.LEGENDARY]: CardRotation_Once,
}
const Card = React.forwardRef<ICardHandle, ICardProps>(
  ({ style, card, type = 'animate', scale, undetected }, ref) => {
    const cardIsFlipped = useRef(false)
    const cardRef = useRef<HTMLDivElement>(null)
    const flipAnimationTimelineRef = useRef<gsap.core.Timeline>(null)
    const isStatic = useMemo(() => type === 'static', [type])

    useGSAP(
      () => {
        if (!flipAnimationTimelineRef.current) {
          if (isStatic) {
            gsap.set(cardRef.current, {
              scale: scale || 1,
              rotationY: 180,
            })
            return
          }
          const tl = gsap.timeline({
            onStart: () => {},
            onComplete: () => {
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
        dependencies: [scale],
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
        window.createjs.Sound.play('flipCardSound', {
          volume: 1,
        })
        flipAnimationTimelineRef.current.reversed(!flipAnimationTimelineRef.current.reversed())
      }
    }

    useImperativeHandle(
      ref,
      () => ({
        flipCard,
      }),
      [],
    )

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
        onClick={isStatic ? undefined : flipCard}
        onMouseOver={isStatic ? undefined : handleMouseOver}
        onMouseLeave={isStatic ? undefined : handleMouseLeave}
      >
        <div className={classNames(styles.glow, styles[`glowRarity${card.rarity}`])} />
        <div className={classNames(styles.cardFront)}></div>
        <div className={classNames(styles.cardBack)}>
          <div
            className={classNames(styles.cardBackBorder, styles[`cardBackRarity${card.rarity}`])}
          ></div>
          <div
            className={classNames(styles.cardContent, styles[`cardContentRarity${card.rarity}`])}
          >
            <div className={styles.cardNameWrapper}>
              <div className={styles.cardName}>
                <Textfit>{card.name}</Textfit>
              </div>
            </div>
            <div
              className={classNames(styles.cardScore, styles.cardScorePosition, {
                [styles.undetectedCardScorePosition]: undetected,
              })}
            >
              {undetected ? '?' : card.score}
            </div>
          </div>
          <div
            className={styles.cardImage}
            style={{
              backgroundImage: `url(${getCardImageById(card.id)})`,
            }}
          ></div>
        </div>
      </div>
    )
  },
)

export default Card

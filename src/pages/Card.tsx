import React, { useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Card.module.css'

const Card: React.FC = () => {
  const cardIsFlipped = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const timelineRef = useRef<gsap.core.Timeline>(null)

  const flipCard = () => {
    if (!timelineRef.current) {
      const tl = gsap.timeline({
        onStart: () => {},
        onComplete: () => {
          console.log('onComplete')
          cardIsFlipped.current = true
        },
        onReverseComplete: () => {
          console.log('onReverseComplete')
          cardIsFlipped.current = false
        },
      })
      tl.to(cardRef.current, {
        duration: 0.5,
        rotationY: 90,
        ease: 'none', // 设置匀速缓动
        onComplete: () => {
          // 翻转到90度时切换内容
          console.log('正面翻转结束')
          cardRef.current?.classList.toggle(styles.isFlipped)
        },
      }).to(cardRef.current, {
        duration: 0.5,
        rotationY: 180,
        ease: 'none', // 设置匀速缓动
        onReverseComplete: () => {
          // 翻转到90度时切换内容
          console.log('反面反向翻转结束')
          cardRef.current?.classList.toggle(styles.isFlipped)
        },
      })
      tl.pause()
      timelineRef.current = tl
    }
    if (timelineRef.current.isActive()) {
      return
    }
    if (cardIsFlipped.current) {
      timelineRef.current.reverse()
    } else {
      timelineRef.current.play()
    }
  }

  return (
    <div className={styles.card} ref={cardRef} onClick={flipCard}>
      <div className={styles.cardFront}>正面内容</div>
      <div className={styles.cardBack}>反面内容</div>
    </div>
  )
}

export default Card

import React, { useRef } from 'react'
import { gsap } from 'gsap'
import styles from './Card.module.css'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect.tsx'

const timeRate = 2
const Card: React.FC = () => {
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
        onReverseComplete: () => {
          console.log('onReverseComplete')
          cardIsFlipped.current = false
        },
      })
      tl.to(cardRef.current, {
        duration: 0.1 * timeRate,
        rotationY: 90,
        ease: 'none', // 设置匀速缓动
        onComplete: () => {
          // 翻转到90度时切换内容
          console.log('正面翻转结束')
          cardRef.current?.classList.toggle(styles.isFlipped)
        },
      })
        .to(cardRef.current, {
          duration: 0.1 * timeRate,
          rotationY: 180,
          ease: 'none', // 设置匀速缓动
          onReverseComplete: () => {
            // 翻转到90度时切换内容
            console.log('反面反向翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
        })
        .to(cardRef.current, {
          duration: 0.1 * timeRate,
          rotationY: 270,
          ease: 'none', // 设置匀速缓动
          onComplete: () => {
            // 翻转到90度时切换内容
            console.log('正面翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
          onReverseComplete: () => {
            // 翻转到90度时切换内容
            console.log('反面反向翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
        })
        .to(cardRef.current, {
          duration: 0.1 * timeRate,
          rotationY: 360,
          ease: 'none', // 设置匀速缓动
          onReverseComplete: () => {
            // 翻转到90度时切换内容
            console.log('反面反向翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
        })
        .to(cardRef.current, {
          duration: 0.2 * timeRate,
          rotationY: 450,
          ease: 'none', // 设置匀速缓动
          onComplete: () => {
            // 翻转到90度时切换内容
            console.log('正面翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
          onReverseComplete: () => {
            // 翻转到90度时切换内容
            console.log('反面反向翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
        })
        .to(cardRef.current, {
          duration: 0.4 * timeRate,
          rotationY: 540,
          ease: 'none', // 设置匀速缓动
          onReverseComplete: () => {
            // 翻转到90度时切换内容
            console.log('反面反向翻转结束')
            cardRef.current?.classList.toggle(styles.isFlipped)
          },
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

  return (
    <div
      className={styles.card}
      ref={cardRef}
      onClick={flipCard}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.cardFront}>正面内容</div>
      <div className={styles.cardBack}>反面内容</div>
    </div>
  )
}

export default Card

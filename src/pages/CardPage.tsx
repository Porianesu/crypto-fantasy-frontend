import { observer } from 'mobx-react-lite'
import React, { useRef, useState } from 'react'
import PreloadElement, { type IPreloadElementHandle } from '@/components/PreloadElement.tsx'
import styles from '@/pages/CardPage.module.css'
import Card, { CARD_RARITY } from '@/components/Card.tsx'
import dayjs from 'dayjs'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

const getRandomCard = (_: any, index: number) => {
  const cardRarity =
    Object.values(CARD_RARITY)[Math.floor(Math.random() * Object.values(CARD_RARITY).length)]
  return {
    id: `${dayjs().valueOf()}-${index}`,
    rarity: cardRarity,
  }
}

const CardPage: React.FC = () => {
  const [cards] = useState<
    Array<{
      id: string
      rarity: CARD_RARITY
    }>
  >(Array.from({ length: 5 }, getRandomCard))
  const videoRef = useRef<IPreloadElementHandle>(null)
  const cardsRef = useRef<Array<HTMLDivElement | null>>([])
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const addCard = (ref: HTMLDivElement | null, index: number) => {
    cardsRef.current[index] = ref
  }

  useGSAP(
    () => {
      console.log('cardsRef', cardsRef.current)
      gsap.set(cardsRef.current, {
        zIndex: (index) => 5 - Math.abs(index - 2), // 中间的卡片在最前面
      })
      gsap.to(cardsRef.current, {
        z: (index) => (2 - Math.abs(index - 2)) * 100,
        y: (index) => Math.abs(index - 2) * -30,
        duration: 1,
      })
    },
    {
      dependencies: [],
      scope: cardsContainerRef,
    },
  )

  return (
    <div className={styles.pageContainer}>
      <div>
        <button
          className={'text-white'}
          onClick={() => {
            if (videoRef.current) {
              ;(videoRef.current.getElement() as HTMLVideoElement).play()
            }
          }}
        >
          Play
        </button>
        <PreloadElement ref={videoRef} id={'remoteVideo'}></PreloadElement>
      </div>
      <div className={styles.cardWrapper}>
        <div className={styles.cardContainer} ref={cardsContainerRef}>
          {cards.map((card, index) => (
            <div ref={(node) => addCard(node, index)} key={card.id}>
              <Card rarity={card.rarity}></Card>
            </div>
          ))}
        </div>
        <div className={styles.cardFloor}></div>
      </div>
    </div>
  )
}
export default observer(CardPage)

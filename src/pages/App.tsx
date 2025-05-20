import './App.module.css'
import { observer } from 'mobx-react-lite'
import Card, { CARD_RARITY } from '@/pages/Card.tsx'
import styles from './App.module.css'
import { useState } from 'react'
import dayjs from 'dayjs'

const getRandomCard = () => {
  const CardRarityArray = Object.values(CARD_RARITY)
  const randomNumber = Math.floor(Math.random() * CardRarityArray.length)
  console.log('CardRarity', randomNumber)
  const cardRarity =
    Object.values(CARD_RARITY)[Math.floor(Math.random() * Object.values(CARD_RARITY).length)]
  return {
    id: dayjs().valueOf(),
    rarity: cardRarity,
  }
}
function App() {
  const [cards] = useState<
    Array<{
      id: number
      rarity: CARD_RARITY
    }>
  >(Array.from({ length: 5 }, getRandomCard))
  return (
    <div className={styles.cardWrapper}>
      <div className={styles.cardContainer}>
        {cards.map((card, index) => (
          <Card
            style={{
              transform: `translateY(${Math.abs(index - 2) * -30}px) translateZ(${(2 - Math.abs(index - 2)) * 100}px)`,
              zIndex: 5 - Math.abs(index - 2), // 中间的卡片在最前面
            }}
            rarity={card.rarity}
            key={card.id}
          ></Card>
        ))}
      </div>
      <div className={styles.cardFloor}></div>
    </div>
  )
}

export default observer(App)

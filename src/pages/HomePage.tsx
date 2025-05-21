import { observer } from 'mobx-react-lite'
import Card, { CARD_RARITY } from '@/components/Card.tsx'
import styles from './HomePage.module.css'
import { useRef, useState } from 'react'
import dayjs from 'dayjs'
import Text from '@/components/Text.tsx'
import classNames from 'classnames'
import PreloadElement, { type IPreloadElementHandle } from '@/components/PreloadElement.tsx'

const getRandomCard = (_: any, index: number) => {
  const CardRarityArray = Object.values(CARD_RARITY)
  const randomNumber = Math.floor(Math.random() * CardRarityArray.length)
  console.log('CardRarity', randomNumber)
  const cardRarity =
    Object.values(CARD_RARITY)[Math.floor(Math.random() * Object.values(CARD_RARITY).length)]
  return {
    id: `${dayjs().valueOf()}-${index}`,
    rarity: cardRarity,
  }
}
function HomePage() {
  const [cards] = useState<
    Array<{
      id: string
      rarity: CARD_RARITY
    }>
  >(Array.from({ length: 5 }, getRandomCard))
  const videoRef = useRef<IPreloadElementHandle>(null)
  return (
    <div
      className={classNames(
        'flex flex-col items-center w-full h-full pt-64 bg-black overflow-x-hidden overflow-y-auto',
        'grow',
        'shrink',
        'basis-0',
      )}
    >
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
      <Text
        text={
          'I am happy to join with you today in what will go down in history as the greatest demonstration for freedom in the history of our nation.Five score years ago a great American in whose symbolic shadow we stand today signed the\n Emancipation Proclamation. This momentous decree is a great beacon light of hope to millions of Negro slaves who had been seared in the flames of withering injustice. It came as a joyous daybreak to end the long night of their captivity. But 100 years later the Negro still is not free. One hundred years later the life of the Negro is still badly crippled by the manacles of segregation and the chains of discrimination. One hundred years later the Negro lives on a lonely island of poverty in the midst of a vast ocean of material prosperity. One hundred years later the Negro is still languished in the corners of American society and finds himself in exile in his own land. So we’ve come here today to dramatize a shameful condition.'
        }
      ></Text>
    </div>
  )
}

export default observer(HomePage)

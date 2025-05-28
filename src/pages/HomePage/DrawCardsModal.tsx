import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import classNames from 'classnames'
import styles from './DrawCardsModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Card, { type ICardData } from '@/components/Card.tsx'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface IDrawCardsModalProps {
  cards: Array<ICardData>
}

const CardsPart: React.FC<IDrawCardsModalProps> = ({ cards }) => {
  const cardsRef = useRef<Array<HTMLDivElement | null>>([])
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const addCard = (ref: HTMLDivElement | null, index: number) => {
    cardsRef.current[index] = ref
  }

  useGSAP(
    () => {
      gsap.set(cardsRef.current, {
        zIndex: (index) => 5 - Math.abs(index - 2), // 中间的卡片在最前面
      })
      const getYOffset = (index: number) => Math.abs(index - 2) * -30
      gsap.to(cardsRef.current, {
        z: (index) => (2 - Math.abs(index - 2)) * 100,
        y: (index) => getYOffset(index),
        duration: 1,
      })
    },
    {
      dependencies: [],
      scope: cardsContainerRef,
    },
  )
  return (
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
  )
}
const DrawCardsModal: React.FC<IDrawCardsModalProps> = ({ cards }) => {
  const {
    modalStore: { drawCardsModalVisible, changeDrawCardsModalVisible },
  } = useMobxStore()

  return (
    <Dialog open={drawCardsModalVisible} onOpenChange={changeDrawCardsModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Title></Title>
          <Description></Description>
          <Content className={styles.modalContent}>
            <CardsPart cards={cards}></CardsPart>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(DrawCardsModal)

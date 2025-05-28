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
      const getYOffset = (index: number) => (index % 2 === 0 ? '-15%' : '15%')
      gsap.fromTo(
        cardsRef.current,
        {
          autoAlpha: 0,
          y: '100%',
        },
        {
          autoAlpha: 1,
          y: (index) => getYOffset(index),
          stagger: {
            // amount: cards.length * 0.1,
            each: 0.4,
            from: 'start',
            grid: [1, cards.length],
            axis: 'x',
          },
          duration: 0.6,
        },
      )
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
          <div
            className={'will-change-transform'}
            ref={(node) => addCard(node, index)}
            key={card.id}
          >
            <Card rarity={card.rarity}></Card>
          </div>
        ))}
      </div>
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
            <div>Congratulations</div>
            <CardsPart cards={cards}></CardsPart>
            <div>Click to flip open your card.</div>
            <div>Click blank to close</div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(DrawCardsModal)

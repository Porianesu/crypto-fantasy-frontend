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
          stagger: 0.4,
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
            key={`${card.id}-${index}`}
          >
            <Card card={card}></Card>
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

  const handleClose = () => {
    changeDrawCardsModalVisible(false)
  }

  return (
    <Dialog open={drawCardsModalVisible} onOpenChange={changeDrawCardsModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames('data-[state=closed]:animate-fade-out', styles.overlay)}
        >
          <Title></Title>
          <Description></Description>
          <Content className={styles.modalContent} onInteractOutside={(e) => e.preventDefault()}>
            <div className={styles.description}>Click to flip open your card</div>
            {drawCardsModalVisible ? <CardsPart cards={cards}></CardsPart> : null}
            <div className={styles.closeBtn} onClick={handleClose}></div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(DrawCardsModal)

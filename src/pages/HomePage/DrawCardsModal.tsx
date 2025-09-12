import { observer } from 'mobx-react-lite'
import React, { useImperativeHandle, useRef } from 'react'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import classNames from 'classnames'
import styles from './DrawCardsModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Card, { type ICardData, type ICardHandle } from '@/components/Card.tsx'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface IDrawCardsModalProps {
  cards: Array<ICardData>
}

interface ICardsPartHandle {
  flipAllCards: () => void
}

const CardsPart = React.forwardRef<ICardsPartHandle, IDrawCardsModalProps>(({ cards }, ref) => {
  const cardWrappersRef = useRef<Array<HTMLDivElement | null>>([])
  const cardsRef = useRef<Array<ICardHandle>>([])
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const addCardWrapper = (ref: HTMLDivElement | null, index: number) => {
    if (ref) {
      cardWrappersRef.current[index] = ref
    }
  }

  const flipAllCards = () => {
    cardsRef.current.forEach((card) => {
      card.flipCard()
    })
  }

  useImperativeHandle(
    ref,
    () => ({
      flipAllCards,
    }),
    [],
  )

  useGSAP(
    () => {
      const getYOffset = (index: number) => (index % 2 === 0 ? '-15%' : '15%')
      gsap.fromTo(
        cardWrappersRef.current,
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
            ref={(node) => addCardWrapper(node, index)}
            key={`${card.id}-${index}`}
          >
            <Card
              card={card}
              ref={(el) => {
                if (el) {
                  cardsRef.current[index] = el
                }
              }}
            ></Card>
          </div>
        ))}
      </div>
    </div>
  )
})
const DrawCardsModal: React.FC<IDrawCardsModalProps> = ({ cards }) => {
  const {
    modalStore: { drawCardsModalVisible, changeDrawCardsModalVisible },
  } = useMobxStore()
  const cardsPartRef = useRef<ICardsPartHandle>(null)

  const handleClose = () => {
    changeDrawCardsModalVisible(false)
  }

  const handleFlipAll = () => {
    cardsPartRef.current?.flipAllCards()
  }

  return (
    <Dialog open={drawCardsModalVisible} onOpenChange={changeDrawCardsModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames('data-[state=closed]:animate-fade-out', styles.overlay)}
        >
          <Description></Description>
          <Content className={styles.modalContent} onInteractOutside={(e) => e.preventDefault()}>
            <div className={styles.titleWrapper}>
              <Title className={styles.title}>Click to flip your card</Title>
              <button
                className={classNames(styles.flipAllButton, 'button')}
                onClick={handleFlipAll}
              >
                Flip All
              </button>
            </div>
            <CardsPart cards={cards} ref={cardsPartRef}></CardsPart>
            <div className={styles.closeBtn} onClick={handleClose}></div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(DrawCardsModal)

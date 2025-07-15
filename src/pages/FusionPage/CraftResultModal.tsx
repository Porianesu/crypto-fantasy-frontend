import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import styles from './CraftResultModal.module.css'
import classNames from 'classnames'
import {
  Close,
  Content,
  Description,
  Dialog,
  DialogOverlay,
  Portal,
  Title,
} from '@radix-ui/react-dialog'
import type { ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface ICraftResultModalContentProps {
  type: 'success' | 'fail'
  cards: Array<ICardData>
}

const CraftResultModalContent: React.FC<ICraftResultModalContentProps> = ({ type, cards }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLDivElement>>([])
  const backgroundRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline()
      tl.from(backgroundRef.current, {
        scale: 0,
        duration: 0.5,
      }).from(cardsRef.current, {
        scale: 0,
        stagger: 0.2,
        duration: 0.5,
      })
    },
    {
      scope: contentRef,
      dependencies: [],
    },
  )

  return (
    <div className={styles.modalContentContainer} ref={contentRef}>
      <div className={styles.backgroundImage} ref={backgroundRef}></div>
      <Title className={styles.title}>
        {type === 'success'
          ? 'Congratulations! You’ve crafted a higher rarity card.'
          : 'Fate sald no - but some materials have been retumed.'}
      </Title>
      <Description className={'hidden'}></Description>
      <div className={styles.cardsContainer}>
        {cards.map((card, index) => (
          <StaticCard
            key={`${card.id}-${index}`}
            card={card}
            width={285}
            ref={(el: HTMLDivElement) => {
              if (el) {
                cardsRef.current[index] = el
              }
            }}
          ></StaticCard>
        ))}
      </div>
      <Close className={classNames(styles.button, 'text-shadow')}>OK</Close>
    </div>
  )
}

interface ICraftResultModalProps extends ICraftResultModalContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const CraftResultModal: React.FC<ICraftResultModalProps> = ({
  open,
  onOpenChange,
  ...contentProps
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Content className={styles.modalContentWrapper}>
            <CraftResultModalContent {...contentProps}></CraftResultModalContent>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(CraftResultModal)

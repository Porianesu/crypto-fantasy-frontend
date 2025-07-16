import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import styles from './MeltResultModal.module.css'
import {
  Close,
  Content,
  Description,
  Dialog,
  DialogOverlay,
  Portal,
  Title,
} from '@radix-ui/react-dialog'
import classNames from 'classnames'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface IMeltResultModalContentProps {
  faithCoin: number
}

const MeltResultModalContent: React.FC<IMeltResultModalContentProps> = ({ faithCoin }) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const backgroundRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const tl = gsap.timeline()
      gsap.to(backgroundRef.current, {
        rotate: 360,
        duration: 5,
        ease: 'linear',
        repeat: -1,
      })
      tl.from(backgroundRef.current, {
        scale: 0,
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
      <Title className={styles.title}>{'Congratulations! You’ve get Faithcoin as return.'}</Title>
      <Description className={'hidden'}></Description>
      <div className={styles.faithCoinPile}></div>
      <div className={styles.faithCoinContainer}>
        {faithCoin}
        <div className={styles.faithCoinIcon}></div>
      </div>
      <Close className={classNames(styles.button, 'text-shadow')}>OK</Close>
    </div>
  )
}

interface IMeltResultModalProps extends IMeltResultModalContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const MeltResultModal: React.FC<IMeltResultModalProps> = ({
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
            <MeltResultModalContent {...contentProps}></MeltResultModalContent>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(MeltResultModal)

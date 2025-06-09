import { observer } from 'mobx-react-lite'
import React from 'react'
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
import styles from './CardsFormationModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

const CardsFormationModal: React.FC = () => {
  const {
    appStore: { cardsBag, cardsFormation, changeCardsFormation },
    modalStore: { cardsFormationModalVisible, changeCardsFormationModalVisible },
  } = useMobxStore()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [contentVisible, setContentVisible] = React.useState(cardsFormationModalVisible)

  const cardsFormationCopy = []

  return (
    <Dialog open={cardsFormationModalVisible} onOpenChange={changeCardsFormationModalVisible}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Description></Description>
          <Content className={styles.modalContent} ref={contentRef}>
            <Title></Title>
            <Close asChild>
              <div className={styles.closeBtn} aria-label="Close"></div>
            </Close>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(CardsFormationModal)

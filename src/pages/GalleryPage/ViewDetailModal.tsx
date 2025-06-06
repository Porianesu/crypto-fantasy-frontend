import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import classNames from 'classnames'
import styles from './ViewDetailModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Text, { type ITextHandle } from '@/components/Text.tsx'

const ViewDetailModal: React.FC = () => {
  const {
    modalStore: {
      viewDetailModalData,
      changeViewDetailModalData,
      viewDetailModalVisible,
      changeViewDetailModalVisible,
    },
  } = useMobxStore()
  const textRef = useRef<ITextHandle>(null)

  const handleTextContainerClick = () => {
    textRef.current?.tweenRef.current?.revert()
  }

  return (
    <Dialog open={viewDetailModalVisible} onOpenChange={changeViewDetailModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Content className={styles.modalContent} onInteractOutside={(e) => e.preventDefault()}>
            <Title className={styles.title}>Chainspirit Backstory</Title>
            <Description></Description>
            <div className={styles.content} onClick={handleTextContainerClick}>
              <Text ref={textRef}>{viewDetailModalData?.backstory}</Text>
            </div>
            <div className={styles.line}></div>
            <div
              className={styles.button}
              onClick={() => {
                changeViewDetailModalData(undefined)
                changeViewDetailModalVisible(false)
              }}
            >
              <div className={styles.buttonText}>OK</div>
            </div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(ViewDetailModal)

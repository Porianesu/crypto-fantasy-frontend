import { observer } from 'mobx-react-lite'
import React from 'react'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import classNames from 'classnames'
import styles from './ViewDetailModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Text from '@/components/Text.tsx'

const ViewDetailModal: React.FC = () => {
  const {
    modalStore: {
      viewDetailModalData,
      changeViewDetailModalData,
      viewDetailModalVisible,
      changeViewDetailModalVisible,
    },
  } = useMobxStore()
  return (
    <Dialog open={viewDetailModalVisible} onOpenChange={changeViewDetailModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=closed]:animate-fade-out backdrop-blur-md',
            styles.overlay,
          )}
        >
          <Content className={styles.modalContent} onInteractOutside={(e) => e.preventDefault()}>
            <Title className={styles.title}>Chainspirit Backstory</Title>
            <Description></Description>
            <div className={styles.content}>
              <Text>{viewDetailModalData?.backstory}</Text>
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

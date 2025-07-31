import { observer } from 'mobx-react-lite'
import React from 'react'
import classNames from 'classnames'
import styles from './RedeemCodeModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'

interface IRedeemCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RedeemCodeModal: React.FC<IRedeemCodeModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            <Title></Title>
            <Description></Description>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(RedeemCodeModal)

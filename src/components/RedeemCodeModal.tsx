import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import classNames from 'classnames'
import styles from './RedeemCodeModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'

interface IRedeemCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RedeemCodeModal: React.FC<IRedeemCodeModalProps> = ({ open, onOpenChange }) => {
  const [code, setCode] = useState('')

  const handleConfirm = () => {
    // TODO: 兑换码提交逻辑
    // 可以在这里调用API进行兑换
    onOpenChange(false)
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            <Title className={styles.title}>Redeem Code</Title>
            <Description className={styles.description}>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </Description>
            <button className={styles.confirmBtn} onClick={handleConfirm} disabled={!code.trim()}>
              Confirm
            </button>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(RedeemCodeModal)

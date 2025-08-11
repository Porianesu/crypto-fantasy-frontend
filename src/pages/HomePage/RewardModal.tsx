import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './RewardModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import classNames from 'classnames'
import RewardModalSignInContent from '@/pages/HomePage/RewardModalSignInContent.tsx'

interface IRewardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RewardModal: React.FC<IRewardModalProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            <Title>Reward</Title>
            <Description>Claim your reward!</Description>
            <RewardModalSignInContent open={open}></RewardModalSignInContent>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(RewardModal)

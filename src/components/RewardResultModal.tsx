import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './RewardResultModal.module.css'
import classNames from 'classnames'
import { Content, Dialog, DialogOverlay, Portal } from '@radix-ui/react-dialog'
import RewardResultContent from '@/components/RewardResultContent.tsx'

interface IRewardResultModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  reward: {
    solAmount?: number
    faithAmount?: number
    melt?: number
  }
}

const RewardResultModal: React.FC<IRewardResultModalProps> = ({
  open,
  onOpenChange,
  title,
  reward,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            <RewardResultContent title={title} reward={reward}></RewardResultContent>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}

export default observer(RewardResultModal)

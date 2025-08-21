import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './MeetingGiftModal.module.css'
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
import { useMobxStore } from '@/stores/StoreProvider.tsx'

interface IMeetingGiftModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  handleClaimNewbieReward: () => Promise<void>
}

const MeetingGiftModal: React.FC<IMeetingGiftModalProps> = ({
  open,
  onOpenChange,
  handleClaimNewbieReward,
}) => {
  const {
    appStore: { appConfig },
    rewardStore: { claimNewbieRewardNetworkFlag },
  } = useMobxStore()
  if (!appConfig?.NewbieReward) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Title></Title>
          <Description></Description>
          <Content className={styles.modalContent} onInteractOutside={(e) => e.preventDefault()}>
            <div className={styles.contentContainer}>
              <Close className={classNames(styles.closeButton, 'button')}></Close>
              <div className={styles.backgroundImage}></div>
              <div className={styles.backgroundCharacter}></div>
              <div className={styles.coinPile1}></div>
              <div className={styles.coinPile2}></div>
              <button
                className={classNames(styles.claimButton, {
                  button: !claimNewbieRewardNetworkFlag,
                })}
                disabled={claimNewbieRewardNetworkFlag}
                onClick={handleClaimNewbieReward}
              >
                Claim Now
              </button>
              <div className={styles.rewardsContainer}>
                {Object.keys(appConfig.NewbieReward).map((rewardKey) => {
                  return (
                    <div
                      key={rewardKey}
                      className={classNames(
                        styles.rewardContainer,
                        styles[`rewardContainer_${rewardKey}`],
                      )}
                    >
                      <div className={styles.rewardImageContainer}>
                        <div className={styles.rewardImage}></div>
                      </div>
                      <div>
                        {appConfig.NewbieReward[rewardKey as keyof typeof appConfig.NewbieReward]}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(MeetingGiftModal)

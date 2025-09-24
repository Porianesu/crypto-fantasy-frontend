import { observer } from 'mobx-react-lite'
import React, { useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './RedeemCodeModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import { toast } from 'react-toastify'
import { type IRedeemCodeResponse, type RedeemCodeReward } from '@/axios/api.ts'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import RewardResultContent from '@/components/RewardResultContent.tsx'

interface IRedeemCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const RedeemCodeModal: React.FC<IRedeemCodeModalProps> = ({ open, onOpenChange }) => {
  const {
    preloadStore: { audioInstanceMap },
    appStore: { redeemCode },
  } = useMobxStore()
  const [code, setCode] = useState('')
  const [confirmButtonLoading, setConfirmButtonLoading] = useState(false)
  const [reward, setReward] = useState<RedeemCodeReward | undefined>()
  const successSound = audioInstanceMap.get(AudioInstanceId.CraftSuccessSound)

  useEffect(() => {
    if (open) {
      // Reset state when modal opens
      setCode('')
      setReward(undefined)
    }
  }, [open])

  const handleConfirm = async () => {
    if (code.length !== 10) return toast.warning('Wrong code length')
    setConfirmButtonLoading(true)
    const result = (await redeemCode(code)) as unknown as IRedeemCodeResponse | undefined
    if (result?.success) {
      if (successSound) {
        successSound.play({
          volume: 1,
        })
      }
      setReward(result.reward)
    }
    setConfirmButtonLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            {reward ? (
              <RewardResultContent
                title={'Redeem Successfully!'}
                reward={reward}
              ></RewardResultContent>
            ) : (
              <div className={styles.contentContainer}>
                <Title className={styles.title}>Redeem gift Code</Title>
                <Description className={styles.description}>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Enter the code here"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </Description>
                <button
                  className={classNames(styles.confirmBtn, {
                    button: !confirmButtonLoading,
                  })}
                  onClick={handleConfirm}
                  disabled={!code.trim() || confirmButtonLoading}
                >
                  Confirm
                </button>
                <a
                  className={styles.link}
                  href={'https://forms.gle/4BEs9gFTbs4E3MWC9'}
                  target={'_blank'}
                >
                  Want to get a new code for free?
                </a>
              </div>
            )}
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(RedeemCodeModal)

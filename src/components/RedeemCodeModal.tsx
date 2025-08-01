import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import classNames from 'classnames'
import styles from './RedeemCodeModal.module.css'
import {
  Close,
  Content,
  Description,
  Dialog,
  DialogOverlay,
  Portal,
  Title,
} from '@radix-ui/react-dialog'
import { toast } from 'react-toastify'
import { type IRedeemCodeResponse, type RedeemCodeReward } from '@/axios/api.ts'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

interface IRedeemCodeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}
const RedeemResultModalContent: React.FC<{
  reward: RedeemCodeReward
}> = ({ reward }) => {
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
        duration: 1,
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
      <Title className={styles.title}>{'Redeem Successfully!'}</Title>
      <Description className={'hidden'}></Description>
      <div className={classNames(styles.faithCoinPile, styles.faithCoinPileLarge)}></div>
      <div className={styles.rewardContainer}>
        {reward.solAmount ? (
          <div>
            {reward.solAmount}
            <div className={styles.solCoinIcon}></div>
          </div>
        ) : null}
        {reward.faithAmount ? (
          <div>
            {reward.faithAmount}
            <div className={styles.faithCoinIcon}></div>
          </div>
        ) : null}
      </div>
      <Close className={classNames(styles.button, 'text-shadow')}>OK</Close>
    </div>
  )
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
              <RedeemResultModalContent reward={reward}></RedeemResultModalContent>
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
                <a className={styles.link}>Want to get a new code for free?</a>
              </div>
            )}
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(RedeemCodeModal)

import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef } from 'react'
import styles from './RewardPageInviteContent.module.css'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import type { IBindInvitationResponse, IClaimInvitationRewardResponse } from '@/axios/api.ts'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

interface IRewardPageInviteContentProps {
  openRewardResultModal: (data: RewardResultModalData, title?: string) => void
}

const Tabs = [
  {
    label: 'Referral Reward',
    key: 'inviter',
  },
  {
    label: 'Invitee Reward',
    key: 'invitee',
  },
]

const RewardPageInviteContent: React.FC<IRewardPageInviteContentProps> = ({
  openRewardResultModal,
}) => {
  const {
    appStore: { appConfig },
    rewardStore: {
      invitationStatus,
      claimAllInvitationReward,
      bindInvitation,
      claimAllInvitationRewardNetworkFlag,
    },
  } = useMobxStore()
  const [selectedTab, setSelectedTab] = React.useState<string>(Tabs[0].key)
  const inviteCodeInputRef = useRef<HTMLInputElement>(null)
  const claimableInvitation = useMemo(
    () =>
      invitationStatus ? invitationStatus.invitationsAsInviter.filter((item) => !item.claimed) : [],
    [invitationStatus],
  )
  const contentContainerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const bottomPartContainerRef = useRef<HTMLDivElement>(null)
  const rewardWrapperRef = useRef<HTMLDivElement>(null)
  const bottomRightPartContainerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.from(titleRef.current, { y: -40, opacity: 0, duration: 0.5 })
    },
    {
      scope: contentContainerRef,
      dependencies: [],
    },
  )

  useGSAP(
    () => {
      if (!invitationStatus || !appConfig) return
      const tl = gsap.timeline()
      tl.from(descriptionRef.current, { y: -20, opacity: 0, duration: 0.4 }, '-=0.2')
        .from(rewardWrapperRef.current, { x: -60, opacity: 0, duration: 0.5 }, '-=0.1')
        .from(bottomRightPartContainerRef.current, { x: 60, opacity: 0, duration: 0.5 }, '-=0.5')
    },
    {
      scope: bottomPartContainerRef,
      dependencies: [invitationStatus, appConfig],
    },
  )

  const handleCopyInviteCode = async () => {
    if (!invitationStatus?.inviteCode) return
    await navigator.clipboard.writeText(invitationStatus.inviteCode)
    toast.success('Invitation copied to clipboard')
  }

  const handleClaimInvitationReward = async () => {
    const result = (await claimAllInvitationReward()) as unknown as IClaimInvitationRewardResponse
    if (result.success) {
      openRewardResultModal(
        {
          solAmount: result.rewardSolAmount,
          faithAmount: result.rewardFaithAmount,
        },
        'Invitation Reward Claimed',
      )
    }
  }

  const renderInviterRewardContent = () => {
    if (!appConfig) return null
    return (
      <>
        <div className={classNames(styles.rewardContainer, styles.rewardContainerSol)}>
          <div className={styles.rewardImage}></div>
          <div className={styles.rewardAmount}>{appConfig.ReferralReward.inviter.solAmount}</div>
        </div>
        <div className={classNames(styles.rewardContainer, styles.rewardContainerFaith)}>
          <div className={styles.rewardImage}></div>
          <div className={styles.rewardAmount}>{appConfig.ReferralReward.inviter.faithAmount}</div>
        </div>
        <div className={styles.claimableCount}>x{claimableInvitation.length}</div>
        <button
          className={classNames(
            { button: claimableInvitation.length !== 0 },
            styles.claimInvitationRewardButton,
          )}
          disabled={claimableInvitation.length === 0}
          onClick={handleClaimInvitationReward}
        >
          Claim
        </button>
      </>
    )
  }

  const handleBindInvitation = async () => {
    const inviteCode = inviteCodeInputRef.current?.value
    if (!inviteCode) {
      toast.error('Please enter a referral code')
      return
    }
    if (inviteCode.length !== 8) {
      toast.error('Invalid referral code')
      return
    }
    const result = (await bindInvitation(inviteCode)) as unknown as IBindInvitationResponse
    if (result.success) {
      openRewardResultModal(
        {
          solAmount: result.rewardSolAmount,
          faithAmount: result.rewardFaithAmount,
        },
        'Invitation Bound Successfully',
      )
    }
  }

  const renderInviteeRewardContent = () => {
    if (!invitationStatus || !appConfig) return null
    return invitationStatus.invitationsAsInvitee ? (
      <div className={styles.invitationBoundDescription}>
        <CheckCircleIcon></CheckCircleIcon>
        <div>
          You have accept a invitation, and claimed {appConfig.ReferralReward.invitee.solAmount} S
          and {appConfig.ReferralReward.invitee.faithAmount} F
        </div>
      </div>
    ) : (
      <>
        <div className={styles.inviteCodeInputContainer}>
          <input ref={inviteCodeInputRef}></input>
          <button
            className={classNames({ button: !claimAllInvitationRewardNetworkFlag })}
            onClick={handleBindInvitation}
            disabled={claimAllInvitationRewardNetworkFlag}
          >
            Claim
          </button>
        </div>
        <div className={styles.inviteCodeInputDescription}>
          You haven’t accept any invitation. Please enter a referral code.
        </div>
      </>
    )
  }

  return (
    <div className={styles.contentContainer} ref={contentContainerRef}>
      <div className={styles.title} ref={titleRef}></div>
      {appConfig ? (
        <div className={styles.description} ref={descriptionRef}>
          Invite a friend and share{' '}
          {appConfig.ReferralReward.inviter.solAmount + appConfig.ReferralReward.invitee.solAmount}
          S-Coins &{' '}
          {appConfig.ReferralReward.inviter.faithAmount +
            appConfig.ReferralReward.invitee.faithAmount}
          F-Coins with them
        </div>
      ) : null}
      {appConfig && invitationStatus ? (
        <div className={styles.bottomPartContainer} ref={bottomPartContainerRef}>
          <div className={styles.rewardWrapper} ref={rewardWrapperRef}>
            <div className={styles.tabsContainer}>
              {Tabs.map((tab) => (
                <div
                  key={tab.key}
                  className={classNames(styles.tabContainer, {
                    [styles.tabContainerSelected]: selectedTab === tab.key,
                    [styles.tabContainerUnselected]: selectedTab !== tab.key,
                  })}
                  onClick={() => {
                    setSelectedTab(tab.key)
                  }}
                >
                  <div className={styles.tabLabel}>{tab.label}</div>
                </div>
              ))}
            </div>
            <div
              className={classNames(styles.rewardContentContainer, {
                [styles.rewardContentContainerInviter]: selectedTab === 'inviter',
                [styles.rewardContentContainerInviteeUnbound]:
                  selectedTab === 'invitee' && !invitationStatus.invitationsAsInvitee,
                [styles.rewardContentContainerInviteeBound]:
                  selectedTab === 'invitee' && invitationStatus.invitationsAsInvitee,
              })}
            >
              {selectedTab === 'inviter'
                ? renderInviterRewardContent()
                : renderInviteeRewardContent()}
            </div>
          </div>
          <div className={styles.bottomRightPartContainer} ref={bottomRightPartContainerRef}>
            <div className={styles.inviteCodeLabel}>Referral code</div>
            <div className={styles.inviteCodeContainer}>
              <div>{invitationStatus.inviteCode}</div>
              <button
                className={classNames(styles.copyButton, 'button')}
                onClick={handleCopyInviteCode}
              ></button>
            </div>
          </div>
        </div>
      ) : (
        <div>Loading . . .</div>
      )}
    </div>
  )
}

export default observer(RewardPageInviteContent)

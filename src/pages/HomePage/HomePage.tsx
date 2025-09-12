import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Leaderboard from '@/pages/HomePage/Leaderboard.tsx'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import CardsFormation from '@/pages/HomePage/CardsFormation.tsx'
import { useNavigate } from 'react-router-dom'
import { getFusionPath, getGalleryPath, getRewardPath, getShopPath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import fusionIcon from '../../assets/images/home_page/footer_button_fusion.png'
import galleryIcon from '../../assets/images/home_page/footer_button_achs.png'
import bagIcon from '../../assets/images/home_page/footer_button_bag.png'
import battleIcon from '../../assets/images/home_page/footer_button_battle.png'
import rewardIcon from '../../assets/images/home_page/footer_button_reward.png'
import shopIcon from '../../assets/images/home_page/footer_button_shop.png'
import type { IOpenPackHandle } from '@/components/OpenPack.tsx'
import type { ICardDataInBag } from '@/stores/app-store.ts'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import type { IClaimNewbieRewardResponse } from '@/axios/api.ts'
import { AudioInstanceId } from '@/stores/preload-store.ts'

const OpenPack = React.lazy(() => import('@/components/OpenPack.tsx'))
const CardsBagModal = React.lazy(() => import('@/pages/HomePage/CardsBagModal.tsx'))
const BattleModal = React.lazy(() => import('@/pages/HomePage/BattleModal.tsx'))
const CardSelectModal = React.lazy(() => import('@/components/CardSelectModal.tsx'))
const RedeemCodeModal = React.lazy(() => import('@/components/RedeemCodeModal.tsx'))
const ProfileModal = React.lazy(() => import('@/pages/HomePage/ProfileModal.tsx'))
const MeetingGiftModal = React.lazy(() => import('@/pages/HomePage/MeetingGiftModal.tsx'))
const RewardResultModal = React.lazy(() => import('@/components/RewardResultModal.tsx'))

function HomePage() {
  const {
    appStore: { userInfo, appConfig, cardsFormation, changeCardsFormation },
    modalStore: { changeCardsBagModalData, changeBattleModalVisible },
    rewardStore: { showRedDot, claimNewbieReward },
    preloadStore: { audioInstanceMap },
  } = useMobxStore()
  const navigate = useNavigate()
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const [openPackLoading, setOpenPackLoading] = useState(false)
  const openPackRef = useRef<IOpenPackHandle>(null)
  const [cardsFormationModalVisible, setCardsFormationModalVisible] = useState(false)
  const selectedCards = useMemo(() => cardsFormation.map((card) => card.id), [cardsFormation])
  const [redeemCodeModalVisible, setRedeemCodeModalVisible] = useState(false)
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [meetingGiftModalVisible, setMeetingGiftModalVisible] = useState(false)
  const [rewardResultModalVisible, setRewardResultModalVisible] = useState<boolean>(false)
  const [rewardResultModalData, setRewardResultModalData] = useState<RewardResultModalData>({})
  const successSound = audioInstanceMap.get(AudioInstanceId.CraftSuccessSound)

  useEffect(() => {
    if (userInfo && !userInfo.newbieRewardClaimed) {
      setMeetingGiftModalVisible(true)
    }
  }, [])

  const handleClaimNewbieReward = async () => {
    const claimResult = (await claimNewbieReward()) as unknown as IClaimNewbieRewardResponse
    if (claimResult?.success) {
      if (successSound) {
        successSound.play({
          volume: 1,
        })
      }
      setMeetingGiftModalVisible(false)
      setRewardResultModalVisible(true)
      setRewardResultModalData({
        solAmount: appConfig?.NewbieReward.solAmount,
        faithAmount: appConfig?.NewbieReward.faithAmount,
      })
    }
  }

  const handleCardSelect = (card: ICardDataInBag) => {
    const findIndex = cardsFormation.findIndex((c) => c.id === card.id)
    if (findIndex !== -1) {
      // If the card is already selected, remove it from the formation
      const newCardsFormation = cardsFormation.filter((c) => c.id !== card.id)
      changeCardsFormation(newCardsFormation)
    } else {
      if (cardsFormation.length >= 5) return
      // If the card is not selected, add it to the formation
      const newCardsFormation = [...cardsFormation, card]
      changeCardsFormation(newCardsFormation)
    }
  }

  const handleOpenPack = async () => {
    setOpenPackLoading(true)
    if (openPackRef.current) {
      await openPackRef.current.handleOpenPack()
    }
    setOpenPackLoading(false)
  }

  // footer按钮配置
  const footerButtons = useMemo(
    () => [
      {
        key: 'fusion',
        icon: fusionIcon,
        className: 'w-43 h-44',
        onClick: () => navigate(getFusionPath()),
      },
      {
        key: 'gallery',
        icon: galleryIcon,
        className: 'w-43 h-44',
        onClick: () => navigate(getGalleryPath()),
      },
      {
        key: 'bag',
        icon: bagIcon,
        className: 'w-43.5 h-43.5',
        onClick: () =>
          changeCardsBagModalData({
            visible: true,
            type: ICardsBagModalType.VIEW,
          }),
      },
      {
        key: 'battle',
        icon: battleIcon,
        className: 'w-43 h-41',
        onClick: () => changeBattleModalVisible(true),
      },
      {
        key: 'reward',
        icon: rewardIcon,
        className: 'w-44 h-41',
        onClick: () => navigate(getRewardPath()),
        redDot: showRedDot,
      },
      {
        key: 'shop',
        icon: shopIcon,
        className: 'w-43 h-44',
        onClick: () => navigate(getShopPath()),
      },
    ],
    [changeBattleModalVisible, changeCardsBagModalData, navigate, showRedDot],
  )

  const openRedeemCodeModal = () => {
    setRedeemCodeModalVisible(true)
  }

  const openProfileModal = () => {
    setProfileModalVisible(true)
  }

  const renderFooterButton = (btn: (typeof footerButtons)[number]) => (
    <div
      key={btn.key}
      className={classNames(styles.footerBtn, btn.className)}
      style={{
        backgroundImage: `url(${btn.icon})`,
      }}
      onClick={btn.onClick}
    >
      {btn.redDot ? <div className={styles.footerRedDot}></div> : null}
    </div>
  )

  return (
    <div className={styles.pageContainer} ref={pageContainerRef}>
      <div className={styles.drawCardsEntranceContainer}>
        <div className={styles.drawCardsImage}></div>
        <button
          disabled={openPackLoading}
          className={classNames(styles.drawCardsButton, {
            button: !openPackLoading,
          })}
          onClick={handleOpenPack}
        >
          Open Pack 1<div></div>
        </button>
        {userInfo && appConfig ? (
          <div className={styles.legendaryGuaranteeText}>
            Guaranteed Legendary: <span>{userInfo.drawCountSinceLastLegendary}</span> packs/
            {appConfig.LegendaryDrawCardGuarantee} packs
          </div>
        ) : null}
      </div>
      {userInfo ? (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarContainer}>
              <img src={userInfo.avatar} alt="avatar" className={styles.avatar} />
            </div>
            <div className={styles.userInfoContainer}>
              <div className={styles.username}>{userInfo?.nickname}</div>
              <div className={styles.expBarBg}>
                <div className={styles.expBarFill} style={{ width: `${userInfo.expPercent}%` }} />
              </div>
              <div className={styles.iconBtnRow}>
                <div
                  className={classNames(styles.iconBtn, styles.settingBtn)}
                  onClick={openProfileModal}
                ></div>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.assetContainer}>
              <div className={styles.assetIconContainer}>
                <div className={styles.assetIcon1}></div>
              </div>
              <span className={styles.assetAmount}>{userInfo.solAmount}</span>
              <div className={styles.assetPlusButton} onClick={openRedeemCodeModal}></div>
            </div>
            <div className={styles.assetContainer}>
              <div className={styles.assetIconContainer}>
                <div className={styles.assetIcon2}></div>
              </div>
              <span className={styles.assetAmount}>{userInfo.faithAmount}</span>
              <div className={styles.assetFaithPlusButton}></div>
            </div>
          </div>
        </div>
      ) : null}
      <div className={styles.body}>
        {/* 左侧列表/排行榜 */}
        <Leaderboard></Leaderboard>
        {/* 中间抽卡/书本图示 */}
        <div className="flex-1"></div>
        {/* 右侧卡组展示 */}
        <CardsFormation
          setCardsFormationModalVisible={setCardsFormationModalVisible}
        ></CardsFormation>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(0, 3).map(renderFooterButton)}
        </div>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(3).map(renderFooterButton)}
        </div>
      </div>
      <Suspense fallback={null}>
        <OpenPack ref={openPackRef}></OpenPack>
      </Suspense>
      <Suspense fallback={null}>
        <CardsBagModal></CardsBagModal>
      </Suspense>
      <Suspense fallback={null}>
        <CardSelectModal
          open={cardsFormationModalVisible}
          onOpenChange={setCardsFormationModalVisible}
          selectedCardIds={selectedCards}
          handleCardSelect={handleCardSelect}
        ></CardSelectModal>
      </Suspense>
      <Suspense fallback={null}>
        <BattleModal></BattleModal>
      </Suspense>
      <Suspense fallback={null}>
        <RedeemCodeModal
          open={redeemCodeModalVisible}
          onOpenChange={setRedeemCodeModalVisible}
        ></RedeemCodeModal>
      </Suspense>
      <Suspense fallback={null}>
        {userInfo && appConfig ? (
          <ProfileModal
            open={profileModalVisible}
            onOpenChange={setProfileModalVisible}
          ></ProfileModal>
        ) : null}
      </Suspense>
      <Suspense fallback={null}>
        <MeetingGiftModal
          open={meetingGiftModalVisible}
          onOpenChange={setMeetingGiftModalVisible}
          handleClaimNewbieReward={handleClaimNewbieReward}
        ></MeetingGiftModal>
      </Suspense>
      <Suspense fallback={null}>
        <RewardResultModal
          open={rewardResultModalVisible}
          onOpenChange={setRewardResultModalVisible}
          title={"Contratulation! You've claimed the meeting gift."}
          reward={rewardResultModalData}
        ></RewardResultModal>
      </Suspense>
    </div>
  )
}

export default observer(HomePage)

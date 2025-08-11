import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Leaderboard from '@/pages/HomePage/Leaderboard.tsx'
import React, { Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import CardsFormation from '@/pages/HomePage/CardsFormation.tsx'
import { useNavigate } from 'react-router-dom'
import { getFusionPath, getGalleryPath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import fusionIcon from '../../..../../../src/assets/images/home_page/footer_button_fusion.png'
import galleryIcon from '../../../src/assets/images/home_page/footer_button_achs.png'
import bagIcon from '../../../src/assets/images/home_page/footer_button_bag.png'
import battleIcon from '../../../src/assets/images/home_page/footer_button_battle.png'
import rewardIcon from '../../../src/assets/images/home_page/footer_button_reward.png'
import shopIcon from '../../../src/assets/images/home_page/footer_button_shop.png'
import { type IOpenPackHandle } from '@/components/OpenPack.tsx'
import type { ICardDataInBag } from '@/stores/app-store.ts'
import API from '@/axios/api.ts'

const OpenPack = React.lazy(() => import('@/components/OpenPack.tsx'))
const CardsBagModal = React.lazy(() => import('@/pages/HomePage/CardsBagModal.tsx'))
const BattleModal = React.lazy(() => import('@/pages/HomePage/BattleModal.tsx'))
const CardSelectModal = React.lazy(() => import('@/components/CardSelectModal.tsx'))
const RedeemCodeModal = React.lazy(() => import('@/components/RedeemCodeModal.tsx'))
const ProfileModal = React.lazy(() => import('@/pages/HomePage/ProfileModal.tsx'))
const ShopModal = React.lazy(() => import('@/pages/HomePage/ShopModal.tsx'))

function HomePage() {
  const {
    appStore: { userInfo, appConfig, cardsFormation, changeCardsFormation, updateUserInfo },
    modalStore: { changeCardsBagModalData, changeBattleModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const [openPackLoading, setOpenPackLoading] = useState(false)
  const openPackRef = useRef<IOpenPackHandle>(null)
  const [cardsFormationModalVisible, setCardsFormationModalVisible] = useState(false)
  const selectedCards = useMemo(() => cardsFormation.map((card) => card.id), [cardsFormation])
  const [redeemCodeModalVisible, setRedeemCodeModalVisible] = useState(false)
  const [profileModalVisible, setProfileModalVisible] = useState(false)
  const [shopModalVisible, setShopModalVisible] = useState(false)

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

  const comingSoon = () => {
    toast.info('Coming Soon!')
  }

  const handleOpenPack = async () => {
    setOpenPackLoading(true)
    if (openPackRef.current) {
      await openPackRef.current.handleOpenPack()
    }
    setOpenPackLoading(false)
  }

  const handleNewbieRewardClaim = useCallback(async () => {
    if (!userInfo) return
    const result = await API.claimNewbieReward()
    if (result?.data?.success && result.data.user) {
      updateUserInfo({
        ...userInfo,
        ...result.data.user,
      })
    }
  }, [updateUserInfo, userInfo])

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
        onClick: handleNewbieRewardClaim,
        redDot: userInfo?.newbieRewardClaimed === false,
      },
      {
        key: 'shop',
        icon: shopIcon,
        className: 'w-43 h-44',
        onClick: () => setShopModalVisible(true),
      },
    ],
    [
      changeBattleModalVisible,
      changeCardsBagModalData,
      handleNewbieRewardClaim,
      navigate,
      userInfo?.newbieRewardClaimed,
    ],
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
                  className={classNames(styles.iconBtn, styles.notificationBtn)}
                  onClick={comingSoon}
                ></div>
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
      {userInfo && appConfig ? (
        <Suspense fallback={null}>
          <ProfileModal
            open={profileModalVisible}
            onOpenChange={setProfileModalVisible}
          ></ProfileModal>
        </Suspense>
      ) : null}
      <Suspense>
        <ShopModal open={shopModalVisible} onOpenChange={setShopModalVisible}></ShopModal>
      </Suspense>
    </div>
  )
}

export default observer(HomePage)

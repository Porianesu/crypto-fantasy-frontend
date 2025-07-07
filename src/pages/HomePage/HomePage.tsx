import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Leaderboard from '@/pages/HomePage/Leaderboard.tsx'
import React, { Suspense, useMemo, useRef, useState } from 'react'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import CardsFormation from '@/pages/HomePage/CardsFormation.tsx'
import { useNavigate } from 'react-router-dom'
import { getGalleryPath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import fusionIcon from '../../..../../../src/assets/images/home_page/footer_button_fusion.png'
import galleryIcon from '../../../src/assets/images/home_page/footer_button_achs.png'
import bagIcon from '../../../src/assets/images/home_page/footer_button_bag.png'
import battleIcon from '../../../src/assets/images/home_page/footer_button_battle.png'
import rewardIcon from '../../../src/assets/images/home_page/footer_button_reward.png'
import shopIcon from '../../../src/assets/images/home_page/footer_button_shop.png'
import { type IOpenPackHandle } from '@/components/OpenPack.tsx'
import type { ICardData } from '@/components/Card.tsx'

const OpenPack = React.lazy(() => import('@/components/OpenPack.tsx'))
const CardsBagModal = React.lazy(() => import('@/pages/HomePage/CardsBagModal.tsx'))
const BattleModal = React.lazy(() => import('@/pages/HomePage/BattleModal.tsx'))
const CardSelectModal = React.lazy(() => import('@/components/CardSelectModal.tsx'))

function HomePage() {
  const {
    appStore: { userInfo, cardsFormation, changeCardsFormation },
    modalStore: { changeCardsBagModalData, changeBattleModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const openPackRef = useRef<IOpenPackHandle>(null)
  const [cardsFormationModalVisible, setCardsFormationModalVisible] = useState(false)
  const selectedCards = useMemo(() => cardsFormation.map((card) => card.id), [cardsFormation])

  const handleCardSelect = (card: ICardData) => {
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

  const handleOpenPack = () => {
    if (openPackRef.current) {
      openPackRef.current.handleOpenPack()
    }
  }

  // footer按钮配置
  const footerButtons = [
    {
      key: 'fusion',
      icon: fusionIcon,
      className: 'w-43 h-44',
      onClick: comingSoon,
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
      onClick: comingSoon,
    },
    {
      key: 'shop',
      icon: shopIcon,
      className: 'w-43 h-44',
      onClick: comingSoon,
    },
  ]

  return (
    <div className={styles.pageContainer} ref={pageContainerRef}>
      <div className={styles.drawCardsEntranceContainer}>
        <div className={styles.drawCardsImage}></div>
        <div className={styles.drawCardsButton} onClick={handleOpenPack}>
          Open Pack 0.1
          <div></div>
        </div>
      </div>
      {userInfo ? (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarContainer}>
              <img src={userInfo.avatarUrl} alt="avatar" className={styles.avatar} />
            </div>
            <div className={styles.userInfoContainer}>
              <div className={styles.username}>{userInfo?.email}</div>
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
                  onClick={comingSoon}
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
              <div className={styles.assetPlusButton} onClick={comingSoon}></div>
            </div>
            <div className={styles.assetContainer}>
              <div className={styles.assetIconContainer}>
                <div className={styles.assetIcon2}></div>
              </div>
              <span className={styles.assetAmount}>{userInfo.faithAmount}</span>
              <div className={styles.assetPlusButton} onClick={comingSoon}></div>
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
          {footerButtons.slice(0, 3).map((btn) => (
            <div
              key={btn.key}
              className={classNames(styles.footerBtn, btn.className)}
              style={{
                backgroundImage: `url(${btn.icon})`,
              }}
              onClick={btn.onClick}
            ></div>
          ))}
        </div>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(3).map((btn) => (
            <div
              key={btn.key}
              className={classNames(styles.footerBtn, btn.className)}
              style={{
                backgroundImage: `url(${btn.icon})`,
              }}
              onClick={btn.onClick}
            ></div>
          ))}
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
          selectedCards={selectedCards}
          handleCardSelect={handleCardSelect}
        ></CardSelectModal>
      </Suspense>
      <Suspense fallback={null}>
        <BattleModal></BattleModal>
      </Suspense>
    </div>
  )
}

export default observer(HomePage)

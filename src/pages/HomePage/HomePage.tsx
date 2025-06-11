import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import Leaderboard from '@/pages/HomePage/Leaderboard.tsx'
import PreloadElement, { type IPreloadElementHandle } from '@/components/PreloadElement.tsx'
import React, { Suspense, useRef, useState } from 'react'
import { gsap } from 'gsap'
import DrawCardsModal from '@/pages/HomePage/DrawCardsModal.tsx'
import { type ICardData } from '@/components/Card.tsx'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import CardsFormation from '@/pages/HomePage/CardsFormation.tsx'
import { useNavigate } from 'react-router-dom'
import { getBattlePath, getGalleryPath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import fusionIcon from '../../..../../../src/assets/images/home_page/footer_button_fusion.png'
import galleryIcon from '../../../src/assets/images/home_page/footer_button_achs.png'
import bagIcon from '../../../src/assets/images/home_page/footer_button_bag.png'
import battleIcon from '../../../src/assets/images/home_page/footer_button_battle.png'
import rewardIcon from '../../../src/assets/images/home_page/footer_button_reward.png'
import shopIcon from '../../../src/assets/images/home_page/footer_button_shop.png'

const CardsBagModal = React.lazy(() => import('@/pages/HomePage/CardsBagModal.tsx'))
const CardsFormationModal = React.lazy(() => import('@/pages/HomePage/CardsFormationModal.tsx'))

function HomePage() {
  const {
    preloadStore: { audioInstanceMap },
    appStore: { userInfo, drawCards, addCardsToBag },
    modalStore: { changeDrawCardsModalVisible, changeCardsBagModalData },
  } = useMobxStore()
  const bgmSound = audioInstanceMap.get(AudioInstanceId.BGM)
  const drawCardSound = audioInstanceMap.get(AudioInstanceId.DrawCardSound)
  const navigate = useNavigate()
  const [cards, setCards] = useState<Array<ICardData>>([])
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<IPreloadElementHandle>(null)

  const handleOpenPack = () => {
    if (videoRef.current) {
      // 模拟获取5张随机卡片
      drawCards().then((cards) => {
        console.debug('获取到的随机卡片:', cards)
        setCards(cards)
        addCardsToBag(cards)
      })
      const containerWidth = gsap.getProperty(pageContainerRef.current, 'width')
      const containerHeight = gsap.getProperty(pageContainerRef.current, 'height')
      gsap.set(videoRef.current.getContainer(), {
        zIndex: 10,
        width: containerWidth,
        height: containerHeight,
      })
      gsap.to(videoRef.current.getContainer(), {
        autoAlpha: 1,
        duration: 0.3,
        onStart: () => {
          const videoEl = videoRef.current!.getElement() as HTMLVideoElement
          videoEl.loop = false
          videoEl.onended = () => {
            bgmSound?.setVolume(0.5)
            gsap.to(videoRef.current!.getContainer(), {
              autoAlpha: 0,
              duration: 0.3,
              onStart: () => {
                gsap.set(videoRef.current!.getContainer(), { zIndex: -1 })
                changeDrawCardsModalVisible(true)
              },
            })
          }
          bgmSound?.setVolume(0.2)
          if (drawCardSound) {
            drawCardSound.play({
              volume: 1,
            })
          }
          videoEl.play()
        },
      })
    }
  }

  const comingSoon = () => {
    toast.info('Coming Soon!')
  }

  // footer按钮配置
  const footerButtons = [
    {
      key: 'fusion',
      icon: fusionIcon,
      className: 'w-[173px] h-[177px]',
      onClick: comingSoon,
    },
    {
      key: 'gallery',
      icon: galleryIcon,
      className: 'w-[173px] h-[175px]',
      onClick: () => navigate(getGalleryPath()),
    },
    {
      key: 'bag',
      icon: bagIcon,
      className: 'w-[174px] h-[174px]',
      onClick: () =>
        changeCardsBagModalData({
          visible: true,
          type: ICardsBagModalType.VIEW,
        }),
    },
    {
      key: 'battle',
      icon: battleIcon,
      className: 'w-[173px] h-[164px]',
      onClick: () => navigate(getBattlePath()),
    },
    {
      key: 'reward',
      icon: rewardIcon,
      className: 'w-[177px] h-[165px]',
      onClick: comingSoon,
    },
    {
      key: 'shop',
      icon: shopIcon,
      className: 'w-[173px] h-[175px]',
      onClick: comingSoon,
    },
  ]

  return (
    <div className={styles.pageContainer} ref={pageContainerRef}>
      <div className={styles.drawCardsEntranceContainer}>
        <div className="w-[491px] h-[430px] bg-[url(/src/assets/images/home_page/open_package.png)] bg-contain bg-center bg-no-repeat mb-7"></div>
        <div
          className="cursor-pointer active:scale-90 flex items-center justify-center w-[340px] h-[102px] transition bg-[url(/src/assets/images/home_page/open_package_button_background.png)] bg-contain bg-center bg-no-repeat text-[36px] font-normal text-[#2A1914]"
          onClick={handleOpenPack}
        >
          Open Pack
        </div>
      </div>
      <PreloadElement
        ref={videoRef}
        id={'openPackVideo'}
        className={styles.videoContainer}
      ></PreloadElement>
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
              <span className={styles.assetAmount}>{userInfo.dustAmount}</span>
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
        <CardsFormation></CardsFormation>
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
      {cards.length ? <DrawCardsModal cards={cards}></DrawCardsModal> : null}
      <Suspense fallback={null}>
        <CardsBagModal></CardsBagModal>
      </Suspense>
      <Suspense fallback={null}>
        <CardsFormationModal></CardsFormationModal>
      </Suspense>
    </div>
  )
}

export default observer(HomePage)

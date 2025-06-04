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
import CardFormation from '@/pages/HomePage/CardFormation.tsx'
import { useNavigate } from 'react-router-dom'
import { getGalleryPath } from '@/navigation/routes.tsx'
import classNames from 'classnames'

const CardsBagModal = React.lazy(() => import('@/pages/HomePage/CardsBagModal.tsx'))

function HomePage() {
  const {
    appStore: { userInfo, drawCards, addCardsToBag },
    modalStore: { changeDrawCardsModalVisible, changeCardsBagModalData },
  } = useMobxStore()
  const navigate = useNavigate()
  const [cards, setCards] = useState<Array<ICardData>>([])
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<IPreloadElementHandle>(null)

  const handleOpenPackage = () => {
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
            // 这里处理播放完成后的逻辑
            console.log('视频播放完成')
            gsap.to(videoRef.current!.getContainer(), {
              autoAlpha: 0,
              duration: 0.3,
              onComplete: () => {
                gsap.set(videoRef.current!.getContainer(), { zIndex: -1 })
                changeDrawCardsModalVisible(true)
              },
            })
          }
          videoEl.play()
        },
      })
    }
  }

  const commingSoon = () => {
    alert('功能即将上线，敬请期待！')
  }

  // footer按钮配置
  const footerButtons = [
    {
      key: 'fusion',
      icon: '/src/assets/images/home_page/footer_button_fusion.png',
      className: 'w-[173px] h-[177px]',
      onClick: commingSoon,
    },
    {
      key: 'gallery',
      icon: '/src/assets/images/home_page/footer_button_achs.png',
      className: 'w-[173px] h-[175px]',
      onClick: () => navigate(getGalleryPath()),
    },
    {
      key: 'bag',
      icon: '/src/assets/images/home_page/footer_button_bag.png',
      className: 'w-[174px] h-[174px]',
      onClick: () =>
        changeCardsBagModalData({
          visible: true,
          type: ICardsBagModalType.VIEW,
        }),
    },
    {
      key: 'battle',
      icon: '/src/assets/images/home_page/footer_button_battle.png',
      className: 'w-[173px] h-[164px]',
      onClick: commingSoon,
    },
    {
      key: 'reward',
      icon: '/src/assets/images/home_page/footer_button_reward.png',
      className: 'w-[177px] h-[165px]',
      onClick: commingSoon,
    },
    {
      key: 'shop',
      icon: '/src/assets/images/home_page/footer_button_shop.png',
      className: 'w-[173px] h-[175px]',
      onClick: commingSoon,
    },
  ]

  return (
    <div className={styles.pageContainer} ref={pageContainerRef}>
      <PreloadElement
        ref={videoRef}
        id={'remoteVideo'}
        className={styles.videoContainer}
      ></PreloadElement>
      {userInfo ? (
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.avatarContainer}>
              <img src={userInfo.avatarUrl} alt="avatar" className={styles.avatar} />
            </div>
            <div>
              <div className={styles.username}>{userInfo?.email}</div>
              <div className={styles.expBarBg}>
                <div className={styles.expBarFill} style={{ width: `${userInfo.expPercent}%` }} />
              </div>
              <div className={styles.iconBtnRow}>
                <div
                  className={classNames(styles.iconBtn, styles.notificationBtn)}
                  onClick={commingSoon}
                ></div>
                <div
                  className={classNames(styles.iconBtn, styles.settingBtn)}
                  onClick={commingSoon}
                ></div>
              </div>
            </div>
          </div>
          <div className={styles.headerRight}>
            <div className={styles.assetContainer}>
              <div className={styles.assetIconContainer}>
                <div className={styles.assetIcon1}></div>
              </div>
              <span className={styles.assetAmount}>{userInfo.assetAmount}</span>
              <div className={styles.assetPlusButton} onClick={commingSoon}></div>
            </div>
            <div className={styles.assetContainer}>
              <div className={styles.assetIconContainer}>
                <div className={styles.assetIcon2}></div>
              </div>
              <span className={styles.assetAmount}>{userInfo.assetAmount}</span>
              <div className={styles.assetPlusButton} onClick={commingSoon}></div>
            </div>
          </div>
        </div>
      ) : null}
      <div className={styles.body}>
        <div className="w-full h-full flex flex-1 flex-row items-stretch justify-between">
          {/* 左侧列表/排行榜 */}
          <Leaderboard></Leaderboard>
          {/* 中间抽卡/书本图示 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-[491px] h-[430px] bg-[url(/src/assets/images/home_page/open_package.png)] bg-contain bg-center bg-no-repeat mb-7"></div>
            <div
              className="cursor-pointer active:scale-90 flex items-center justify-center w-[340px] h-[102px] transition bg-[url(/src/assets/images/home_page/open_package_button_background.png)] bg-contain bg-center bg-no-repeat text-[36px] font-normal text-[#2A1914]"
              onClick={handleOpenPackage}
            >
              Open Pack
            </div>
          </div>
          {/* 右侧卡组展示 */}
          <CardFormation></CardFormation>
        </div>
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
    </div>
  )
}

export default observer(HomePage)

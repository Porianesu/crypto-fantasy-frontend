import { observer } from 'mobx-react-lite'
import styles from './HomePage.module.css'
import {
  ArrowRightCircleIcon,
  BanknotesIcon,
  BookOpenIcon,
  Cog6ToothIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  GiftIcon,
  PlusCircleIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  TrophyIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
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

const CardsBagModal = React.lazy(() => import('@/pages/HomePage/CardsBagModal.tsx'))

function HomePage() {
  const {
    appStore: { userInfo, preloadQueue, addCardsToBag },
    modalStore: { changeDrawCardsModalVisible, changeCardsBagModalData },
  } = useMobxStore()
  const navigate = useNavigate()
  const [cards, setCards] = useState<Array<ICardData>>([])
  const pageContainerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<IPreloadElementHandle>(null)

  const getRandomCards = () => {
    return new Promise<Array<ICardData>>((resolve, reject) => {
      const cardsData = preloadQueue?.getResult('cardsData') as Array<ICardData>
      if (!cardsData) reject(new Error('未找到卡片数据'))
      const resultCards = Array.from({ length: 5 }, () => {
        const cardTypeIndex = Math.floor(Math.random() * (cardsData.length / 4)) * 4
        const cardRaritySeed = Math.random()
        if (cardRaritySeed >= 0.995) {
          // 0.5%概率抽到SSR
          return cardsData[cardTypeIndex + 3]
        } else if (cardRaritySeed >= 0.95) {
          // 4.5%概率抽到SR
          return cardsData[cardTypeIndex + 2]
        } else if (cardRaritySeed >= 0.75) {
          // 20%概率抽到R
          return cardsData[cardTypeIndex + 1]
        } else {
          // 75%概率抽到N
          return cardsData[cardTypeIndex]
        }
      })
      const cardsImagesPreloadQueue = new window.createjs.LoadQueue(true)
      cardsImagesPreloadQueue.installPlugin(window.createjs.Sound)
      cardsImagesPreloadQueue.on('complete', () => {
        console.debug('当次抽卡卡片图片预加载完成')
        resolve(resultCards)
      })
      cardsImagesPreloadQueue.on('error', reject)
      cardsImagesPreloadQueue.loadManifest(
        resultCards.map((item) => {
          return {
            id: `${item.id}-${item.rarity}`,
            src: item.imageUrl,
          }
        }),
      )
    })
  }

  const handleOpenPackage = () => {
    if (videoRef.current) {
      // 模拟获取5张随机卡片
      getRandomCards().then((cards) => {
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

  const handleMailClick = () => {
    alert('打开通知')
  }
  const handleSettingClick = () => {
    alert('打开设置')
  }
  const handleRechargeClick = () => {
    alert('充值入口')
  }

  // footer按钮配置
  const footerButtons = [
    {
      key: 'market',
      label: 'Market',
      icon: <ShoppingCartIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入市场'),
    },
    {
      key: 'gallery',
      label: 'Gallery',
      icon: <TrophyIcon className={styles.footerBtnIcon} />,
      onClick: () => navigate(getGalleryPath()),
    },
    {
      key: 'bag',
      label: 'Bag',
      icon: <ShoppingBagIcon className={styles.footerBtnIcon} />,
      onClick: () =>
        changeCardsBagModalData({
          visible: true,
          type: ICardsBagModalType.VIEW,
        }),
    },
    {
      key: 'shop',
      label: 'Shop',
      icon: <CurrencyDollarIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入商店'),
    },
    {
      key: 'reward',
      label: 'Reward',
      icon: <GiftIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入奖励'),
    },
    {
      key: 'referral',
      label: 'Referral',
      icon: <UsersIcon className={styles.footerBtnIcon} />,
      onClick: () => alert('进入礼盒'),
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
            <img src={userInfo.avatarUrl} alt="avatar" className={styles.avatar} />
            <div>
              <span className={styles.username}>{userInfo?.email}</span>
              {/* 经验进度条 */}
              <div className={styles.expBarWrapper}>
                <div className={styles.expBarBg}>
                  <div className={styles.expBarFill} style={{ width: `${userInfo.expPercent}%` }} />
                </div>
                <span className={styles.expBarText}>{userInfo.expPercent}%</span>
              </div>
              {/* 图标按钮 */}
              <div className={styles.iconBtnRow}>
                <button className={styles.iconBtn} onClick={handleMailClick} aria-label="通知">
                  <EnvelopeIcon className={styles.iconSvg + ' text-blue-500'} />
                </button>
                <button className={styles.iconBtn} onClick={handleSettingClick} aria-label="设置">
                  <Cog6ToothIcon className={styles.iconSvg + ' text-gray-500'} />
                </button>
              </div>
            </div>
          </div>
          <div className={styles.headerRightBox}>
            <span className={styles.assetIcon}>
              <BanknotesIcon className={styles.assetSvg + ' text-yellow-500'} />
            </span>
            <span className={styles.assetAmount}>{userInfo.assetAmount}</span>
            <button className={styles.rechargeBtn} onClick={handleRechargeClick} aria-label="充值">
              <PlusCircleIcon className={styles.rechargeSvg + ' text-yellow-600'} />
            </button>
          </div>
        </div>
      ) : null}
      <div className={styles.body}>
        <div className="w-full h-full flex flex-1 flex-row items-stretch justify-between">
          {/* 左侧列表/排行榜 */}
          <Leaderboard></Leaderboard>
          {/* 中间抽卡/书本图示 */}
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-white shadow flex items-center justify-center mb-6">
              <BookOpenIcon className="w-20 h-20 text-yellow-600" />
            </div>
            <button
              className="flex items-center px-6 py-2 rounded-full bg-yellow-500 text-white font-bold shadow hover:bg-yellow-600 transition"
              onClick={handleOpenPackage}
            >
              Open Pack
              <ArrowRightCircleIcon className="w-6 h-6 ml-2" />
            </button>
          </div>
          {/* 右侧卡组展示 */}
          <CardFormation></CardFormation>
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(0, 3).map((btn) => (
            <button key={btn.key} className={styles.footerBtn} onClick={btn.onClick}>
              {btn.icon}
              <span className={styles.footerBtnText}>{btn.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.footerBtnGroup}>
          {footerButtons.slice(3).map((btn) => (
            <button key={btn.key} className={styles.footerBtn} onClick={btn.onClick}>
              {btn.icon}
              <span className={styles.footerBtnText}>{btn.label}</span>
            </button>
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

import { observer } from 'mobx-react-lite'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styles from './ShopPage.module.css'
import classNames from 'classnames'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { useQuery } from '@tanstack/react-query'
import API, { type ShopItem } from '@/axios/api.ts'
import { GiftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'
import { BigNumber } from 'bignumber.js'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import CommonPageLayout from '@/components/CommonPageLayout.tsx'

const RewardResultModal = React.lazy(() => import('@/components/RewardResultModal.tsx'))

const Tabs = [
  {
    label: 'Daily Gift',
    key: 'daily_gift',
    icon: (className: string) => <GiftIcon className={className} />,
  },
  {
    label: 'Recharge',
    key: 'recharge',
    icon: (className: string) => <CurrencyDollarIcon className={className} />,
  },
]

const ShopPage: React.FC = () => {
  const {
    rewardStore: { buyItem },
    preloadStore: { audioInstanceMap },
  } = useMobxStore()
  const { data, isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: API.getShopItems,
    refetchInterval: 5 * 60 * 1000, // 每5分钟刷新一次
    refetchOnWindowFocus: false,
  })
  const successSound = audioInstanceMap.get(AudioInstanceId.CraftSuccessSound)
  const [selectedTab, setSelectedTab] = useState<string>(Tabs[0].key)
  const [shopItems, setShopItems] = useState<Array<ShopItem>>([])
  const isDailyGiftTab = useMemo(() => selectedTab === 'daily_gift', [selectedTab])
  const filteredShopItems = useMemo(
    () =>
      shopItems.filter((item) => {
        if (isDailyGiftTab) {
          return item.dailyLimit > 0
        } else {
          return item.dailyLimit <= 0
        }
      }),
    [isDailyGiftTab, shopItems],
  )
  const [rewardResultModalVisible, setRewardResultModalVisible] = useState<boolean>(false)
  const [rewardResultModalData, setRewardResultModalData] = useState<RewardResultModalData>({})
  const shopItemsContainerRef = useRef<HTMLDivElement>(null)
  const dailyGiftRefs = useRef<Array<HTMLDivElement>>([])
  const rechargeRefs = useRef<Array<HTMLDivElement>>([])

  useEffect(() => {
    if (!isLoading && data?.data?.items && Array.isArray(data.data.items)) {
      setShopItems(
        data.data.items.sort((a, b) => {
          return a.price - b.price
        }),
      )
    }
  }, [data?.data?.items, isLoading])

  useGSAP(
    () => {
      if (selectedTab === 'daily_gift') {
        gsap.fromTo(
          dailyGiftRefs.current,
          { x: (i) => (i === 0 ? '-100%' : '100%'), opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
        )
      } else {
        gsap.fromTo(
          rechargeRefs.current,
          { y: 100, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)' },
        )
      }
    },
    {
      dependencies: [selectedTab],
      scope: shopItemsContainerRef,
    },
  )

  const handleBuyItem = async (item: ShopItem) => {
    const result = await buyItem(item)
    if ((result as unknown as string) === 'success') {
      // 更新今日已购买数量
      setShopItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id ? { ...i, todayPurchased: i.todayPurchased + 1 } : i,
        ),
      )
      if (successSound) {
        successSound.play({
          volume: 1,
        })
      }
      setRewardResultModalVisible(true)
      setRewardResultModalData({
        solAmount: item.rewardSol || 0,
        faithAmount: item.rewardFaith || 0,
        melt: item.rewardMeltTimes || 0,
      })
    }
  }

  const renderDailyGiftItem = (item: ShopItem, index: number) => {
    const isItemClaimable = item.todayPurchased < item.dailyLimit
    const isCoinGift = item.key === 'daily_gift_coin'
    const rewardArray = [
      item.rewardSol ? { type: 'sol', amount: item.rewardSol } : null,
      item.rewardFaith ? { type: 'faith', amount: item.rewardFaith } : null,
      item.rewardMeltTimes ? { type: 'melt', amount: item.rewardMeltTimes } : null,
    ].filter(Boolean) as Array<{ type: string; amount: number }>
    return (
      <div
        key={item.id}
        className={classNames(styles.dailyGiftContainer, {
          [styles.dailyGiftContainerCoin]: isCoinGift,
          [styles.dailyGiftContainerItem]: !isCoinGift,
        })}
        ref={(el) => {
          if (el) {
            dailyGiftRefs.current[index] = el
          }
        }}
      >
        <div
          className={classNames(styles.dailyGiftPoster, {
            [styles.dailyGiftPosterCoin]: isCoinGift,
            [styles.dailyGiftPosterItem]: !isCoinGift,
          })}
        ></div>
        <div
          className={classNames(styles.dailyGiftTitle, {
            [styles.dailyGiftTitleCoin]: isCoinGift,
            [styles.dailyGiftTitleItem]: !isCoinGift,
          })}
        >
          {item.name}
        </div>
        <div className={styles.dailyGiftDescriptionContainer}>Claim the gift for free!</div>
        <div className={styles.rewardsContainer}>
          {rewardArray.map((reward) => (
            <div className={styles.rewardContainer} key={reward.type}>
              <div
                className={classNames(styles.rewardImageContainer, {
                  [styles.rewardImageContainerYellow]: reward.type === 'sol',
                  [styles.rewardImageContainerPurple]: reward.type !== 'sol',
                })}
              >
                <div
                  className={classNames(styles.rewardImage, {
                    [styles.rewardImageSol]: reward.type === 'sol',
                    [styles.rewardImageFaith]: reward.type === 'faith',
                    [styles.rewardImageMelt]: reward.type === 'melt',
                  })}
                >
                  {reward.type === 'melt' ? (
                    <div className={styles.rewardDescription}>
                      Increase the card dismantling limit.
                    </div>
                  ) : null}
                </div>
              </div>
              <div>x{reward.amount}</div>
            </div>
          ))}
        </div>
        <button
          className={classNames(styles.claimButton, {
            button: isItemClaimable,
            [styles.claimButtonAvailable]: isItemClaimable,
            [styles.claimButtonDisabled]: !isItemClaimable,
          })}
          disabled={!isItemClaimable}
          onClick={() => handleBuyItem(item)}
        >
          {isItemClaimable ? 'Get it now' : 'Claimed'}
        </button>
      </div>
    )
  }

  const renderRechargeItem = (item: ShopItem, index: number) => {
    const itemValue = new BigNumber(item.price).times(100)
    const discount = new BigNumber(item.rewardFaith).minus(itemValue).div(itemValue).times(100)
    return (
      <div
        key={item.id}
        className={styles.rechargeItemContainer}
        ref={(el) => {
          if (el) {
            rechargeRefs.current[index] = el
          }
        }}
      >
        {discount.isZero() ? null : (
          <div className={styles.rechargeItemDiscountContainer}>
            <div className={styles.rechargeItemDiscountIcon}></div>
            <div className={styles.rechargeItemDiscountText}>
              {discount.toFormat({
                prefix: '+',
                suffix: '%',
              })}
            </div>
          </div>
        )}
        <div className={styles.rechargeItemHeader}>
          <div className={styles.rechargeItemPriceIcon}></div>
          <div>{item.rewardFaith}</div>
        </div>
        <div className={styles.rechargeItemBody}>
          <div
            className={classNames(styles.rechargeItemReward, styles[`rechargeItemReward_${index}`])}
          ></div>
        </div>
        <button
          className={classNames(styles.rechargeItemButton, 'button')}
          onClick={() => handleBuyItem(item)}
        >
          {item.price}
          <div className={styles.rechargeItemButtonIcon}></div>
        </button>
      </div>
    )
  }

  return (
    <CommonPageLayout
      title={'Game Shop'}
      Tabs={Tabs}
      selectedTab={selectedTab}
      setSelectedTab={setSelectedTab}
      containerClassName={styles.pageContainer}
    >
      <div
        className={classNames(styles.shopItemsContainer, {
          [styles.shopItemsContainerLoading]: !filteredShopItems?.length,
          [styles.shopItemsContainerDailyGift]: isDailyGiftTab,
          [styles.shopItemsContainerRecharge]: !isDailyGiftTab,
        })}
        ref={shopItemsContainerRef}
      >
        {filteredShopItems.length ? (
          filteredShopItems.map((item, index) =>
            isDailyGiftTab ? renderDailyGiftItem(item, index) : renderRechargeItem(item, index),
          )
        ) : (
          <div className={styles.loadingText}>Loading . . .</div>
        )}
      </div>
      <Suspense fallback={null}>
        <RewardResultModal
          open={rewardResultModalVisible}
          onOpenChange={setRewardResultModalVisible}
          title={'Congratulations! You got rewards!'}
          reward={rewardResultModalData}
        ></RewardResultModal>
      </Suspense>
    </CommonPageLayout>
  )
}
export default observer(ShopPage)

import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import styles from './ShopPage.module.css'
import classNames from 'classnames'
import { getHomePath } from '@/navigation/routes.tsx'
import { useNavigate } from 'react-router-dom'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { useQuery } from '@tanstack/react-query'
import API, { type ShopItem } from '@/axios/api.ts'
import { GiftIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

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
  const navigate = useNavigate()
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const { data, isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: API.getShopItems,
    refetchInterval: 5 * 60 * 1000, // 每5分钟刷新一次
    refetchOnWindowFocus: false,
  })
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

  useEffect(() => {
    if (!isLoading && data?.data?.items && Array.isArray(data.data.items)) {
      setShopItems(data.data.items)
    }
  }, [data?.data?.items, isLoading])

  const handleBack = () => {
    navigate(getHomePath())
  }

  const renderDailyGiftItem = (item: ShopItem) => {
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
            <div className={styles.rewardContainer}>
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
                ></div>
              </div>
              <div>x{reward.amount}</div>
            </div>
          ))}
        </div>
        <button
          className={classNames(styles.claimButton, {
            button: isItemClaimable,
          })}
        >
          {isItemClaimable ? 'Get it now' : 'Claimed'}
        </button>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={classNames(styles.backButton, 'button')} onClick={handleBack}></button>
          <div className={styles.title}>Game Shop</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon1}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.solAmount || 0}</span>
          </div>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon2}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.faithAmount || 0}</span>
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.tabsContainer}>
          {Tabs.map((tab) => (
            <div
              key={tab.key}
              className={classNames(styles.tabContainer, 'button', {
                [styles.tabContainerSelected]: selectedTab === tab.key,
                [styles.tabContainerUnselected]: selectedTab !== tab.key,
              })}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.icon(classNames(styles.tabIcon))}
              {tab.label}
            </div>
          ))}
        </div>
        <div className={styles.line}></div>
        <div
          className={classNames(styles.shopItemsContainer, {
            [styles.shopItemsContainerLoading]: !filteredShopItems?.length,
            [styles.shopItemsContainerDailyGift]: isDailyGiftTab,
            [styles.shopItemsContainerRecharge]: !isDailyGiftTab,
          })}
        >
          {filteredShopItems.length ? (
            filteredShopItems.map((item) =>
              isDailyGiftTab ? renderDailyGiftItem(item) : <div>123</div>,
            )
          ) : (
            <div className={styles.loadingText}>Loading . . .</div>
          )}
        </div>
      </div>
    </div>
  )
}
export default observer(ShopPage)

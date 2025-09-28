import { observer } from 'mobx-react-lite'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import styles from './ShopPage.module.css'
import classNames from 'classnames'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { useQuery } from '@tanstack/react-query'
import API, { type IMagicItem, type ShopItem } from '@/axios/api.ts'
import { GiftIcon, CurrencyDollarIcon, StarIcon } from '@heroicons/react/24/outline'
import { BigNumber } from 'bignumber.js'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import type { RewardResultModalData } from '@/components/RewardResultModal.tsx'
import CommonPageLayout, { type CommonPageLayoutTab } from '@/components/CommonPageLayout.tsx'
import { toast } from 'react-toastify'

const RewardResultModal = React.lazy(() => import('@/components/RewardResultModal.tsx'))

type ShopPageTabKey = 'daily_gift' | 'recharge' | 'items'
const Tabs: Array<CommonPageLayoutTab<ShopPageTabKey>> = [
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
  {
    label: 'Items',
    key: 'items',
    icon: (className: string) => <StarIcon className={className} />,
  },
]

const ShopPage: React.FC = () => {
  const {
    rewardStore: { magicItems, buyMagicItem, buyShopItem },
    preloadStore: { audioInstanceMap },
  } = useMobxStore()
  const { data, isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: API.getShopItems,
    staleTime: 2 * 60 * 1000, // 数据2分钟内不被认为过时
    refetchInterval: 5 * 60 * 1000, // 每5分钟刷新一次
    refetchOnWindowFocus: false,
  })
  const successSound = audioInstanceMap.get(AudioInstanceId.CraftSuccessSound)
  const [selectedTab, setSelectedTab] = useState<ShopPageTabKey>(Tabs[0].key)
  const [shopItems, setShopItems] = useState<Array<ShopItem>>([])
  const filteredShopItems = useMemo(
    () =>
      shopItems.filter((item) => {
        if (selectedTab === 'daily_gift') {
          return item.dailyLimit > 0
        } else {
          return item.dailyLimit <= 0
        }
      }),
    [selectedTab, shopItems],
  )
  const [rewardResultModalVisible, setRewardResultModalVisible] = useState<boolean>(false)
  const [rewardResultModalData, setRewardResultModalData] = useState<RewardResultModalData>({})
  const [rewardResultModalTitle, setRewardResultModalTitle] = useState<string>(
    'Congratulations! You got rewards!',
  )
  const shopItemsContainerRef = useRef<HTMLDivElement>(null)
  const dailyGiftRefs = useRef<Array<HTMLDivElement>>([])
  const rechargeRefs = useRef<Array<HTMLDivElement>>([])
  const itemsRefs = useRef<Array<HTMLDivElement>>([])

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
      switch (selectedTab) {
        case 'daily_gift':
          gsap.fromTo(
            dailyGiftRefs.current,
            { x: (i) => (i === 0 ? '-100%' : '100%'), opacity: 0 },
            { x: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
          )
          break
        case 'recharge':
          gsap.fromTo(
            rechargeRefs.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)' },
          )
          break
        case 'items':
          gsap.fromTo(
            itemsRefs.current,
            { y: 100, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)' },
          )
          break
        default:
          break
      }
    },
    {
      dependencies: [selectedTab],
      scope: shopItemsContainerRef,
    },
  )

  const handleBuyShopItem = async (item: ShopItem) => {
    const result = (await buyShopItem(item)) as unknown as string
    if (result === 'success') {
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
      setRewardResultModalTitle(
        item.dailyLimit > 0
          ? "Contratulation! You've claimed the daily gift."
          : "Contratulation! You've bought the faithcoin successfully.",
      )
      setRewardResultModalVisible(true)
      setRewardResultModalData({
        solAmount: item.rewardSol || 0,
        faithAmount: item.rewardFaith || 0,
        melt: item.rewardMeltTimes || 0,
      })
    }
  }

  const handleBuyMagicItem = async (item: IMagicItem) => {
    const result = (await buyMagicItem(item, 1)) as unknown as string
    if (result === 'success') {
      toast.success(`You have purchased the ${item.name} successfully!`)
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
            [styles.buttonAction]: isItemClaimable,
            [styles.claimButtonAvailable]: isItemClaimable,
            [styles.claimButtonDisabled]: !isItemClaimable,
          })}
          disabled={!isItemClaimable}
          onClick={() => handleBuyShopItem(item)}
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
          className={classNames(styles.rechargeItemButton, styles.buttonAction)}
          onClick={() => handleBuyShopItem(item)}
        >
          {item.price}
          <div className={styles.rechargeItemButtonIcon}></div>
        </button>
      </div>
    )
  }

  const renderMagicItem = (item: IMagicItem, index: number) => {
    return (
      <div
        key={item.id}
        ref={(el) => {
          if (el) {
            itemsRefs.current[index] = el
          }
        }}
      >
        <div>{item.name}</div>
        <div>{item.description}</div>
        <div>{`Sol price: ${item.solPrice}`}</div>
        <div>{`Faith price: ${item.faithPrice}`}</div>
        <button className={classNames('button')} onClick={() => handleBuyMagicItem(item)}>
          Buy One
        </button>
      </div>
    )
  }

  const renderBody = () => {
    let shouldShowLoading = true
    if (selectedTab === 'recharge' || selectedTab === 'daily_gift') {
      shouldShowLoading = !filteredShopItems.length
    } else if (selectedTab === 'items') {
      shouldShowLoading = !magicItems?.length
    }
    if (shouldShowLoading) {
      return <div className={styles.loadingText}>Loading . . .</div>
    }

    switch (selectedTab) {
      case 'daily_gift':
        return filteredShopItems.map(renderDailyGiftItem)
      case 'recharge':
        return filteredShopItems.map(renderRechargeItem)
      case 'items':
        return magicItems?.map(renderMagicItem)
      default:
        return null
    }
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
          [styles.shopItemsContainerDailyGift]: selectedTab === 'daily_gift',
          [styles.shopItemsContainerRecharge]: selectedTab === 'recharge',
          [styles.shopItemsContainerItems]: selectedTab === 'items',
        })}
        ref={shopItemsContainerRef}
      >
        {renderBody()}
      </div>
      <Suspense fallback={null}>
        <RewardResultModal
          open={rewardResultModalVisible}
          onOpenChange={setRewardResultModalVisible}
          title={rewardResultModalTitle}
          reward={rewardResultModalData}
        ></RewardResultModal>
      </Suspense>
    </CommonPageLayout>
  )
}
export default observer(ShopPage)

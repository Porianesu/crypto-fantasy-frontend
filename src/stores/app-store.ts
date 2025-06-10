import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import { preloadPages } from '@/navigation/routes.tsx'
import { USER_INFO_STORAGE_KEY, type UserStorageInfo } from '@/utils/constant.ts'
import { getCardImageById, getDefaultAvatar, getStorageItem } from '@/utils/common.ts'
import type { ICardData } from '@/components/Card.tsx'
import { toast } from 'react-toastify'
import { BigNumber } from 'bignumber.js'

interface UserInfo extends UserStorageInfo {
  avatarUrl: string
  solAmount: number
  dustAmount: number
  expPercent: number
}

export default class StoresStore {
  rootStoreRef: Store

  isAppLoading = true

  userInfo: UserInfo | undefined = undefined

  cardsFormation: Array<ICardData> = []

  cardsBag: Array<ICardData> = []

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      isAppLoading: observable,
      setIsAppLoading: action,
      userInfo: observable,
      cardsFormation: observable,
      changeCardsFormation: action,
      userCardsFormationScore: computed,
      cardsBag: observable,
      addCardsToBag: action,
      initNetwork: flow.bound,
      initData: flow.bound,
      drawCards: action,
    })
  }

  resetStore = () => {
    this.isAppLoading = true
    this.userInfo = undefined
    this.cardsFormation = []
    this.cardsBag = []
  };

  *initNetwork() {
    try {
      // Simulate network initialization
      const result: UserStorageInfo = yield new Promise((resolve) =>
        setTimeout(() => {
          const storageUserInfo = getStorageItem(USER_INFO_STORAGE_KEY)
          resolve(storageUserInfo)
        }, 1000),
      )
      console.log('Network initialized with user info:', result)
      this.userInfo = {
        ...result,
        avatarUrl: getDefaultAvatar(),
        solAmount: 100,
        dustAmount: 0,
        expPercent: 68,
      }
      this.cardsFormation = []
      this.cardsBag = []
      this.rootStoreRef.preloadStore.preloadResult.networkPreloadProgress = 1
    } catch (e) {
      console.log('Error initializing network:', e)
    }
  }

  *initData() {
    if (!this.isAppLoading) return
    this.isAppLoading = true
    try {
      preloadPages().then(() => {
        this.rootStoreRef.preloadStore.preloadResult.pagesPreloadProgress = 1
      })
      this.rootStoreRef.preloadStore.loadCreateJS().then(() => {
        this.rootStoreRef.preloadStore.preloadAssets()
      })
      this.initNetwork()
    } catch (e) {
      console.log('Error preloading assets:', e)
    }
    this.isAppLoading = false
  }

  setIsAppLoading = (newValue: boolean) => {
    this.isAppLoading = newValue
  }

  changeCardsFormation = (cards: Array<ICardData>) => {
    this.cardsFormation = cards
  }

  get userCardsFormationScore() {
    return this.cardsFormation.reduce((total, card) => {
      return total + card.score
    }, 0)
  }

  addCardsToBag = (cards: Array<ICardData>) => {
    this.cardsBag = this.cardsBag.concat(cards)
  }

  drawCards = () => {
    return new Promise<Array<ICardData>>((resolve, reject) => {
      if (!this.userInfo || this.userInfo.solAmount <= 0.1)
        return toast.warn('Insufficient Balance!')
      const cardsData = this.rootStoreRef.preloadStore.preloadQueue?.getResult(
        'cardsData',
      ) as Array<ICardData>
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
      const preloadImageList = resultCards.reduce<Array<{ id: string; src: string }>>(
        (previousValue, currentValue) => {
          if (currentValue.imageUrl) {
            previousValue.push({
              id: `cardImage${currentValue.id}${currentValue.rarity}`,
              src: getCardImageById(currentValue.id),
            })
          }
          return previousValue
        },
        [],
      )
      if (preloadImageList.length) {
        const cardsImagesPreloadQueue = new window.createjs.LoadQueue(true)
        cardsImagesPreloadQueue.installPlugin(window.createjs.Sound)
        cardsImagesPreloadQueue.on('complete', () => {
          console.debug('当次抽卡卡片图片预加载完成')
          this.userInfo!.solAmount = new BigNumber(this.userInfo!.solAmount).minus(0.1).toNumber()
          resolve(resultCards)
        })
        cardsImagesPreloadQueue.on('error', () => {
          console.error('当次抽卡卡片图片预加载失败')
          this.userInfo!.solAmount = new BigNumber(this.userInfo!.solAmount).minus(0.1).toNumber()
          resolve(resultCards)
        })
        cardsImagesPreloadQueue.loadManifest(preloadImageList)
      } else {
        console.debug('当次抽卡卡片图片预加载列表为空，直接返回结果')
        this.userInfo!.solAmount = new BigNumber(this.userInfo!.solAmount).minus(0.1).toNumber()
        resolve(resultCards)
      }
    })
  }
}

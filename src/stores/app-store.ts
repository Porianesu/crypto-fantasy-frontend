import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import preloadManifest from '@/stores/preloadManifest.ts'
import { BigNumber } from 'bignumber.js'
import { preloadPages } from '@/navigation/routes.tsx'
import { USER_INFO_STORAGE_KEY, type UserStorageInfo } from '@/utils/constant.ts'
import { getStorageItem } from '@/utils/common.ts'
import type { ICardData } from '@/components/Card.tsx'

interface PreloadProgressEvent {
  loaded: number
  progress: number
  total: number
}
interface UserInfo extends UserStorageInfo {
  avatarUrl: string
  assetAmount: number
  expPercent: number
}

export default class StoresStore {
  rootStoreRef: Store

  isAppLoading = true

  preloadQueue: createjs.LoadQueue | undefined = undefined

  preloadResult = {
    assetPreloadProgress: 0,
    pagesPreloadProgress: 0,
    networkPreloadProgress: 0,
  }

  userInfo: UserInfo | undefined = undefined

  cardsFormation: Array<ICardData> = []

  cardsBag: Array<ICardData> = []

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      isAppLoading: observable,
      preloadResult: observable,
      preloadProgress: computed,
      handlePreloadProgress: action,
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
    this.preloadQueue = undefined
    this.preloadResult = {
      assetPreloadProgress: 0,
      pagesPreloadProgress: 0,
      networkPreloadProgress: 0,
    }
    this.userInfo = undefined
    this.cardsFormation = []
    this.cardsBag = []
  }

  loadCreateJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://code.createjs.com/1.0.0/createjs.min.js'
      script.async = true
      script.onload = () => {
        console.log('CreateJS loaded successfully')
        resolve()
      }
      script.onerror = () => {
        console.error('Failed to load CreateJS')
        reject(new Error('Failed to load CreateJS'))
      }
      document.body.appendChild(script)
    })
  }

  handlePreloadProgress = (event: object) => {
    this.preloadResult.assetPreloadProgress = (event as unknown as PreloadProgressEvent).progress
  }

  preloadAssets = () => {
    if (!window.createjs?.PreloadJS) return
    return new Promise<object>((resolve, reject) => {
      const queue = new window.createjs.LoadQueue(true)
      queue.installPlugin(window.createjs.Sound)
      queue.on(
        'complete',
        (event) => {
          this.preloadQueue = queue
          resolve(event)
        },
        this,
      )
      queue.on('error', reject, this)
      queue.on('progress', this.handlePreloadProgress)
      queue.loadManifest(preloadManifest)
    })
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
        avatarUrl: 'https://via.placeholder.com/40',
        assetAmount: 12345,
        expPercent: 68,
      }
      this.cardsFormation = []
      this.cardsBag = []
      this.preloadResult.networkPreloadProgress = 1
    } catch (e) {
      console.log('Error initializing network:', e)
    }
  }

  *initData() {
    if (!this.isAppLoading) return
    this.isAppLoading = true
    try {
      preloadPages().then(() => {
        this.preloadResult.pagesPreloadProgress = 1
      })
      this.loadCreateJS().then(() => {
        this.preloadAssets()
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

  get preloadProgress() {
    return new BigNumber(this.preloadResult.assetPreloadProgress)
      .plus(this.preloadResult.pagesPreloadProgress)
      .plus(this.preloadResult.networkPreloadProgress)
      .dividedBy(3)
      .decimalPlaces(2)
      .toNumber()
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
      if (!this.userInfo || this.userInfo.assetAmount <= 1000)
        return alert('Out of assets, please recharge first.')
      const cardsData = this.preloadQueue?.getResult('cardsData') as Array<ICardData>
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
        this.userInfo!.assetAmount -= 1000
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
}

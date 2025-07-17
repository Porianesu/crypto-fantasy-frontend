import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import { preloadPages } from '@/navigation/routes.tsx'
import { USER_INFO_STORAGE_KEY, type UserStorageInfo } from '@/utils/constant.ts'
import {
  getCardImageById,
  getDefaultAvatar,
  getStorageItem,
  isCardsSameChain,
} from '@/utils/common.ts'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import { toast } from 'react-toastify'
import { BigNumber } from 'bignumber.js'

export interface UserInfo extends UserStorageInfo {
  avatarUrl: string
  solAmount: number
  faithAmount: number
  expPercent: number
  meltOpportunity: {
    current: number
    max: number
  }
}

export interface ICardDataInBag extends ICardData {
  bagPosition: number
}

export interface ICardDataWithCount extends ICardData {
  count: number
}

export default class StoresStore {
  rootStoreRef: Store

  isAppLoading = true

  userInfo: UserInfo | undefined = undefined

  cardsFormation: Array<ICardData> = []

  _cardsBag: Array<ICardData> = []

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
      _cardsBag: observable,
      cardsBag: computed,
      formattedCardsBag: computed,
      addCardsToBag: action,
      initNetwork: flow.bound,
      initData: flow.bound,
      drawCards: action,
      craftCard: action,
      meltCard: action,
    })
  }

  resetStore = () => {
    this.isAppLoading = true
    this.userInfo = undefined
    this.cardsFormation = []
    this._cardsBag = []
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
        faithAmount: 10000,
        expPercent: 68,
        meltOpportunity: {
          max: 20,
          current: 20,
        },
      }
      this.cardsFormation = []
      this._cardsBag = []
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

  get cardsBag() {
    return this._cardsBag.map((card, index) => ({ ...card, bagPosition: index }))
  }

  get formattedCardsBag() {
    // 格式化卡牌背包数据，统计每张卡牌的数量
    const cardCountMap: Record<string, ICardDataWithCount> = {}
    this._cardsBag.forEach((card) => {
      if (cardCountMap[card.id]) {
        cardCountMap[card.id].count += 1
      } else {
        cardCountMap[card.id] = { ...card, count: 1 }
      }
    })
    return Object.values(cardCountMap)
  }

  addCardsToBag = (cards: Array<ICardData>) => {
    this._cardsBag = this._cardsBag.concat(cards)
  }

  drawCards = () => {
    return new Promise<Array<ICardData>>((resolve, reject) => {
      if (!this.userInfo || this.userInfo.solAmount <= 0.1)
        return toast.warn('Insufficient Balance!')
      const cardsData = this.rootStoreRef.preloadStore.preloadQueue?.getResult(
        'cardsData',
      ) as Array<ICardData>
      if (!cardsData) reject(new Error('未找到卡片数据'))
      // 先生成所有可用的 cardTypeIndex
      const cardTypeCount = cardsData.length / 4
      const availableIndexes = Array.from({ length: cardTypeCount }, (_, i) => i)
      // 随机抽取5个不重复的 cardTypeIndex
      for (let i = availableIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[availableIndexes[i], availableIndexes[j]] = [availableIndexes[j], availableIndexes[i]]
      }
      const selectedIndexes = availableIndexes.slice(0, 5)
      const resultCards = selectedIndexes.map((cardTypeIndex) => {
        const baseIndex = cardTypeIndex * 4
        const cardRaritySeed = Math.random()
        if (cardRaritySeed >= 0.995) {
          // 0.5%概率抽到SSR
          return cardsData[baseIndex + 3]
        } else if (cardRaritySeed >= 0.95) {
          // 4.5%概率抽到SR
          return cardsData[baseIndex + 2]
        } else if (cardRaritySeed >= 0.75) {
          // 20%概率抽到R
          return cardsData[baseIndex + 1]
        } else {
          // 75%概率抽到N
          return cardsData[baseIndex]
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

  craftCard = (
    targetCard: ICardData,
    requiredCards: Array<{
      card: ICardData
      position: number
    }>,
    additiveCards: Array<{
      card: ICardData
      position: number
    }>,
    successRate: BigNumber,
    costFaithCoin: number,
  ): void | { type: 'success' | 'fail'; cards: Array<ICardData> } => {
    if (!this.userInfo) return
    const cardDatabase = this.rootStoreRef.preloadStore.preloadQueue!.getResult(
      'cardsData',
    ) as Array<ICardData>
    if (!cardDatabase) {
      return console.error('Card database not found')
    }
    let returnAdditiveCard
    if (additiveCards.length) {
      const maxRarity = Math.max(...additiveCards.map((item) => item.card.rarity))
      const highestRarityAdditiveCards = additiveCards.filter(
        (item) => item.card.rarity === maxRarity,
      )
      const randomAdditiveCardIndex = Math.floor(Math.random() * highestRarityAdditiveCards.length)
      const beforeReturnAdditiveCard = highestRarityAdditiveCards[randomAdditiveCardIndex]
      const targetRarity =
        beforeReturnAdditiveCard.card.rarity === CARD_RARITY.NORMAL
          ? CARD_RARITY.NORMAL
          : beforeReturnAdditiveCard.card.rarity - 1
      returnAdditiveCard = cardDatabase.find(
        (card) =>
          card.rarity === targetRarity && isCardsSameChain(card, beforeReturnAdditiveCard.card),
      )
      if (!returnAdditiveCard) {
        return console.error('No matching return additive card found')
      }
    }
    const randomNumber = new BigNumber(Math.random())
    const costCardWithBagPositions = requiredCards
      .concat(additiveCards)
      .map((item) => item.position)
    // 降序移除已消耗的卡牌
    const sortedPositions = costCardWithBagPositions.sort((a, b) => b - a)
    sortedPositions.forEach((index) => {
      this._cardsBag.splice(index, 1)
    })
    if (randomNumber.isGreaterThanOrEqualTo(successRate)) {
      // 成功则添加新卡到背包
      this._cardsBag.push(targetCard)
      this.userInfo.faithAmount -= costFaithCoin
      return {
        type: 'success',
        cards: [targetCard],
      }
    } else {
      // 失败则按规则添加一部分消耗的卡牌到背包
      const randomRequiredCardIndex = Math.floor(Math.random() * requiredCards.length)
      const returnRequiredCards = requiredCards[randomRequiredCardIndex]
      const resultCards = [returnRequiredCards.card]
      if (returnAdditiveCard) {
        resultCards.push(returnAdditiveCard)
      }
      this._cardsBag = this._cardsBag.concat(resultCards)
      return {
        type: 'fail',
        cards: resultCards,
      }
    }
  }

  meltCard = (targetCard: ICardDataInBag, faithCoin: number): 'success' | 'fail' => {
    if (!this.userInfo) return 'fail'
    if (this.userInfo.meltOpportunity.current <= 0) {
      toast.warn('No melt opportunities left!')
      return 'fail'
    }
    this.userInfo.meltOpportunity.current -= 1
    this.userInfo.faithAmount += faithCoin
    this._cardsBag.splice(targetCard.bagPosition, 1)
    toast.success(`Melted ${targetCard.name} successfully!`)
    return 'success'
  }
}

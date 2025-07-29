import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import { getHomePath, getIntroductionPath, preloadPages } from '@/navigation/routes.tsx'
import {
  CARD_DATA_BASE_REQUEST_KEY,
  myQueryClient,
  type UserStorageInfo,
} from '@/utils/constant.ts'
import {
  checkHasAlreadyReadGuide,
  getAccessToken,
  getCardImageById,
  getDefaultAvatar,
  setAccessToken,
} from '@/utils/common.ts'
import { type ICardData } from '@/components/Card.tsx'
import { toast } from 'react-toastify'
import API, {
  type ICraftCardResponse,
  type IDrawCardsResponse,
  type IFetchCardsPageResponse,
  type ILoginAndRegisterResponse,
  type ILoginWithAccessTokenResponse,
  type IMeltCardResponse,
  type ISetDeckResponse,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'

export interface UserInfo extends UserStorageInfo {
  avatar: string
  createdAt: string
  email: string
  expPercent: number
  faithAmount: number
  id: number
  meltCurrent: number
  meltMax: number
  solAmount: number
  updatedAt: string
  deckCardIds: Array<number>
  deckPower: number
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

  globalLoading = false

  userInfo: UserInfo | undefined = undefined

  cardsFormation: Array<ICardData> = []

  _cardsBag: Array<ICardData> = []

  _setDeckAbortController?: AbortController

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      isAppLoading: observable,
      globalLoading: observable,
      changeGlobalLoading: action,
      userInfo: observable,
      updateUserInfo: action,
      updateUserCardsBag: flow.bound,
      loginAndRegister: flow.bound,
      loginWithAccessToken: flow.bound,
      cardsFormation: observable,
      changeCardsFormation: flow.bound,
      updateCardsFormation: flow.bound,
      _cardsBag: observable,
      cardsBag: computed,
      formattedCardsBag: computed,
      initNetwork: flow.bound,
      initData: action,
      drawCards: flow.bound,
      craftCard: flow.bound,
      meltCard: flow.bound,
    })
  }

  resetStore = () => {
    this.isAppLoading = true
    this.globalLoading = false
    this.userInfo = undefined
    this.cardsFormation = []
    this._cardsBag = []
  };

  *updateUserCardsBag() {
    try {
      const userAllCards: Array<number> = yield API.fetchUserAllCards()
      if (userAllCards.length) {
        // 只对 cardsBag 去重用于请求
        const uniqueCardIdsArray = Array.from(new Set(userAllCards))
        const cachedCardsDataBase = myQueryClient.getQueryData([
          CARD_DATA_BASE_REQUEST_KEY,
        ]) as AxiosResponse<IFetchCardsPageResponse> | null
        const filteredUniqueCardIds = cachedCardsDataBase?.data?.data?.length
          ? uniqueCardIdsArray.filter(
              (id) => !cachedCardsDataBase.data.data.some((card) => card.id === id),
            )
          : uniqueCardIdsArray
        let remoteCardsDataBase: AxiosResponse<Array<ICardData>> | null = null
        if (filteredUniqueCardIds.length) {
          remoteCardsDataBase = yield API.fetchCards(filteredUniqueCardIds)
        }
        // 生成卡牌映射表
        const cardMap = new Map<number, ICardData>()
        cachedCardsDataBase?.data?.data?.forEach((card) => cardMap.set(card.id, card))
        remoteCardsDataBase?.data?.forEach((card) => cardMap.set(card.id, card))
        // _cardsBag 保持和 cardsBag 顺序、数量一致
        this._cardsBag = userAllCards
          .map((id) => cardMap.get(id))
          .filter(Boolean) as Array<ICardData>
      }
    } catch (error) {
      console.log('Error updating user cards bag:', error)
      toast.error('Failed to update cards bag. Please try again later.')
    }
  }

  *updateCardsFormation() {
    if (!this?.userInfo?.deckCardIds) return
    const deckCardIdsString = this.userInfo.deckCardIds?.join(',')
    if (!deckCardIdsString) return
    const cardFormationIdsString = this.cardsFormation?.map((card) => card.id).join(',')
    if (deckCardIdsString !== cardFormationIdsString) {
      const fetchCardsResult: AxiosResponse<Array<ICardData>> = yield API.fetchCards(
        this.userInfo.deckCardIds,
      )
      if (Array.isArray(fetchCardsResult.data)) {
        this.cardsFormation = fetchCardsResult.data
      }
    }
  }

  updateUserInfo = (userInfo: UserInfo | undefined) => {
    if (!userInfo) return
    this.userInfo = {
      ...userInfo,
      avatar: getDefaultAvatar(),
      expPercent: 60,
    }
    this.updateCardsFormation()
  };

  *loginAndRegister(email: string, password: string) {
    if (!email) return toast.warn('Please enter your email.')
    if (!password) return toast.warn('Please enter your password.')
    const result: AxiosResponse<ILoginAndRegisterResponse> = yield API.loginAndRegister({
      email,
      password,
    })
    if (result?.data?.type) {
      if (result.data.type === 'register') {
        toast.success('Registration successful!')
      } else {
        toast.success('Login successful!')
      }
    }
    if (result?.data?.user?.email === email) {
      if (result.data.token) {
        setAccessToken(result.data.token)
      }
      this.updateUserInfo(result.data.user)
      yield this.updateUserCardsBag()
      const checkResult = checkHasAlreadyReadGuide()
      if (checkResult) {
        return getHomePath()
      } else {
        return getIntroductionPath()
      }
    }
  }

  *loginWithAccessToken() {
    const accessToken = getAccessToken()
    if (!accessToken) return
    const result: AxiosResponse<ILoginWithAccessTokenResponse> = yield API.loginWithAccessToken()
    if (result.data.user) {
      toast.success('Welcome back! Adventure awaits!')
      this.updateUserInfo(result.data.user)
      yield this.updateUserCardsBag()
    }
  }

  *initNetwork() {
    try {
      yield myQueryClient.prefetchQuery({
        queryKey: [CARD_DATA_BASE_REQUEST_KEY],
        queryFn: () => API.fetchCardsPage(1, 200),
      })
      yield this.loginWithAccessToken()
      this.rootStoreRef.preloadStore.preloadResult.networkPreloadProgress = 1
    } catch (e) {
      console.log('Error initializing network:', e)
    }
  }

  initData = () => {
    if (!this.isAppLoading) return
    this.isAppLoading = true
    try {
      this.initNetwork()
      preloadPages().then(() => {
        this.rootStoreRef.preloadStore.preloadResult.pagesPreloadProgress = 1
      })
      this.rootStoreRef.preloadStore.loadCreateJS().then(() => {
        this.rootStoreRef.preloadStore.preloadAssets()
      })
    } catch (e) {
      console.log('Error preloading assets:', e)
    }
    this.isAppLoading = false
  }

  changeGlobalLoading = (newValue: boolean) => {
    this.globalLoading = newValue
  };

  *changeCardsFormation(cards: Array<ICardData>) {
    if (!this.userInfo) return
    // 保存快照用于回滚
    const prevFormation = [...this.cardsFormation]
    // 立即更新页面
    this.cardsFormation = cards
    // 取消上一次未完成的请求
    if (this._setDeckAbortController) {
      this._setDeckAbortController.abort()
    }
    // 创建新的 AbortController
    const controller = new AbortController()
    this._setDeckAbortController = controller
    try {
      const res: AxiosResponse<ISetDeckResponse> = yield API.setDeck(
        cards.map((card) => card.id),
        controller.signal,
      )
      // 只处理未被取消的请求
      if (controller.signal.aborted) return
      if (!res?.data?.success) {
        this.cardsFormation = prevFormation
        toast.error('Save formation failed, please try again!')
      } else {
        this.updateUserInfo({
          ...this.userInfo,
          deckCardIds: res.data.deckCardIds,
          deckPower: res.data.deckPower,
        })
      }
    } catch {
      // 只处理未被取消的请求
      if (controller.signal.aborted) return
      this.cardsFormation = prevFormation
      toast.error('Save formation failed, please try again!')
    }
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

  *drawCards() {
    if (!this.userInfo || this.userInfo.solAmount <= 0.1) {
      toast.warn('Insufficient Balance!')
      return
    }
    const result: AxiosResponse<IDrawCardsResponse> = yield API.drawCards()
    if (result?.data?.user?.email !== this.userInfo.email) return
    this.updateUserInfo(result.data.user)
    // 本地直接更新，避免重复请求
    this._cardsBag = this._cardsBag.concat(result.data.cards)
    const preloadImageList = result.data.cards.reduce<Array<{ id: string; src: string }>>(
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
      })
      cardsImagesPreloadQueue.on('error', () => {
        console.error('当次抽卡卡片图片预加载失败')
      })
      cardsImagesPreloadQueue.loadManifest(preloadImageList)
    } else {
      console.debug('当次抽卡卡片图片预加载列表为空，直接返回结果')
    }
    return result.data.cards
  }

  *craftCard(
    targetCard: ICardData,
    requiredCards: Array<{
      card: ICardData
      position: number
    }>,
    additiveCards: Array<{
      card: ICardData
      position: number
    }>,
  ) {
    if (!this.userInfo) return
    const result: AxiosResponse<ICraftCardResponse> = yield API.craftCard({
      craftCardId: targetCard.id,
      additiveCardIds: additiveCards.map((item) => item.card.id),
    })
    if (result?.data?.user?.email !== this.userInfo.email) return
    const costCardWithBagPositions = requiredCards
      .concat(additiveCards)
      .map((item) => item.position)
    // 降序移除已消耗的卡牌
    const sortedPositions = costCardWithBagPositions.sort((a, b) => b - a)
    sortedPositions.forEach((index) => {
      this._cardsBag.splice(index, 1)
    })
    if (Array.isArray(result.data.resultCards)) {
      this._cardsBag = this._cardsBag.concat()
    }
    this.updateUserInfo(result.data.user)
    return {
      type: result.data.success ? 'success' : 'fail',
      cards: result.data.resultCards,
    }
  }

  *meltCard(targetCard: ICardDataInBag) {
    if (!this.userInfo) return 'fail'
    if (this.userInfo.meltCurrent <= 0) {
      toast.warn('No melt opportunities left!')
      return 'fail'
    }
    this.changeGlobalLoading(true)
    const result: AxiosResponse<IMeltCardResponse> = yield API.meltCard(targetCard.id)
    if (result?.data?.user?.email !== this.userInfo.email) {
      this.changeGlobalLoading(false)
      return 'fail'
    }
    this.updateUserInfo(result.data.user)
    this._cardsBag.splice(targetCard.bagPosition, 1)
    toast.success(`Melted ${targetCard.name} successfully!`)
    this.changeGlobalLoading(false)
    return 'success'
  }
}

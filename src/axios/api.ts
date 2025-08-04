import request from '@/axios/request.ts'
import type { ICardDataInBag, UserInfo } from '@/stores/app-store.ts'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'

export interface ILoginAndRegisterResponse {
  type: 'login' | 'register'
  token: string
  user: UserInfo
}

export interface ILoginWithAccessTokenResponse {
  user: UserInfo
}

export interface IFetchCardsPageResponse {
  data: Array<ICardData>
  total: number
  page: number
  pageSize: number
}

export interface IDrawCardsResponse {
  cards: Array<ICardDataInBag>
  user: UserInfo
}

export interface IFetchCardsPageData {
  userCardId: number
  cardId: number
}
export interface IFetchUserCardsPageResponse {
  total: number
  page: number
  pageSize: number
  data: Array<IFetchCardsPageData>
}

export interface IMeltCardResponse {
  user: UserInfo
}

export interface ICraftCardResponse {
  success: boolean
  user: UserInfo
  resultCards: Array<ICardDataInBag>
}

export interface ISetDeckResponse {
  success: boolean
  deckCards: Array<{ cardId: number; userCardId: number }>
  deckPower: number
}

export interface IDeckLeaderboardResponse {
  leaderboard: Array<{
    id: number
    email: string
    avatar: string
    deckPower: number
  }>
  myDeckPower: number
  myRank: number
}

export interface RedeemCodeReward {
  solAmount: number
  faithAmount: number
}

export interface IRedeemCodeResponse {
  success: boolean
  reward: RedeemCodeReward
}

export interface ICraftRule {
  targetRarity: CARD_RARITY
  requiredCards: {
    rarity: CARD_RARITY
    count: number
  }
  requiredFaithCoin: number
  baseSuccessRate: number // 基础成功率
  maxSuccessRate: number // 最大成功率
}

export interface IGetConfigResponse {
  DefaultAvatars: Array<string>
  CraftRule: Array<ICraftRule>
  MeltRule: Array<{
    rarity: CARD_RARITY
    faithCoin: number
  }>
}

const API = {
  getConfig: async () => request.get<IGetConfigResponse>('/config'),
  loginAndRegister: async (data: { email: string; password: string }) =>
    request.post<ILoginAndRegisterResponse>('/users', data),
  loginWithAccessToken: async () => request.get<ILoginWithAccessTokenResponse>('/auth-me'),
  fetchCard: async (cardId: number) => request.get<ICardData>('/cards', { params: { id: cardId } }),
  fetchCards: async (cardId: Array<number>) =>
    request.get<Array<ICardData>>('/cards', { params: { ids: cardId.join(',') } }),
  fetchCardsPage: async (page: number, pageSize: number) => {
    return request.get<IFetchCardsPageResponse>('/cards', {
      params: {
        page: page,
        pageSize: pageSize,
      },
    })
  },
  drawCards: async () => request.post<IDrawCardsResponse>('/draw-cards'),
  fetchUserCardsPage: async (page: number, pageSize: number) =>
    request.get<IFetchUserCardsPageResponse>('/user-cards', {
      params: {
        page,
        pageSize,
      },
    }),
  fetchUserAllCards: async () => {
    let page = 1
    const pageSize = 200
    let allData: Array<IFetchCardsPageData> = []
    let total = 0
    do {
      const { data: res } = await API.fetchUserCardsPage(page, pageSize)
      if (page === 1) total = res.total
      allData = allData.concat(res.data)
      page++
    } while (allData.length < total)
    return allData
  },
  meltCard: async (userCardId: number) =>
    request.post<IMeltCardResponse>('/melt-card', { userCardId }),
  craftCard: async (data: {
    craftCardId: number
    requiredUserCardIds: Array<number>
    additiveUserCardIds?: Array<number>
  }) => request.post<ICraftCardResponse>('/craft-card', data),
  setDeck: async (
    deckCards: Array<{
      cardId: number
      userCardId: number
    }>,
    signal?: AbortSignal,
  ) => request.post<ISetDeckResponse>('/set-deck', { deckCards }, { signal }),
  deckLeaderboard: async () => request.get<IDeckLeaderboardResponse>('/deck-leaderboard'),
  redeemCode: async (code: string) => request.post<IRedeemCodeResponse>('/redeem-code', { code }),
}

export default API

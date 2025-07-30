import request from '@/axios/request.ts'
import type { ICardDataInBag, UserInfo } from '@/stores/app-store.ts'
import type { ICardData } from '@/components/Card.tsx'

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
  deckCardIds: Array<number>
  deckPower: number
}

export interface IDeckLeaderboardResponse {
  leaderboard: Array<{
    id: number
    email: string
    avatar: string
    deckCardIds: Array<number>
    deckPower: number
  }>
  myDeckPower: number
  myRank: number
}

const API = {
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
  meltCard: async (cardId: number) => request.post<IMeltCardResponse>('/melt-card', { cardId }),
  craftCard: async (data: { craftCardId: number; additiveCardIds?: Array<number> }) =>
    request.post<ICraftCardResponse>('/craft-card', data),
  setDeck: async (cardIds: Array<number>, signal?: AbortSignal) =>
    request.post<ISetDeckResponse>('/set-deck', { cardIds }, { signal }),
  deckLeaderboard: async () => request.get<IDeckLeaderboardResponse>('/deck-leaderboard'),
}

export default API

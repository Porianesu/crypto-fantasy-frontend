import request from '@/axios/request.ts'
import type { UserInfo } from '@/stores/app-store.ts'
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
  cards: Array<ICardData>
  user: UserInfo
}

export interface IFetchUserCardsPageResponse {
  total: number
  page: number
  pageSize: number
  cardIds: Array<number>
}

export interface IMeltCardResponse {
  user: UserInfo
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
    let allCardIds: number[] = []
    let total = 0
    do {
      const { data: res } = await API.fetchUserCardsPage(page, pageSize)
      if (page === 1) total = res.total
      allCardIds = allCardIds.concat(res.cardIds)
      page++
    } while (allCardIds.length < total)
    return allCardIds
  },
  meltCard: async (cardId: number) => request.post<IMeltCardResponse>('/melt-card', { cardId }),
  craftCard: async (data: { craftCardId: number; additiveCardIds?: Array<number> }) =>
    request.post<{ user: UserInfo; resultCards: Array<ICardData> }>('/craft-card', data),
}

export default API

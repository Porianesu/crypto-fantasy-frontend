import request from '@/axios/request.ts'
import type { UserInfo } from '@/stores/app-store.ts'
import type { ICardData } from '@/components/Card.tsx'

export interface ILoginAndRegisterResponse extends UserInfo {
  type: 'login' | 'register'
}

export interface IFetchCardsPageResponse {
  data: Array<ICardData>
  total: number
  page: number
  pageSize: number
}

const API = {
  loginAndRegister: async (data: { email: string; password: string }) =>
    request.post<ILoginAndRegisterResponse>('/users', data),
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
}

export default API

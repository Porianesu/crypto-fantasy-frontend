import request from '@/axios/request.ts'
import type { UserInfo } from '@/stores/app-store.ts'

export interface ILoginAndRegisterResponse extends UserInfo {
  type: 'login' | 'register'
}

const API = {
  loginAndRegister: async (data: { email: string; password: string }) =>
    request.post<ILoginAndRegisterResponse>('/users', data),
  fetchCard: async (cardId: number) => request.get('/cards', { params: { id: cardId } }),
  fetchCards: async (cardId: Array<number>) =>
    request.get('/cards', { params: { ids: cardId.join(',') } }),
  fetchCardsPage: async (page: number, pageSize: number) => {
    return request.get('/cards', {
      params: {
        page: page,
        pageSize: pageSize,
      },
    })
  },
}

export default API

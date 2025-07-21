import request from '@/axios/request.ts'
import type { UserInfo } from '@/stores/app-store.ts'

export interface ILoginAndRegisterResponse extends UserInfo {
  type: 'login' | 'register'
}

const API = {
  loginAndRegister: async (data: { email: string; password: string }) =>
    request.post<ILoginAndRegisterResponse>('/users', data),
}

export default API

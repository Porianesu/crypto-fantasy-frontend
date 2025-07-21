import request from '@/axios/request.ts'

const API = {
  loginAndRegister: async (data: { email: string; password: string }) =>
    request.post('/users', data),
}

export default API

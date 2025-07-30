import axios from 'axios'
import { toast } from 'react-toastify'
import { getAccessToken } from '@/utils/common.ts'
import { ENTRANCE_PATH } from '@/navigation/routes.tsx'

const request = axios.create({
  baseURL: 'https://crypto-fantasy-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => error,
)

let isRedirecting = false
request.interceptors.response.use(
  (response) => {
    if (response.status === 401) {
      // 清除本地缓存
      localStorage.clear()
      sessionStorage.clear()
      // 判断当前路由
      const location = window.location.pathname
      if (!isRedirecting && location !== ENTRANCE_PATH) {
        isRedirecting = true
        window.location.replace(ENTRANCE_PATH)
      }
    }
    return response
  },
  (error) => {
    if (error?.response?.data?.error) {
      toast.error(error.response.data.error)
    }
    return error
  },
)

export default request

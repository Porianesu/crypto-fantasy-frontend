import axios from 'axios'
import { toast } from 'react-toastify'
import { getStorageItem } from '@/utils/common.ts'
import { ACCESS_TOKEN_STORAGE_KEY } from '@/utils/constant.ts'

const request = axios.create({
  baseURL: 'https://crypto-fantasy-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.request.use(
  (config) => {
    const token = getStorageItem(ACCESS_TOKEN_STORAGE_KEY)
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => error,
)

request.interceptors.response.use(
  (response) => {
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

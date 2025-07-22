import axios from 'axios'
import { toast } from 'react-toastify'
import { getAccessToken } from '@/utils/common.ts'

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

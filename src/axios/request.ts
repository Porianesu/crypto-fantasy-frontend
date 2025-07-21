import axios from 'axios'
import { toast } from 'react-toastify'

const request = axios.create({
  baseURL: 'https://crypto-fantasy-backend.vercel.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

request.interceptors.response.use(
  (response) => {
    console.log('response', response)
    return response
  },
  (error) => {
    console.log('API request error:', error)
    if (error?.response?.data?.error) {
      toast.error(error.response.data.error)
    }
    return error
  },
)

export default request

import { Axios } from 'axios'

const request = new Axios({
  baseURL: 'https://crypto-fantasy-backend.vercel.app/api',
})

request.interceptors.response.use(
  (response) => {
    console.log('response', response)
    return response
  },
  (error) => {
    console.log('API request error:', error)
    return Promise.reject(error.response || error)
  },
)

export default request

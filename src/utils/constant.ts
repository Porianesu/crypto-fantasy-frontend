import { QueryClient } from '@tanstack/react-query'

export const USER_INFO_STORAGE_KEY = 'user_info'
export interface UserStorageInfo {
  hasAlreadyReadGuide?: boolean
}
export const ACCESS_TOKEN_STORAGE_KEY = 'access_token'
export const myQueryClient = new QueryClient()
export const CARD_DATA_BASE_REQUEST_KEY = 'card_database'

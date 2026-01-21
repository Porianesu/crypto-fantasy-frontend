import {
  ACCESS_TOKEN_STORAGE_KEY,
  USER_INFO_STORAGE_KEY,
  type UserStorageInfo,
} from '@/utils/constant.ts'
import type { ICardData } from '@/components/Card.tsx'
import { getStoreRef } from '@/stores/StoreProvider.tsx'

export const getCardImageById = (cardId: number) => `/cards/${cardId}.png`
export const getDefaultAvatar = (index?: number) => {
  const mobxStore = getStoreRef()
  if (mobxStore) {
    const {
      appStore: { appConfig },
    } = mobxStore
    if (!appConfig) return undefined
    if (index !== undefined && index >= 0 && index < appConfig.DefaultAvatars.length) {
      return appConfig.DefaultAvatars[index]
    }
    // 随机返回一个默认头像
    const randomIndex = Math.floor(Math.random() * appConfig.DefaultAvatars.length)
    return appConfig.DefaultAvatars[randomIndex]
  } else {
    return undefined
  }
}

export const generateFantasyEnglishName = () => {
  // 奇幻风格英文名片段
  const firstParts = [
    'El',
    'Al',
    'Ar',
    'Bel',
    'Cal',
    'Dar',
    'Eri',
    'Fin',
    'Gal',
    'Hal',
    'Ian',
    'Jar',
    'Kel',
    'Lan',
    'Mar',
    'Nor',
    'Or',
    'Per',
    'Quin',
    'Ryn',
    'Syl',
    'Tan',
    'Val',
    'Wyn',
    'Zan',
  ]
  const midParts = [
    'a',
    'e',
    'i',
    'o',
    'u',
    'ae',
    'ia',
    'io',
    'ea',
    'ai',
    'yn',
    'il',
    'or',
    'an',
    'el',
    'ar',
    'en',
    'is',
    'os',
    'al',
    'ir',
    'on',
    'ur',
    'as',
    'in',
  ]
  const lastParts = [
    'dor',
    'dil',
    'mir',
    'lith',
    'gorn',
    'thas',
    'rian',
    'dril',
    'wyn',
    'riel',
    'dell',
    'thor',
    'niel',
    'vian',
    'lian',
    'mond',
    'gwen',
    'thil',
    'las',
    'nor',
    'dan',
    'len',
    'ros',
    'rin',
    'lor',
    'mar',
    'rel',
    'sor',
    'thar',
    'vyr',
  ]
  // 名字结构：首+中+尾，或首+尾
  const useMid = Math.random() > 0.3
  const first = firstParts[Math.floor(Math.random() * firstParts.length)]
  const mid = midParts[Math.floor(Math.random() * midParts.length)]
  const last = lastParts[Math.floor(Math.random() * lastParts.length)]
  let name = useMid ? first + mid + last : first + last
  // 首字母大写
  name = name.charAt(0).toUpperCase() + name.slice(1)
  return name
}

const setStorageItem = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.log('Error setting localStorage item:', e)
  }
}

const getStorageItem = (key: string) => {
  try {
    const value = window.localStorage.getItem(key)
    if (value) {
      return JSON.parse(value)
    }
    return null
  } catch (e) {
    console.log('Error getting localStorage item:', e)
    return null
  }
}

export const setAccessToken = (token: string) => {
  return setStorageItem(ACCESS_TOKEN_STORAGE_KEY, token)
}

export const getAccessToken = () => {
  return getStorageItem(ACCESS_TOKEN_STORAGE_KEY)
}

export const clearAccessToken = () => {
  try {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  } catch (e) {
    console.log('Error removing localStorage item:', e)
  }
}

export const setStorageUserInfo = (params: Partial<UserStorageInfo>) => {
  const storageUserInfo = window.localStorage.getItem(USER_INFO_STORAGE_KEY)
  if (storageUserInfo) {
    const userInfo = JSON.parse(storageUserInfo)
    const newUserInfo = { ...userInfo, ...params }
    setStorageItem(USER_INFO_STORAGE_KEY, newUserInfo)
    return
  }
  setStorageItem(USER_INFO_STORAGE_KEY, params)
  return
}

export const checkHasAlreadyReadGuide = () => {
  const storageUserInfo = getStorageItem(USER_INFO_STORAGE_KEY) as UserStorageInfo | null
  return storageUserInfo?.hasAlreadyReadGuide
}

export const isCardsSameChain = (card1: ICardData, card2: ICardData) => {
  return Math.floor(card1.id / 4) === Math.floor(card2.id / 4)
}

// Client / shared: bytes( base64 string | ArrayBuffer | Uint8Array | Buffer ) -> object URL
export function convertBytesToObjectUrl(
  bytes: Uint8Array<ArrayBufferLike>,
  mime = 'image/jpeg',
): string | null {
  if (!bytes || typeof bytes !== 'object') return null

  const obj = bytes
  const numericKeys = Object.keys(obj).filter((k) => /^\d+$/.test(k))
  if (numericKeys.length === 0) return null

  const maxIndex = numericKeys.reduce((m, k) => Math.max(m, Number(k)), -1)
  const len = obj.length > 0 ? obj.length : maxIndex + 1

  const arr = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    arr[i] = obj[i] ?? obj[String(i) as keyof typeof obj]
  }

  const blob = new Blob([arr], { type: mime })
  return URL.createObjectURL(blob)
}

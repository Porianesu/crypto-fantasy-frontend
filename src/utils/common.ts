import { USER_INFO_STORAGE_KEY, type UserStorageInfo } from '@/utils/constant.ts'

export const setStorageItem = (key: string, value: any) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.log('Error setting localStorage item:', e)
  }
}

export const getStorageItem = (key: string) => {
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

export const checkIsAuth = () => {
  return getStorageItem(USER_INFO_STORAGE_KEY)
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

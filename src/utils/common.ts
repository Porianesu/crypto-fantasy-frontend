import { USER_INFO_STORAGE_KEY, type UserStorageInfo } from '@/utils/constant.ts'

export const getDefaultAvatar = (index?: number) => {
  return '/src/assets/images/avatars/avatar_' + (index ? `0${index % 5}` : '00') + '.png'
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

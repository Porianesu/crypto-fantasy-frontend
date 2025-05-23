import { generatePath, redirect } from 'react-router-dom'
import { initializeStore } from '@/stores/StoreProvider.tsx'

export const ROOT_PATH = '/'
export const HOME_PATH = '/home'
export const ENTRANCE_PATH = '/entrance'
export const CARD_PATH = '/card'

export const getHomePath = () => {
  return generatePath(HOME_PATH)
}

export const getEntrancePath = () => {
  return generatePath(ENTRANCE_PATH)
}

export const getCardPath = () => {
  return generatePath(CARD_PATH)
}

const getIsAppLoading = () => initializeStore()?.appStore?.isAppLoading ?? true

export const homePageLoader = () => {
  if (getIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const cardPageLoader = () => {
  if (getIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

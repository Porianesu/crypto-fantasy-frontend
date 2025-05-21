import { generatePath, redirect } from 'react-router-dom'
import { initializeStore } from '@/stores/StoreProvider.tsx'

export const ROOT_PATH = '/'
export const HOME_PATH = '/home'
export const LOGIN_PATH = '/login'
export const LOADING_PATH = '/loading'

export const getHomePath = () => {
  return generatePath(HOME_PATH)
}

export const getLoginPath = () => {
  return generatePath(LOGIN_PATH)
}

export const getLoadingPath = () => {
  return generatePath(LOADING_PATH)
}

export const homePageLoader = () => {
  const Store = initializeStore()
  if (Store) {
    const {
      appStore: { isAppLoading },
    } = Store
    if (isAppLoading) {
      return redirect(getLoadingPath())
    }
  }
  return null
}

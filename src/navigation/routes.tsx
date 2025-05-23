import { generatePath, redirect } from 'react-router-dom'
import { initializeStore } from '@/stores/StoreProvider.tsx'

export const ROOT_PATH = '/'
export const HOME_PATH = '/home'
export const ENTRANCE_PATH = '/entrance'

export const getHomePath = () => {
  return generatePath(HOME_PATH)
}

export const getEntrancePath = () => {
  return generatePath(ENTRANCE_PATH)
}

export const homePageLoader = () => {
  const Store = initializeStore()
  if (Store) {
    const {
      appStore: { isAppLoading },
    } = Store
    if (isAppLoading) {
      return redirect(getEntrancePath())
    }
  }
  return null
}

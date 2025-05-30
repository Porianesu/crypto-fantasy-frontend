import { generatePath, redirect } from 'react-router-dom'
import { getStoreRef } from '@/stores/StoreProvider.tsx'

export const ROOT_PATH = '/'
export const HOME_PATH = '/home'
export const ENTRANCE_PATH = '/entrance'
export const GALLERY_PATH = '/gallery/:cardId'
export const INTRODUCTION_PATH = '/introduction'

export const getHomePath = () => {
  return generatePath(HOME_PATH)
}

export const getEntrancePath = () => {
  return generatePath(ENTRANCE_PATH)
}

export const getGalleryPath = (cardId?: string) => {
  return generatePath(GALLERY_PATH, { cardId: cardId || null })
}

export const getIntroductionPath = () => {
  return generatePath(INTRODUCTION_PATH)
}

const checkIsAppLoading = () => {
  return getStoreRef()?.appStore?.isAppLoading ?? true
}

export const homePageLoader = () => {
  if (checkIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const galleryPageLoader = () => {
  if (checkIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const introductionPageLoader = () => {
  if (checkIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const preloadPages = async () => {
  try {
    await import('@/pages/GalleryPage/GalleryPage.tsx')
    await import('@/pages/HomePage/HomePage.tsx')
    await import('@/pages/IntroductionPage/IntroductionPage.tsx')
  } catch (e) {
    console.error('Error preloading CardPage:', e)
  }
}

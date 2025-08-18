import { generatePath, redirect } from 'react-router-dom'
import { getStoreRef } from '@/stores/StoreProvider.tsx'
import type { ICardData } from '@/components/Card.tsx'

export const ROOT_PATH = '/'
export const HOME_PATH = '/home'
export const ENTRANCE_PATH = '/entrance'
export type GalleryPathState = {
  type?: 'select' | 'browse'
  from: string
} | null
export const GALLERY_PATH = '/gallery/:cardId?'
export const INTRODUCTION_PATH = '/introduction'
export const TOURNAMENT_PATH = '/tournament'
export type FusionPathState = {
  card?: ICardData
} | null
export const FUSION_PATH = '/fusion'
export const SHOP_PATH = '/shop'

export const getHomePath = () => {
  return generatePath(HOME_PATH)
}

export const getEntrancePath = () => {
  return generatePath(ENTRANCE_PATH)
}

export const getGalleryPath = (cardId?: number) => {
  return generatePath(GALLERY_PATH, { cardId: cardId ? `${cardId}` : null })
}

export const getIntroductionPath = () => {
  return generatePath(INTRODUCTION_PATH)
}

export const getTournamentPath = () => {
  return generatePath(TOURNAMENT_PATH)
}

export const getFusionPath = () => {
  return generatePath(FUSION_PATH)
}

export const getShopPath = () => {
  return generatePath(SHOP_PATH)
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

export const tournamentPageLoader = () => {
  if (checkIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const fusionPageLoader = () => {
  if (checkIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const shopPageLoader = () => {
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
    await import('@/pages/TournamentPage/TournamentPage.tsx')
  } catch (e) {
    console.error('Error preloading CardPage:', e)
  }
}

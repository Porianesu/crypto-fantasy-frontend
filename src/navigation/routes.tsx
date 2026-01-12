import { generatePath, Navigate, redirect, useLocation } from 'react-router-dom'
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
export const REWARD_PATH = '/reward'
export const CARD_GENERATE_PATH = '/card-generate'

export enum URL_PARAMS {
  INVITE_CODE = 'ic',
  OAUTH_TOKEN = 'oauth_token',
  OAUTH_VERIFIER = 'oauth_verifier',
}

export const RedirectWithQuery = () => {
  const location = useLocation()
  return <Navigate to={{ pathname: ENTRANCE_PATH, search: location.search }} replace />
}

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

export const getRewardPath = () => {
  return generatePath(REWARD_PATH)
}

const checkIsAppLoading = () => {
  return getStoreRef()?.appStore?.isAppLoading ?? true
}

export const commonPageLoader = () => {
  if (checkIsAppLoading()) {
    return redirect(getEntrancePath())
  }
  return null
}

export const preloadPages = async () => {
  try {
    await Promise.all([
      import('@/pages/HomePage/HomePage.tsx'),
      import('@/pages/FusionPage/FusionPage.tsx'),
      import('@/pages/GalleryPage/GalleryPage.tsx'),
      import('@/pages/IntroductionPage/IntroductionPage.tsx'),
      import('@/pages/RewardPage/RewardPage.tsx'),
      import('@/pages/ShopPage/ShopPage.tsx'),
      import('@/pages/TournamentPage/TournamentPage.tsx'),
    ])
  } catch (e) {
    console.error('Error preloading CardPage:', e)
  }
}

import { generatePath } from 'react-router-dom'

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

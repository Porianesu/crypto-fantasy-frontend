import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import preloadManifest from '@/stores/preloadManifest.ts'
import { BigNumber } from 'bignumber.js'
import { preloadPages } from '@/navigation/routes.tsx'
import { USER_INFO_STORAGE_KEY, type UserStorageInfo } from '@/utils/constant.ts'
import { getStorageItem } from '@/utils/common.ts'

interface PreloadProgressEvent {
  loaded: number
  progress: number
  total: number
}
interface UserInfo extends UserStorageInfo {
  cardsScore: number
}
export default class StoresStore {
  rootStoreRef: Store

  isAppLoading = true

  preloadQueue: createjs.LoadQueue | undefined = undefined

  preloadResult = {
    assetPreloadProgress: 0,
    pagesPreloadProgress: 0,
    networkPreloadProgress: 0,
  }

  userInfo: UserInfo | undefined = undefined

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      isAppLoading: observable,
      preloadResult: observable,
      preloadProgress: computed,
      handlePreloadProgress: action,
      setIsAppLoading: action,
      initNetwork: flow.bound,
      initData: flow.bound,
      resetStore: action,
    })
  }

  resetStore = () => {
    this.isAppLoading = true
    this.preloadQueue = undefined
    this.preloadResult = {
      assetPreloadProgress: 0,
      pagesPreloadProgress: 0,
      networkPreloadProgress: 0,
    }
    this.userInfo = undefined
  }

  loadCreateJS = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://code.createjs.com/1.0.0/createjs.min.js'
      script.async = true
      script.onload = () => {
        console.log('CreateJS loaded successfully')
        resolve()
      }
      script.onerror = () => {
        console.error('Failed to load CreateJS')
        reject(new Error('Failed to load CreateJS'))
      }
      document.body.appendChild(script)
    })
  }

  handlePreloadProgress = (event: object) => {
    this.preloadResult.assetPreloadProgress = (event as unknown as PreloadProgressEvent).progress
  }

  preloadAssets = () => {
    if (!window.createjs?.PreloadJS) return
    return new Promise<object>((resolve, reject) => {
      const queue = new window.createjs.LoadQueue(true)
      queue.installPlugin(window.createjs.Sound)
      queue.on(
        'complete',
        (event) => {
          this.preloadQueue = queue
          resolve(event)
        },
        this,
      )
      queue.on('error', reject, this)
      queue.on('progress', this.handlePreloadProgress)
      queue.loadManifest(preloadManifest)
    })
  };

  *initNetwork() {
    try {
      // Simulate network initialization
      const result: UserStorageInfo = yield new Promise((resolve) =>
        setTimeout(() => {
          const storageUserInfo = getStorageItem(USER_INFO_STORAGE_KEY)
          resolve(storageUserInfo)
        }, 1000),
      )
      console.log('Network initialized with user info:', result)
      this.userInfo = {
        ...result,
        cardsScore: 5000,
      }
      this.preloadResult.networkPreloadProgress = 1
    } catch (e) {
      console.log('Error initializing network:', e)
    }
  }

  *initData() {
    if (!this.isAppLoading) return
    this.isAppLoading = true
    try {
      preloadPages().then(() => {
        this.preloadResult.pagesPreloadProgress = 1
      })
      this.loadCreateJS().then(() => {
        this.preloadAssets()
      })
      this.initNetwork()
    } catch (e) {
      console.log('Error preloading assets:', e)
    }
    this.isAppLoading = false
  }

  setIsAppLoading = (newValue: boolean) => {
    this.isAppLoading = newValue
  }

  get preloadProgress() {
    return new BigNumber(this.preloadResult.assetPreloadProgress)
      .plus(this.preloadResult.pagesPreloadProgress)
      .plus(this.preloadResult.networkPreloadProgress)
      .dividedBy(3)
      .decimalPlaces(2)
      .toNumber()
  }
}

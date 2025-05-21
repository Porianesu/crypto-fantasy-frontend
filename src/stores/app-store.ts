import type { Store } from '@/stores/index.ts'
import { action, flow, makeAutoObservable, observable } from 'mobx'
import preloadManifest from '@/stores/preloadManifest.ts'

interface PreloadProgressEvent {
  loaded: number
  progress: number
  total: number
}
export default class StoresStore {
  rootStoreRef: Store

  isAppLoading = true

  preloadQueue: createjs.LoadQueue | undefined = undefined

  preloadProgress: number = 0

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      isAppLoading: observable,
      preloadProgress: observable,
      handlePreloadProgress: action,
      setIsAppLoading: action,
      initData: flow.bound,
      resetStore: action,
    })
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
    this.preloadProgress = (event as unknown as PreloadProgressEvent).progress
  }

  preloadAssets = () => {
    if (!window.createjs?.PreloadJS) return
    return new Promise<object>((resolve, reject) => {
      const queue = new createjs.LoadQueue(true)
      queue.installPlugin(createjs.Sound)
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

  *initData() {
    if (!this.isAppLoading) return
    this.isAppLoading = true
    try {
      yield this.loadCreateJS()
      yield this.preloadAssets()
    } catch (e) {
      console.log('Error preloading assets:', e)
    }
    this.isAppLoading = false
  }

  setIsAppLoading = (newValue: boolean) => {
    this.isAppLoading = newValue
  }

  resetStore = () => {}
}

import type { Store } from '@/stores/index.ts'
import { action, computed, makeAutoObservable, observable } from 'mobx'
import { BigNumber } from 'bignumber.js'
import preloadManifest from '@/stores/preloadManifest.ts'

interface PreloadProgressEvent {
  loaded: number
  progress: number
  total: number
}

export enum AudioInstanceId {
  BGM = 'bgm',
  DrawCardSound = 'drawCardSound',
}
export default class PreloadStore {
  rootStoreRef: Store

  preloadQueue: createjs.LoadQueue | undefined = undefined

  preloadResult = {
    assetPreloadProgress: 0,
    pagesPreloadProgress: 0,
    networkPreloadProgress: 0,
  }

  audioInstanceMap = observable.map<AudioInstanceId, createjs.AbstractSoundInstance>()

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      preloadResult: observable,
      preloadProgress: computed,
      handlePreloadProgress: action,
    })
  }

  resetStore = () => {
    this.preloadQueue = undefined
    this.preloadResult = {
      assetPreloadProgress: 0,
      pagesPreloadProgress: 0,
      networkPreloadProgress: 0,
    }
  }

  get preloadProgress() {
    return new BigNumber(this.preloadResult.assetPreloadProgress)
      .plus(this.preloadResult.pagesPreloadProgress)
      .plus(this.preloadResult.networkPreloadProgress)
      .dividedBy(3)
      .decimalPlaces(2)
      .toNumber()
  }

  handlePreloadProgress = (event: object) => {
    this.preloadResult.assetPreloadProgress = (event as unknown as PreloadProgressEvent).progress
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

  handleFilePreload = (event: object) => {
    const fileId = (event as unknown as { item: { id: string } }).item.id
    if (
      Object.values(AudioInstanceId).includes(fileId as AudioInstanceId) &&
      !this.audioInstanceMap.has(fileId as AudioInstanceId)
    ) {
      this.audioInstanceMap.set(
        fileId as AudioInstanceId,
        window.createjs.Sound.createInstance(fileId),
      )
    }
  }

  preloadAssets = () => {
    return new Promise<object>((resolve, reject) => {
      if (!window.createjs?.PreloadJS) reject(new Error('Failed to load CreateJS'))
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
      queue.on('fileload', this.handleFilePreload)
      queue.loadManifest(preloadManifest)
    })
  }
}

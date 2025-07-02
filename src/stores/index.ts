import { makeObservable, action, observable } from 'mobx'
import { enableStaticRendering } from 'mobx-react-lite'
import AppStore from './app-store.ts'
import ModalStore from '@/stores/modal-store.ts'
import PreloadStore from '@/stores/preload-store.ts'
import SystemStore from '@/stores/system-store.ts'

enableStaticRendering(typeof window === 'undefined')

export class Store {
  initSearchParams?: URLSearchParams = undefined

  systemStore: SystemStore

  appStore: AppStore

  preloadStore: PreloadStore

  modalStore: ModalStore

  constructor() {
    this.systemStore = new SystemStore(this)
    this.appStore = new AppStore(this)
    this.modalStore = new ModalStore(this)
    this.preloadStore = new PreloadStore(this)
    makeObservable(this, {
      hydrate: action,
      systemStore: observable,
      appStore: observable,
      modalStore: observable,
      preloadStore: observable,
    })
  }

  setInitSearchParams = (urlSearchParams: URLSearchParams) => {
    console.log('setInitSearchParams', urlSearchParams.toString())
    this.initSearchParams = urlSearchParams
  }

  hydrate = (initData: never) => {
    console.log('hydrate', initData)
  }

  resetStore = () => {
    this.initSearchParams = undefined
    this.systemStore.resetStore()
    this.appStore.resetStore()
    this.preloadStore.resetStore()
    this.modalStore.resetStore()
  }
}

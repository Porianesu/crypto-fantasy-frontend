import type { Store } from '@/stores/index.ts'
import { action, makeAutoObservable, observable } from 'mobx'

export default class StoresStore {
  rootStoreRef: Store

  count: number = 0

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      count: observable,
      setCount: action,
      resetStore: action,
    })
  }

  setCount = (count: number) => {
    this.count = count
  }

  resetStore = () => {}
}

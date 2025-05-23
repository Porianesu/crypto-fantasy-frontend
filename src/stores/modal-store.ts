import { Store } from '@/stores/index'
import { action, makeObservable, observable } from 'mobx'

export default class ModalStore {
  rootStoreRef: Store

  loginModalVisible = false

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeObservable(this, {
      resetStore: action,
      loginModalVisible: observable,
      changeLoginModalVisible: action,
    })
  }

  resetStore = () => {
    this.loginModalVisible = false
  }

  changeLoginModalVisible = (newValue: boolean) => {
    this.loginModalVisible = newValue
  }
}

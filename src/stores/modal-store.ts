import { Store } from '@/stores/index'
import { action, makeObservable, observable } from 'mobx'

export default class ModalStore {
  rootStoreRef: Store

  loginModalVisible = false

  drawCardsModalVisible = false

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeObservable(this, {
      resetStore: action,
      loginModalVisible: observable,
      changeLoginModalVisible: action,
      drawCardsModalVisible: observable,
      changeDrawCardsModalVisible: action,
    })
  }

  resetStore = () => {
    this.loginModalVisible = false
  }

  changeLoginModalVisible = (newValue: boolean) => {
    this.loginModalVisible = newValue
  }

  changeDrawCardsModalVisible = (newValue: boolean) => {
    this.drawCardsModalVisible = newValue
  }
}

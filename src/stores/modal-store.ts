import { Store } from '@/stores/index'
import { action, makeObservable, observable } from 'mobx'

export enum ICardsBagModalType {
  EDIT = 'edit',
  VIEW = 'view',
}

export default class ModalStore {
  rootStoreRef: Store

  loginModalVisible = false

  drawCardsModalVisible = false

  cardsBagModalVisible = false

  cardsBagModalType: ICardsBagModalType = ICardsBagModalType.VIEW

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeObservable(this, {
      resetStore: action,
      loginModalVisible: observable,
      changeLoginModalVisible: action,
      drawCardsModalVisible: observable,
      changeDrawCardsModalVisible: action,
      cardsBagModalVisible: observable,
      changeCardsBagModalVisible: action,
      cardsBagModalType: observable,
      changeCardsBagModalType: action,
    })
  }

  resetStore = () => {
    this.loginModalVisible = false
    this.drawCardsModalVisible = false
    this.cardsBagModalVisible = false
    this.cardsBagModalType = ICardsBagModalType.VIEW
  }

  changeLoginModalVisible = (newValue: boolean) => {
    this.loginModalVisible = newValue
  }

  changeDrawCardsModalVisible = (newValue: boolean) => {
    this.drawCardsModalVisible = newValue
  }

  changeCardsBagModalVisible = (newValue: boolean) => {
    this.cardsBagModalVisible = newValue
  }

  changeCardsBagModalType = (newValue: ICardsBagModalType) => {
    this.cardsBagModalType = newValue
  }
}

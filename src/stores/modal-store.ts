import { Store } from '@/stores/index'
import { action, makeObservable, observable } from 'mobx'
import type { ICardData } from '@/components/Card.tsx'

export enum ICardsBagModalType {
  EDIT = 'edit',
  VIEW = 'view',
}
interface ICardsBagModalData {
  visible: boolean
  type: ICardsBagModalType
}

export default class ModalStore {
  rootStoreRef: Store

  loginModalVisible = false

  drawCardsModalVisible = false

  cardsBagModalData: ICardsBagModalData = {
    visible: false,
    type: ICardsBagModalType.VIEW,
  }

  viewDetailModalData: ICardData | undefined = undefined

  viewDetailModalVisible = false

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeObservable(this, {
      resetStore: action,
      loginModalVisible: observable,
      changeLoginModalVisible: action,
      drawCardsModalVisible: observable,
      changeDrawCardsModalVisible: action,
      cardsBagModalData: observable,
      changeCardsBagModalData: action,
      viewDetailModalData: observable,
      changeViewDetailModalData: action,
      viewDetailModalVisible: observable,
      changeViewDetailModalVisible: action,
    })
  }

  resetStore = () => {
    this.loginModalVisible = false
    this.drawCardsModalVisible = false
    this.cardsBagModalData = {
      visible: false,
      type: ICardsBagModalType.VIEW,
    }
    this.viewDetailModalData = undefined
    this.viewDetailModalVisible = false
  }

  changeLoginModalVisible = (newValue: boolean) => {
    this.loginModalVisible = newValue
  }

  changeDrawCardsModalVisible = (newValue: boolean) => {
    this.drawCardsModalVisible = newValue
  }

  changeCardsBagModalData = (newData: Partial<ICardsBagModalData>) => {
    this.cardsBagModalData = {
      ...this.cardsBagModalData,
      ...newData,
    }
  }

  changeViewDetailModalData = (newValue: ICardData | undefined) => {
    this.viewDetailModalData = newValue
  }

  changeViewDetailModalVisible = (newValue: boolean) => {
    this.viewDetailModalVisible = newValue
  }
}

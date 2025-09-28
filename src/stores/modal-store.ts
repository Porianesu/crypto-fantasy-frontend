import { Store } from '@/stores/index'
import { action, makeObservable, observable } from 'mobx'
import type { ICardData } from '@/components/Card.tsx'

export enum ICardsBagModalType {
  EDIT = 'edit',
  VIEW = 'view',
}
interface IBagModalData {
  visible: boolean
  type: ICardsBagModalType
}

export default class ModalStore {
  rootStoreRef: Store

  loginModalVisible = false

  drawCardsModalVisible = false

  bagModalData: IBagModalData = {
    visible: false,
    type: ICardsBagModalType.VIEW,
  }

  viewDetailModalData: ICardData | undefined = undefined

  viewDetailModalVisible = false

  battleModalVisible = false

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeObservable(this, {
      resetStore: action,
      loginModalVisible: observable,
      changeLoginModalVisible: action,
      drawCardsModalVisible: observable,
      changeDrawCardsModalVisible: action,
      bagModalData: observable,
      changeBagModalData: action,
      viewDetailModalData: observable,
      changeViewDetailModalData: action,
      viewDetailModalVisible: observable,
      changeViewDetailModalVisible: action,
      battleModalVisible: observable,
      changeBattleModalVisible: action,
    })
  }

  resetStore = () => {
    this.loginModalVisible = false
    this.drawCardsModalVisible = false
    this.bagModalData = {
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

  changeBagModalData = (newData: Partial<IBagModalData>) => {
    this.bagModalData = {
      ...this.bagModalData,
      ...newData,
    }
  }

  changeViewDetailModalData = (newValue: ICardData | undefined) => {
    this.viewDetailModalData = newValue
  }

  changeViewDetailModalVisible = (newValue: boolean) => {
    this.viewDetailModalVisible = newValue
  }

  changeBattleModalVisible = (newValue: boolean) => {
    this.battleModalVisible = newValue
  }
}

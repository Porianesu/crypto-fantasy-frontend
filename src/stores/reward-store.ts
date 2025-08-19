import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  type IBuyShopItemResponse,
  type IGetSignInStatusResponse,
  type ISignInResponse,
  type ShopItem,
  type SignInStatus,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { type Id, toast } from 'react-toastify'

export default class RewardStore {
  rootStoreRef: Store

  signInStatus: Array<SignInStatus> = []

  buyItemTimer: ReturnType<typeof setTimeout> | null = null

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      initData: flow.bound,
      signInStatus: observable,
      initSignInStatus: flow.bound,
      signIn: flow.bound,
      showRedDot: computed,
      buyItem: action,
    })
  }

  resetStore = () => {
    this.signInStatus = []
    this.buyItemTimer = null
  };

  *initData() {
    yield Promise.all([this.initSignInStatus()])
  }

  *initSignInStatus() {
    const result: AxiosResponse<IGetSignInStatusResponse> = yield API.getSignInStatus()
    if (result?.data?.signInStatus && Array.isArray(result.data.signInStatus)) {
      this.signInStatus = result.data.signInStatus
    }
  }

  *signIn() {
    if (!this.rootStoreRef.appStore.userInfo) return
    const result: AxiosResponse<ISignInResponse> = yield API.signIn()
    if (result?.data?.success) {
      this.signInStatus = this.signInStatus.map((status) => {
        const isToday = dayjs(status.date).isSame(dayjs(result.data.signDate), 'day')
        if (isToday) {
          return {
            ...status,
            signed: true,
          }
        }
        return status
      })
      const newUserInfo = {
        ...this.rootStoreRef.appStore.userInfo,
        solAmount:
          (this.rootStoreRef.appStore.userInfo.solAmount || 0) + result.data.reward.solAmount,
        faithAmount:
          (this.rootStoreRef.appStore.userInfo.faithAmount || 0) + result.data.reward.faithAmount,
      }
      this.rootStoreRef.appStore.updateUserInfo(newUserInfo)
    }
  }

  get showRedDot() {
    if (this.rootStoreRef.appStore.userInfo?.newbieRewardClaimed === false) {
      return true
    }
    const today = dayjs()
    return this.signInStatus.some((status) => {
      const targetDate = dayjs(status.date)
      return today.isSame(targetDate, 'day') && !status.signed
    })
  }

  buyItem = (item: ShopItem): undefined | Id | Promise<'success' | void> => {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (this.rootStoreRef.appStore.userInfo.solAmount < item.price) {
      return toast.error('Insufficient balance to buy this item.')
    }
    if (item.dailyLimit > 0 && item.todayPurchased >= item.dailyLimit) {
      return toast.error('You have reached the daily purchase limit for this item.')
    }
    if (this.buyItemTimer) clearTimeout(this.buyItemTimer)
    return new Promise((resolve) => {
      this.buyItemTimer = setTimeout(async () => {
        const result: AxiosResponse<IBuyShopItemResponse> = await API.buyShopItem(item.id)
        if (result?.data?.user?.email === this.rootStoreRef.appStore.userInfo!.email) {
          this.rootStoreRef.appStore.updateUserInfo(result.data.user)
          resolve('success')
        } else {
          resolve()
        }
      }, 300)
    })
  }
}

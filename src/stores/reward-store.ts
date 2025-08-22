import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  type IBuyShopItemResponse,
  type IClaimNewbieRewardResponse,
  type IGetSignInStatusResponse,
  type ISignInResponse,
  type ShopItem,
  type SignInStatus,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'

export default class RewardStore {
  rootStoreRef: Store

  signInStatus: Array<SignInStatus> = []

  buyItemNetworkFlag = false

  claimNewbieRewardNetworkFlag = false

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
      buyItem: flow.bound,
      claimNewbieRewardNetworkFlag: observable,
      claimNewbieReward: flow.bound,
    })
  }

  resetStore = () => {
    this.signInStatus = []
    this.buyItemNetworkFlag = false
    this.claimNewbieRewardNetworkFlag = false
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
    const today = dayjs()
    return this.signInStatus.some((status) => {
      const targetDate = dayjs(status.date)
      return today.isSame(targetDate, 'day') && !status.signed
    })
  }

  *buyItem(item: ShopItem) {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (this.rootStoreRef.appStore.userInfo.solAmount < item.price) {
      return toast.error('Insufficient balance to buy this item.')
    }
    if (item.dailyLimit > 0 && item.todayPurchased >= item.dailyLimit) {
      return toast.error('You have reached the daily purchase limit for this item.')
    }
    if (this.buyItemNetworkFlag) return
    try {
      this.buyItemNetworkFlag = true
      const result: AxiosResponse<IBuyShopItemResponse> = yield API.buyShopItem(item.id)
      if (result?.data?.user?.email === this.rootStoreRef.appStore.userInfo!.email) {
        this.rootStoreRef.appStore.updateUserInfo(result.data.user)
        return 'success'
      }
    } finally {
      this.buyItemNetworkFlag = false
    }
  }

  *claimNewbieReward() {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (this.rootStoreRef.appStore.userInfo.newbieRewardClaimed) {
      toast.error('You have already claimed the newbie reward.')
      return
    }
    if (this.claimNewbieRewardNetworkFlag) return
    try {
      this.claimNewbieRewardNetworkFlag = true
      const result: AxiosResponse<IClaimNewbieRewardResponse> = yield API.claimNewbieReward()
      if (result?.data?.success) {
        const newUserInfo = {
          ...this.rootStoreRef.appStore.userInfo,
          solAmount: result.data.user.solAmount,
          faithAmount: result.data.user.faithAmount,
          newbieRewardClaimed: result.data.user.newbieRewardClaimed,
        }
        this.rootStoreRef.appStore.updateUserInfo(newUserInfo)
        return result.data
      }
    } finally {
      this.claimNewbieRewardNetworkFlag = false
    }
  }
}

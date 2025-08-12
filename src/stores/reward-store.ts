import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  type IGetSignInStatusResponse,
  type ISignInResponse,
  type SignInStatus,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'
import dayjs from 'dayjs'

export default class RewardStore {
  rootStoreRef: Store

  signInStatus: Array<SignInStatus> = []

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
    })
  }

  resetStore = () => {};

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
}

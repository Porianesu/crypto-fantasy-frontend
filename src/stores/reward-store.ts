import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import API, { type IGetSignInStatusResponse, type SignInStatus } from '@/axios/api.ts'
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

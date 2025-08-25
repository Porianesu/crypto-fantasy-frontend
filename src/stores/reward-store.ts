import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  ACHIEVEMENT_STATUS,
  type IAchievement,
  type IBuyShopItemResponse,
  type IClaimAchievementResponse,
  type IClaimNewbieRewardResponse,
  type IGetAchievementsResponse,
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

  totalSignInCount = 0

  signInStatus: Array<SignInStatus> = []

  buyItemNetworkFlag = false

  claimNewbieRewardNetworkFlag = false

  signInNetworkFlag = false

  achievements: Array<IAchievement> = []

  claimAchievementNetworkFlag = false

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      initData: flow.bound,
      totalSignInCount: observable,
      signInStatus: observable,
      initSignInStatus: flow.bound,
      signIn: flow.bound,
      showRedDot: computed,
      buyItem: flow.bound,
      claimNewbieRewardNetworkFlag: observable,
      claimNewbieReward: flow.bound,
      achievements: observable,
      initAchievements: flow.bound,
      claimAchievement: flow.bound,
      claimAchievementNetworkFlag: observable,
    })
  }

  resetStore = () => {
    this.totalSignInCount = 0
    this.signInStatus = []
    this.buyItemNetworkFlag = false
    this.claimNewbieRewardNetworkFlag = false
    this.achievements = []
    this.claimAchievementNetworkFlag = false
  };

  *initData() {
    yield Promise.all([this.initSignInStatus(), this.initAchievements()])
  }

  *initSignInStatus() {
    const result: AxiosResponse<IGetSignInStatusResponse> = yield API.getSignInStatus()
    if (result?.data?.signInStatus && Array.isArray(result.data.signInStatus)) {
      this.totalSignInCount = result.data.totalSignInCount
      this.signInStatus = result.data.signInStatus
    }
  }

  *signIn() {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (this.signInNetworkFlag) return
    try {
      const result: AxiosResponse<ISignInResponse> = yield API.signIn()
      if (result?.data?.success) {
        this.totalSignInCount += 1
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
        return result.data
      }
    } finally {
      this.signInNetworkFlag = false
    }
  }

  get showRedDot() {
    const today = dayjs()
    const isSignInAvailable = this.signInStatus.some((status) => {
      const targetDate = dayjs(status.date)
      return today.isSame(targetDate, 'day') && !status.signed
    })
    if (isSignInAvailable) return true
    return this.achievements.some((ach) => ach.status === ACHIEVEMENT_STATUS.COMPLETED)
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

  *initAchievements() {
    const result: AxiosResponse<IGetAchievementsResponse> = yield API.getAchievements()
    if (Array.isArray(result?.data?.achievements)) {
      this.achievements = result.data.achievements
    }
  }

  *claimAchievement(achievement: IAchievement) {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (this.claimAchievementNetworkFlag) return
    if (achievement.status !== ACHIEVEMENT_STATUS.COMPLETED) {
      toast.error('This achievement is claimable.')
      return
    }
    try {
      this.claimAchievementNetworkFlag = true
      const result: AxiosResponse<IClaimAchievementResponse> = yield API.claimAchievement(
        achievement.id,
      )
      if (result?.data?.success) {
        const newUserInfo = {
          ...this.rootStoreRef.appStore.userInfo,
          solAmount: result.data.solAmount,
          faithAmount: result.data.faithAmount,
        }
        this.rootStoreRef.appStore.updateUserInfo(newUserInfo)
        this.achievements = this.achievements.map((ach) => {
          if (ach.id === achievement.id) {
            return {
              ...ach,
              status: ACHIEVEMENT_STATUS.REWARD_CLAIMED,
              completedAt: dayjs().toISOString(),
            }
          }
          return ach
        })
        return result.data
      }
    } catch (e) {
      console.error(e)
    } finally {
      this.claimAchievementNetworkFlag = false
    }
  }
}

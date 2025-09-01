import type { Store } from '@/stores/index.ts'
import { action, computed, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  ACHIEVEMENT_STATUS,
  type IAchievement,
  type IBindInvitationResponse,
  type IBuyShopItemResponse,
  type IClaimAchievementResponse,
  type IClaimInvitationRewardResponse,
  type IClaimNewbieRewardResponse,
  type IGetAchievementsResponse,
  type IGetSignInStatusResponse,
  type IInvitationStatusResponse,
  type ISignInResponse,
  type ShopItem,
  type SignInStatus,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'
import dayjs from 'dayjs'
import { toast } from 'react-toastify'
import { URL_PARAMS } from '@/navigation/routes.tsx'

export default class RewardStore {
  rootStoreRef: Store

  totalSignInCount = 0

  signInStatus: Array<SignInStatus> = []

  buyItemNetworkFlag = false

  claimNewbieRewardNetworkFlag = false

  signInNetworkFlag = false

  achievements: Array<IAchievement> = []

  updateAchievementsInterval: ReturnType<typeof setInterval> | null = null

  claimAchievementNetworkFlag = false

  invitationStatus: IInvitationStatusResponse | null = null

  claimAllInvitationRewardNetworkFlag = false

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
      invitationStatus: observable,
      initInvitationStatus: flow.bound,
      claimAllInvitationRewardNetworkFlag: observable,
      claimAllInvitationReward: flow.bound,
      bindInvitation: flow.bound,
      autoBindInvitation: flow.bound,
    })
  }

  resetStore = () => {
    this.totalSignInCount = 0
    this.signInStatus = []
    this.buyItemNetworkFlag = false
    this.claimNewbieRewardNetworkFlag = false
    this.achievements = []
    this.claimAchievementNetworkFlag = false
    this.invitationStatus = null
  };

  *initData() {
    yield Promise.all([
      this.initSignInStatus(),
      this.initAchievements(),
      this.initInvitationStatus(),
    ])
    this.autoBindInvitation()
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
    const isAchievementRewardClaimable = this.achievements.some(
      (ach) => ach.status === ACHIEVEMENT_STATUS.COMPLETED,
    )
    if (isAchievementRewardClaimable) return true
    return !!this.invitationStatus?.invitationsAsInviter.filter((item) => !item.claimed).length
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
    if (this.updateAchievementsInterval) {
      clearInterval(this.updateAchievementsInterval)
    }
    this.updateAchievementsInterval = setInterval(() => {
      this.initAchievements()
    }, 30 * 1000) // 每5分钟更新一次
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

  *initInvitationStatus() {
    const result: AxiosResponse<IInvitationStatusResponse> = yield API.getInvitationStatus()
    if (Array.isArray(result?.data?.invitationsAsInviter)) {
      this.invitationStatus = result.data
    }
  }

  *claimAllInvitationReward() {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (!this.invitationStatus) return
    const claimableCount = this.invitationStatus.invitationsAsInviter.filter(
      (item) => !item.claimed,
    ).length
    if (claimableCount === 0) {
      toast.error('No claimable invitation rewards.')
      return
    }
    if (this.claimAllInvitationRewardNetworkFlag) return
    try {
      this.claimAllInvitationRewardNetworkFlag = true
      const result: AxiosResponse<IClaimInvitationRewardResponse> =
        yield API.claimInvitationReward()
      if (result?.data?.success) {
        const newUserInfo = {
          ...this.rootStoreRef.appStore.userInfo,
          solAmount:
            (this.rootStoreRef.appStore.userInfo.solAmount || 0) + result.data.rewardSolAmount,
          faithAmount:
            (this.rootStoreRef.appStore.userInfo.faithAmount || 0) + result.data.rewardFaithAmount,
        }
        this.rootStoreRef.appStore.updateUserInfo(newUserInfo)
        if (this.invitationStatus) {
          this.invitationStatus = {
            ...this.invitationStatus,
            invitationsAsInviter: this.invitationStatus.invitationsAsInviter.map((item) => ({
              ...item,
              claimed: result.data.claimedInvitationIds.some((id) => id === item.id)
                ? true
                : item.claimed,
            })),
          }
        }
        return result.data
      }
    } finally {
      this.claimAllInvitationRewardNetworkFlag = false
    }
  }

  *bindInvitation(inviteCode: string) {
    if (!this.rootStoreRef.appStore.userInfo) return
    if (!this.invitationStatus) return
    if (this.invitationStatus.inviteCode === inviteCode) {
      toast.error('You cannot invite yourself.')
      return
    }
    if (this.claimAllInvitationRewardNetworkFlag) return
    try {
      this.claimAllInvitationRewardNetworkFlag = true
      const result: AxiosResponse<IBindInvitationResponse> = yield API.bindInvitation(inviteCode)
      if (result?.data?.success) {
        const newUserInfo = {
          ...this.rootStoreRef.appStore.userInfo,
          solAmount:
            (this.rootStoreRef.appStore.userInfo.solAmount || 0) +
            (result.data.rewardSolAmount || 0),
          faithAmount:
            (this.rootStoreRef.appStore.userInfo.faithAmount || 0) +
            (result.data.rewardFaithAmount || 0),
        }
        this.rootStoreRef.appStore.updateUserInfo(newUserInfo)
        this.invitationStatus = {
          ...this.invitationStatus,
          invitationsAsInvitee: {
            id: 0,
            claimed: true,
            createdAt: dayjs().toISOString(),
          },
        }
        return result.data
      }
    } catch (e) {
      console.error(e)
      toast.error('Failed to bind invitation code. Please try again later.')
    } finally {
      this.claimAllInvitationRewardNetworkFlag = false
    }
  }

  *autoBindInvitation() {
    const inviteCode = this.rootStoreRef.appStore.initURLSearchParams?.get(URL_PARAMS.INVITE_CODE)
    console.log('autoBindInvitation inviteCode:', inviteCode)
    if (inviteCode) {
      const result: IBindInvitationResponse =
        yield this.rootStoreRef.rewardStore.bindInvitation(inviteCode)
      if (result.success) {
        toast.success('Invitation accepted successfully.')
      }
    }
  }
}

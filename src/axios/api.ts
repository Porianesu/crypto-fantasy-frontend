import request from '@/axios/request.ts'
import type { ICardDataInBag, UserInfo } from '@/stores/app-store.ts'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'

export interface ILoginAndRegisterResponse {
  type: 'login' | 'register'
  token: string
  user: UserInfo
}

export interface ILoginWithAccessTokenResponse {
  user: UserInfo
}

export interface IFetchCardsPageResponse {
  data: Array<ICardData>
  total: number
  page: number
  pageSize: number
}

export interface IDrawCardsResponse {
  cards: Array<ICardDataInBag>
  user: UserInfo
}

export interface IFetchCardsPageData {
  userCardId: number
  cardId: number
}
export interface IFetchUserCardsPageResponse {
  total: number
  page: number
  pageSize: number
  data: Array<IFetchCardsPageData>
}

export interface IMeltCardResponse {
  user: UserInfo
}

export interface ICraftCardResponse {
  success: boolean
  user: UserInfo
  resultCards: Array<ICardDataInBag>
}

export interface ISetDeckResponse {
  success: boolean
  deckCards: Array<{ cardId: number; userCardId: number }>
  deckPower: number
}

export interface IDeckLeaderboardResponse {
  leaderboard: Array<{
    id: number
    nickname: string
    avatar: string
    deckPower: number
  }>
  myDeckPower: number
  myRank: number
}

export interface RedeemCodeReward {
  solAmount: number
  faithAmount: number
}

export interface IRedeemCodeResponse {
  success: boolean
  reward: RedeemCodeReward
}

export interface ICraftRule {
  targetRarity: CARD_RARITY
  requiredCards: {
    rarity: CARD_RARITY
    count: number
  }
  requiredFaithCoin: number
  baseSuccessRate: number // 基础成功率
  maxSuccessRate: number // 最大成功率
}

export interface IGetConfigResponse {
  DefaultAvatars: Array<string>
  CraftRule: Array<ICraftRule>
  MeltRule: Array<{
    rarity: CARD_RARITY
    faithCoin: number
  }>
  NewbieReward: {
    solAmount: number
    faithAmount: number
  }
  ReferralReward: {
    invitee: {
      solAmount: number
      faithAmount: number
    }
    inviter: {
      solAmount: number
      faithAmount: number
    }
  }
  LegendaryDrawCardGuarantee: number
}

export interface IPatchUserInfoResponse {
  user: UserInfo
}

export interface ShopItem {
  id: number
  key: string
  name: string
  price: number
  rewardSol: number
  rewardFaith: number
  rewardMeltTimes: number
  dailyLimit: number
  image: string
  todayPurchased: number // 今日已购买数量
}

export interface IGetShopItemsResponse {
  items: Array<ShopItem>
}

export interface IBuyShopItemResponse {
  success: boolean
  user: UserInfo
}

export interface IClaimNewbieRewardResponse {
  success: boolean
  user: {
    solAmount: number
    faithAmount: number
    newbieRewardClaimed: boolean
  }
}

export interface SignInStatus {
  date: string
  reward: { solAmount: number; faithAmount: number }
  signed: boolean
}

export interface IGetSignInStatusResponse {
  totalSignInCount: number
  signInStatus: Array<SignInStatus>
}

export interface ISignInResponse {
  signDate: string
  success: boolean
  reward: {
    solAmount: number
    faithAmount: number
  }
}

export enum ACHIEVEMENT_STATUS {
  UNCOMPLETED = 0,
  COMPLETED = 1,
  REWARD_CLAIMED = 2,
}

export interface IAchievement {
  completedAt: string | null
  createdAt: string
  description: string
  id: number
  isActive: boolean
  progress: number
  rewardFaithAmount: number
  rewardSolAmount: number
  status: ACHIEVEMENT_STATUS
  subType: string
  target: number
  type: string
}

export interface IGetAchievementsResponse {
  achievements: Array<IAchievement>
}

export interface IClaimAchievementResponse {
  success: boolean
  solAmount: number
  faithAmount: number
}

interface IInvitation {
  id: number
  claimed: boolean
  createdAt: string
}

export interface IInvitationStatusResponse {
  inviteCode: string
  invitationsAsInviter: Array<IInvitation>
  invitationsAsInvitee: IInvitation | null
}

export interface IBindInvitationResponse {
  success: boolean
  rewardFaithAmount: number
  rewardSolAmount: number
}

export interface IClaimInvitationRewardResponse {
  success: boolean
  rewardFaithAmount: number
  rewardSolAmount: number
  claimedInvitationIds: Array<number>
}

export interface EmailLoginData {
  email: string
  password: string
  code: string
}

export interface WalletLoginData {
  address: string
  signature: string
  nonce: string
}

export interface IGetNonceResponse {
  nonce: string
}

export interface IGetVerificationCodeResponse {
  success: boolean
}

const API = {
  getConfig: async () => request.get<IGetConfigResponse>('/config'),
  loginAndRegister: async (data: EmailLoginData | WalletLoginData) =>
    request.post<ILoginAndRegisterResponse>('/users', data),
  patchUserInfo: async (data: { nickname?: string; avatar?: string }) =>
    request.patch<IPatchUserInfoResponse>('/users', data),
  loginWithAccessToken: async () => request.get<ILoginWithAccessTokenResponse>('/auth-me'),
  fetchCard: async (cardId: number) => request.get<ICardData>('/cards', { params: { id: cardId } }),
  fetchCards: async (cardId: Array<number>) =>
    request.get<Array<ICardData>>('/cards', { params: { ids: cardId.join(',') } }),
  fetchCardsPage: async (page: number, pageSize: number) => {
    return request.get<IFetchCardsPageResponse>('/cards', {
      params: {
        page: page,
        pageSize: pageSize,
      },
    })
  },
  drawCards: async () => request.post<IDrawCardsResponse>('/draw-cards'),
  fetchUserCardsPage: async (page: number, pageSize: number) =>
    request.get<IFetchUserCardsPageResponse>('/user-cards', {
      params: {
        page,
        pageSize,
      },
    }),
  fetchUserAllCards: async () => {
    let page = 1
    const pageSize = 200
    let allData: Array<IFetchCardsPageData> = []
    let total = 0
    do {
      const { data: res } = await API.fetchUserCardsPage(page, pageSize)
      if (page === 1) total = res.total
      allData = allData.concat(res.data)
      page++
    } while (allData.length < total)
    return allData
  },
  meltCard: async (userCardIds: Array<number>) =>
    request.post<IMeltCardResponse>('/melt-card', { userCardIds }),
  craftCard: async (data: {
    craftCardId: number
    requiredUserCardIds: Array<number>
    additiveUserCardIds?: Array<number>
  }) => request.post<ICraftCardResponse>('/craft-card', data),
  setDeck: async (
    deckCards: Array<{
      cardId: number
      userCardId: number
    }>,
    signal?: AbortSignal,
  ) => request.post<ISetDeckResponse>('/set-deck', { deckCards }, { signal }),
  deckLeaderboard: async () => request.get<IDeckLeaderboardResponse>('/deck-leaderboard'),
  redeemCode: async (code: string) => request.post<IRedeemCodeResponse>('/redeem-code', { code }),
  getShopItems: async () => request.get<IGetShopItemsResponse>('/shop-items'),
  buyShopItem: async (shopItemId: number) =>
    request.post<IBuyShopItemResponse>('/shop-items', { shopItemId }),
  claimNewbieReward: async () => request.post<IClaimNewbieRewardResponse>('/reward/claim-newbie'),
  getSignInStatus: async () => request.get<IGetSignInStatusResponse>('/reward/sign-in'),
  signIn: async () => request.post<ISignInResponse>('/reward/sign-in'),
  getAchievements: async () => request.get<IGetAchievementsResponse>('/reward/achievements'),
  claimAchievement: async (achievementId: number) =>
    request.post<IClaimAchievementResponse>('/reward/achievements', { achievementId }),
  getInvitationStatus: async () => request.get<IInvitationStatusResponse>('/reward/invitation'),
  bindInvitation: async (inviteCode: string) =>
    request.post<IBindInvitationResponse>('/reward/invitation', { inviteCode }),
  claimInvitationReward: async () =>
    request.post<IClaimInvitationRewardResponse>('/reward/claim-invite-reward'),
  getNonce: async (address: string) =>
    request.get<IGetNonceResponse>('/nonce', { params: { address } }),
  getVerificationCode: async (email: string) =>
    request.post<IGetVerificationCodeResponse>('/verification-code', { email }),
}

export default API

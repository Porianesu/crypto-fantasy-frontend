import type { Store } from '@/stores/index.ts'
import { action, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  type IGetXAccountResponse,
  type IGetXCallbackResponse,
  type IGetXRequestTokenResponse,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'
import { URL_PARAMS } from '@/navigation/routes.tsx'
import { toast } from 'react-toastify'

export interface IXAccount {
  twitterUserId: string
  screenName: string
  oauthToken: string
  oauthTokenSecret: string
}

export default class ThirdPartAppStore {
  rootStoreRef: Store

  twitterAccount: IXAccount | null = null
  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      initData: flow.bound,
      initXAccount: flow.bound,
      getXRequestToken: flow.bound,
      getXCallback: flow.bound,
    })
  }

  resetStore() {}

  *initData() {
    yield this.initXAccount()
    if (this.rootStoreRef.appStore.initURLSearchParams) {
      const oauth_token = this.rootStoreRef.appStore.initURLSearchParams.get(URL_PARAMS.OAUTH_TOKEN)
      const oauth_verifier = this.rootStoreRef.appStore.initURLSearchParams.get(
        URL_PARAMS.OAUTH_VERIFIER,
      )
      if (oauth_token && oauth_verifier) {
        yield this.getXCallback(oauth_token, oauth_verifier)
      }
    }
  }

  *initXAccount() {
    const result: AxiosResponse<IGetXAccountResponse> = yield API.getXAccount()
    if (result.data.twitterAccount?.twitterUserId) {
      this.twitterAccount = result.data.twitterAccount
    }
  }

  *getXRequestToken() {
    const result: AxiosResponse<IGetXRequestTokenResponse> = yield API.getXRequestToken()
    if (result.data.oauth_token) {
      window.location.replace(
        `https://api.twitter.com/oauth/authenticate?oauth_token=${result.data.oauth_token}`,
      )
    }
  }

  *getXCallback(oauth_token: string, oauth_verifier: string) {
    const result: AxiosResponse<IGetXCallbackResponse> = yield API.getXCallback(
      oauth_token,
      oauth_verifier,
    )
    if (result.data.success) {
      this.twitterAccount = result.data.twitterAccount
      toast.success(
        `Twitter account${result.data.twitterAccount.screenName || result.data.twitterAccount.twitterUserId} linked successfully`,
      )
    }
  }
}

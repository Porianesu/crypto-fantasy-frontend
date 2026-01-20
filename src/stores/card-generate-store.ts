import type { Store } from '@/stores/index.ts'
import { flow, makeAutoObservable, observable } from 'mobx'
import API, {
  type IGenerateImage,
  type IGetGenerateImagePageParams,
  type IGetGenerateImagePageResponse,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'

export default class CardGenerateStore {
  rootStoreRef: Store

  userGallery: Array<IGenerateImage> = []

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      userGallery: observable,
      initUserGallery: flow.bound,
    })
  }

  *initUserGallery() {
    const params: IGetGenerateImagePageParams = {
      page: 1,
      limit: 20,
      includeBytes: false,
    }
    const result: AxiosResponse<IGetGenerateImagePageResponse> = yield API.getGenerateImage(params)
    if (result?.data?.images?.length) {
      this.userGallery = result.data.images
    }
  }
}

import type { Store } from '@/stores/index.ts'
import { action, flow, makeAutoObservable, observable } from 'mobx'
import API, {
  type IGenerateImage,
  type IGetGenerateImagePageParams,
  type IGetGenerateImagePageResponse,
} from '@/axios/api.ts'
import type { AxiosResponse } from 'axios'

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
}

export default class CardGenerateStore {
  rootStoreRef: Store

  userGallery: Array<IGenerateImage> = []

  galleryPagination = DEFAULT_PAGINATION

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      resetStore: action,
      userGallery: observable,
      initUserGallery: flow.bound,
      galleryPagination: observable,
      changeGalleryPagination: action,
    })
  }

  resetStore = () => {
    this.galleryPagination = DEFAULT_PAGINATION
  };

  *initUserGallery() {
    const params: IGetGenerateImagePageParams = {
      page: DEFAULT_PAGINATION.page,
      limit: DEFAULT_PAGINATION.limit,
      includeBytes: false,
    }
    const result: AxiosResponse<IGetGenerateImagePageResponse> = yield API.getGenerateImage(params)
    if (result?.data?.images?.length) {
      this.galleryPagination.total = result.data.total
      this.userGallery = result.data.images
    }
  }

  changeGalleryPagination = (params: Partial<typeof DEFAULT_PAGINATION>) => {
    this.galleryPagination = {
      ...this.galleryPagination,
      ...params,
    }
  }
}

import type { Store } from '@/stores/index.ts'
import { action, makeAutoObservable, observable } from 'mobx'
import API, {
  type IGenerateImage,
  type IGetGenerateImagePageParams,
  type IGetGenerateImagePageResponse,
  type IGetGenerateImageSingleParams,
  type IGetGenerateImageSingleResponse,
} from '@/axios/api.ts'
import { type AxiosResponse } from 'axios'
import { convertBytesToObjectUrl } from '@/utils/common.ts'

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 15,
  total: 0,
}

export default class CardGenerateStore {
  rootStoreRef: Store

  userGallery: Array<IGenerateImage> = []

  galleryPagination = DEFAULT_PAGINATION

  generatedImageCache = observable.map<number, string>()

  private _userGalleryUpdaterInFlight = new Map<
    string,
    Promise<AxiosResponse<IGetGenerateImageSingleResponse | IGetGenerateImagePageResponse>>
  >()

  // 内部队列与状态（非 observable）
  private _queue: number[] = []
  private _processing = false
  private _inFlight = new Map<number, Promise<void>>() // 去重：id -> promise
  private _resolvers = new Map<number, Array<() => void>>() // id -> resolvers

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      resetStore: action,
      userGallery: observable,
      initUserGallery: action,
      updateUserGallery: action,
      dealWithUpdateUserGalleryResult: action,
      galleryPagination: observable,
      changeGalleryPagination: action,
      fetchSingleImageById: action,
      generatedImageCache: observable,
    })
  }

  resetStore = () => {
    this.galleryPagination = DEFAULT_PAGINATION
  }

  dealWithUpdateUserGalleryResult = (
    page: number,
    limit: number,
    result: AxiosResponse<IGetGenerateImagePageResponse>,
  ) => {
    this.galleryPagination.total = result.data.total
    const newImages = result?.data?.images
    if (!newImages || newImages.length === 0) return
    // 计算目标插入起始索引
    const start = (page - 1) * limit
    // 采用按索引赋值的方式，确保分页结果放到对应位置（可能产生稀疏数组）
    const newGallery = [...this.userGallery]
    for (let i = 0; i < newImages.length; i++) {
      newGallery[start + i] = newImages[i]
    }
    // 赋回 observable
    this.userGallery = newGallery
  }

  initUserGallery = () => {
    this.updateUserGallery(DEFAULT_PAGINATION.page, DEFAULT_PAGINATION.limit)
  }

  updateUserGallery = (page: number, limit: number) => {
    if (!page || !limit) return Promise.resolve()
    const key = `${page}_${limit}`
    if (this._userGalleryUpdaterInFlight.has(key)) return this._userGalleryUpdaterInFlight.get(key)!
    const params: IGetGenerateImagePageParams = {
      page,
      limit,
      includeBytes: false,
    }
    const p = API.getGenerateImage(params)
    this._userGalleryUpdaterInFlight.set(key, p)
    p.then((res) =>
      this.dealWithUpdateUserGalleryResult(
        page,
        limit,
        res as AxiosResponse<IGetGenerateImagePageResponse>,
      ),
    ).finally(() => {
      this._userGalleryUpdaterInFlight.delete(key)
    })
    return p
  }

  changeGalleryPagination = (params: Partial<typeof DEFAULT_PAGINATION>) => {
    if (params.page && params.page !== this.galleryPagination.page) {
      const start = (params.page - 1) * this.galleryPagination.limit
      const targetGalleryItems = this.userGallery.slice(start, start + this.galleryPagination.limit)
      if (targetGalleryItems.length === 0) {
        // 需要重新拉取
        this.updateUserGallery(params.page, this.galleryPagination.limit)
      }
    }
    this.galleryPagination = {
      ...this.galleryPagination,
      ...params,
    }
  }

  // 对外调用的序列化方法，返回一个 Promise，确保同 id 的多次请求去重并按队列顺序逐个执行
  fetchSingleImageById = (id: number) => {
    if (!id) {
      return Promise.resolve()
    }
    // 已缓存
    if (this.generatedImageCache.has(id)) {
      return Promise.resolve()
    }
    // 若已有正在进行的 promise，直接复用
    const existing = this._inFlight.get(id)
    if (existing) return existing

    const p = new Promise<void>((resolve, reject) => {
      // 保存 resolver（可能有多个调用者）
      const arr = this._resolvers.get(id) ?? []
      arr.push(() => resolve())
      this._resolvers.set(id, arr)

      // enqueue
      this._queue.push(id)

      // 启动队列处理（如果没在处理）
      this._processQueue().catch((err) => {
        // 若队列处理抛错，确保所有该 id 的调用者被 reject/resolve
        const resolvers = this._resolvers.get(id) ?? []
        resolvers.forEach((r) => r())
        this._resolvers.delete(id)
        this._inFlight.delete(id)
        reject(err)
      })
    })

    this._inFlight.set(id, p)
    return p
  }

  // 私有：串行处理队列
  private async _processQueue(): Promise<void> {
    if (this._processing) return
    this._processing = true

    while (this._queue.length) {
      const id = this._queue.shift()
      if (typeof id === 'undefined') continue

      // 如果缓存已存在，直接 resolve所有等待者
      if (this.generatedImageCache.has(id)) {
        const resolvers = this._resolvers.get(id) ?? []
        resolvers.forEach((r) => r())
        this._resolvers.delete(id)
        this._inFlight.delete(id)
        continue
      }

      try {
        const params: IGetGenerateImageSingleParams = {
          id,
          includeBytes: true,
        }
        const result = (await API.getGenerateImage(
          params,
        )) as AxiosResponse<IGetGenerateImageSingleResponse>
        if (result?.data?.image?.imageBytes) {
          const imageUrl = convertBytesToObjectUrl(result.data.image.imageBytes)
          if (imageUrl) {
            this.generatedImageCache.set(id, imageUrl)
          }
        }

        const resolvers = this._resolvers.get(id) ?? []
        resolvers.forEach((r) => r())
        this._resolvers.delete(id)
        this._inFlight.delete(id)
      } catch {
        const resolvers = this._resolvers.get(id) ?? []
        // 为简单起见，将失败也视为已完成（调用者可以检测 cache / error 状态）
        resolvers.forEach((r) => r())
        this._resolvers.delete(id)
        this._inFlight.delete(id)
        // 继续处理下一个，不中断整个队列
      }
    }

    this._processing = false
  }
}

import type { Store } from '@/stores/index.ts'
import { action, computed, makeAutoObservable, observable } from 'mobx'
import { BigNumber } from 'bignumber.js'

const DESIGN_WIDTH = 1920
const DESIGN_FONT_SIZE = 16
export default class SystemStore {
  rootStoreRef: Store

  resizeThrottleTimer = 0

  resizeDebounceTimer = 0

  ratioContainerWidth = window?.innerWidth || DESIGN_WIDTH

  fontSizeScaleRate = 1

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      ratioContainerWidth: observable,
      fontSizeScaleRate: observable,
      scaleScreen: action,
      aspectRatio: computed,
    })
    window.addEventListener('resize', this.handleWindowResize)
  }

  scaleScreen = () => {
    const container = document.getElementById('ratio-container')
    if (container) {
      const ww = window.innerWidth
      const wh = window.innerHeight
      let targetWidth: number
      let targetHeight = wh
      if (ww / wh > 16 / 9) {
        // 屏幕更宽
        targetWidth = (wh * 16) / 9
        container.style.width = `${targetWidth}px`
        this.ratioContainerWidth = targetWidth
        container.style.height = `100vh`
      } else {
        // 屏幕更高
        targetWidth = ww
        targetHeight = (ww * 9) / 16
        container.style.width = `100vw`
        container.style.height = `${targetHeight}px`
      }
      const measureScaleRate = new BigNumber(targetWidth).dividedBy(DESIGN_WIDTH)
      this.fontSizeScaleRate = measureScaleRate.toNumber()
      const resultFontSize = measureScaleRate.times(DESIGN_FONT_SIZE).decimalPlaces(2).toNumber()
      window.document.documentElement.style.fontSize = `${resultFontSize}px`
    }
  }

  handleWindowResize = (ev: UIEvent) => {
    if (!ev?.currentTarget) return
    const now = Date.now()
    // 节流：高频时每600ms执行一次
    if (now - this.resizeThrottleTimer > 200) {
      this.resizeThrottleTimer = now
      this.scaleScreen()
    }
    // 防抖：最后一次一定执行
    if (this.resizeDebounceTimer) clearTimeout(this.resizeDebounceTimer)
    this.resizeDebounceTimer = window.setTimeout(() => {
      this.scaleScreen()
    }, 500)
  }

  resetStore = () => {
    this.resizeThrottleTimer = 0
    window.removeEventListener('resize', this.handleWindowResize)
  }

  get aspectRatio() {
    return new BigNumber(this.ratioContainerWidth)
      .dividedBy(DESIGN_WIDTH)
      .decimalPlaces(2)
      .toNumber()
  }
}

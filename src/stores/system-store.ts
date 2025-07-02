import type { Store } from '@/stores/index.ts'
import { action, computed, makeAutoObservable, observable } from 'mobx'
import { BigNumber } from 'bignumber.js'

const DESIGN_WIDTH = 1920
const DESIGN_FONT_SIZE = 16
export default class SystemStore {
  rootStoreRef: Store

  resizeTimer = 0

  screenWidth = window?.innerWidth || DESIGN_WIDTH

  constructor(rootStore: Store) {
    this.rootStoreRef = rootStore
    makeAutoObservable(this, {
      rootStoreRef: observable,
      resetStore: action,
      screenWidth: observable,
      handleWindowResize: action,
      aspectRatio: computed,
    })
    window.addEventListener('resize', this.handleWindowResize)
    this.scaleFontSize(this.screenWidth)
  }

  scaleFontSize = (targetWidth: number) => {
    window.document.documentElement.style.fontSize = new BigNumber(targetWidth)
      .dividedBy(DESIGN_WIDTH)
      .times(DESIGN_FONT_SIZE)
      .decimalPlaces(2)
      .toFormat({
        decimalSeparator: '.',
        suffix: 'px',
      })
  }

  handleWindowResize = (ev: UIEvent) => {
    if (!ev?.currentTarget) return
    const now = Date.now()
    if (now - this.resizeTimer > 600) {
      this.resizeTimer = now
      this.screenWidth = (ev.currentTarget as Window).innerWidth || DESIGN_WIDTH
      this.scaleFontSize(this.screenWidth)
    }
  }

  resetStore = () => {
    window.removeEventListener('resize', this.handleWindowResize)
  }

  get aspectRatio() {
    return new BigNumber(this.screenWidth).dividedBy(DESIGN_WIDTH).decimalPlaces(2).toNumber()
  }
}

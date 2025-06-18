import { observer } from 'mobx-react-lite'
import React, { type PropsWithChildren, useEffect } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollSmoother)

const PageContainer: React.FC<PropsWithChildren> = ({ children }) => {
  useEffect(() => {
    function resizeContent() {
      const container = document.getElementById('ratio-container')
      if (!container) return
      const ww = window.innerWidth
      const wh = window.innerHeight
      if (ww / wh > 16 / 9) {
        // 屏幕更宽
        container.style.width = `${(wh * 16) / 9}px`
        container.style.height = `${wh}px`
      } else {
        // 屏幕更高
        container.style.width = `${ww}px`
        container.style.height = `${(ww * 9) / 16}px`
      }
    }
    resizeContent()
    window.addEventListener('resize', resizeContent)
    return () => {
      window.removeEventListener('resize', resizeContent)
    }
  }, [])
  return (
    <div
      className={classNames(
        'h-screen',
        'w-screen',
        'flex',
        'items-center',
        'justify-center',
        'bg-black',
        'overflow-hidden',
      )}
    >
      <div id={'ratio-container'} className={classNames('flex', 'flex-col', 'items-stretch')}>
        {children}
      </div>
    </div>
  )
}
export default observer(PageContainer)

import { observer } from 'mobx-react-lite'
import React, { type PropsWithChildren, useLayoutEffect } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollSmoother)

const PageContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const {
    systemStore: { scaleScreen },
  } = useMobxStore()
  useLayoutEffect(() => {
    scaleScreen()
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

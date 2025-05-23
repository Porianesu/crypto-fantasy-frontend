import { observer } from 'mobx-react-lite'
import React, { type PropsWithChildren } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

gsap.registerPlugin(SplitText)
gsap.registerPlugin(ScrollSmoother)

const PageContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div
      className={classNames(
        'h-screen',
        'w-screen',
        'flex',
        'flex-col',
        'items-stretch',
        'bg-black',
        'overflow-hidden',
      )}
    >
      {children}
    </div>
  )
}
export default observer(PageContainer)

import { observer } from 'mobx-react-lite'
import React, { type PropsWithChildren } from 'react'
import classNames from 'classnames'

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
      )}
    >
      {children}
    </div>
  )
}
export default observer(PageContainer)

import { observer } from 'mobx-react-lite'
import React from 'react'
import classNames from 'classnames'

const LoadingPage: React.FC = () => {
  return (
    <div
      className={classNames(
        'flex',
        'items-center',
        'justify-center',
        'shrink',
        'basis-0',
        'grow',
        'bg-blue-500',
        'text-yellow-500',
      )}
    >
      Loading...
    </div>
  )
}
export default observer(LoadingPage)

import { observer } from 'mobx-react-lite'
import React from 'react'
import classNames from 'classnames'

const LoginPage: React.FC = () => {
  return (
    <div
      className={classNames(
        'flex',
        'items-center',
        'justify-center',
        'shrink',
        'basis-0',
        'grow',
        'bg-amber-200',
        'text-red-500',
      )}
    >
      Login
    </div>
  )
}
export default observer(LoginPage)

import { observer } from 'mobx-react-lite'
import React from 'react'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { getHomePath, getLoadingPath, getLoginPath } from '@/navigation/routes.tsx'

const Header: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className={classNames('shrink')}>
      <button
        onClick={() => {
          navigate(getHomePath())
        }}
      >
        Home
      </button>
      <button
        onClick={() => {
          navigate(getLoginPath())
        }}
      >
        Login
      </button>
      <button
        onClick={() => {
          navigate(getLoadingPath())
        }}
      >
        Loading
      </button>
    </div>
  )
}
export default observer(Header)

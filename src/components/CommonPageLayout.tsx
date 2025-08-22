import { observer } from 'mobx-react-lite'
import React, { type Dispatch, type JSX, type PropsWithChildren, type SetStateAction } from 'react'
import styles from './CommonPageLayout.module.css'
import classNames from 'classnames'
import { getHomePath } from '@/navigation/routes.tsx'
import { useNavigate } from 'react-router-dom'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

interface ICommonPageLayoutProps {
  title: string
  Tabs: {
    label: string
    key: string
    icon: (className: string) => JSX.Element
  }[]
  selectedTab: string
  setSelectedTab: Dispatch<SetStateAction<string>>
  containerClassName?: string
}

const CommonPageLayout: React.FC<PropsWithChildren<ICommonPageLayoutProps>> = ({
  children,
  title,
  Tabs,
  selectedTab,
  setSelectedTab,
  containerClassName,
}) => {
  const navigate = useNavigate()
  const {
    appStore: { userInfo },
  } = useMobxStore()

  const handleBack = () => {
    navigate(getHomePath())
  }

  return (
    <div className={classNames(styles.pageContainer, containerClassName)}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={classNames(styles.backButton, 'button')} onClick={handleBack}></button>
          <div className={styles.title}>{title}</div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon1}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.solAmount || 0}</span>
          </div>
          <div className={styles.assetContainer}>
            <div className={styles.assetIconContainer}>
              <div className={styles.assetIcon2}></div>
            </div>
            <span className={styles.assetAmount}>{userInfo?.faithAmount || 0}</span>
          </div>
        </div>
      </div>
      <div className={styles.body}>
        <div className={styles.tabsContainer}>
          {Tabs.map((tab) => (
            <div
              key={tab.key}
              className={classNames(styles.tabContainer, 'button', {
                [styles.tabContainerSelected]: selectedTab === tab.key,
                [styles.tabContainerUnselected]: selectedTab !== tab.key,
              })}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.icon(classNames(styles.tabIcon))}
              {tab.label}
            </div>
          ))}
        </div>
        <div className={styles.line}></div>
        {children}
      </div>
    </div>
  )
}
export default observer(CommonPageLayout)

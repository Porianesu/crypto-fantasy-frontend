import { observer } from 'mobx-react-lite'
import React, { type PropsWithChildren, useLayoutEffect } from 'react'
import classNames from 'classnames'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import styles from './PageContainer.module.css'

gsap.registerPlugin(SplitText)

const PageContainer: React.FC<PropsWithChildren> = ({ children }) => {
  const {
    systemStore: { scaleScreen },
    appStore: { globalLoading },
  } = useMobxStore()

  useLayoutEffect(() => {
    scaleScreen()
  }, [])

  return (
    <div className={styles.pageContainer}>
      {globalLoading ? <div className={styles.loadingMask}></div> : null}
      <div
        id={'ratio-container'}
        className={classNames(styles.ratioContainer, {
          [styles.globalLoadingStyle]: globalLoading,
          [styles.normalStyle]: !globalLoading,
        })}
      >
        {children}
      </div>
    </div>
  )
}
export default observer(PageContainer)

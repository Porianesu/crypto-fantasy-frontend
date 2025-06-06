import { observer } from 'mobx-react-lite'
import React, { type CSSProperties, useEffect, useImperativeHandle, useRef } from 'react'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import styles from './PreloadElement.module.css'
import classNames from 'classnames'

export interface IPreloadElementHandle {
  getContainer: () => HTMLDivElement | null
  getElement: () => HTMLElement | null
}
interface IPreloadElementProps {
  id: string
  className?: string
  style?: CSSProperties
}

const PreloadElement = React.forwardRef<IPreloadElementHandle, IPreloadElementProps>(
  ({ id, className, style }, ref) => {
    const {
      preloadStore: { preloadQueue },
    } = useMobxStore()
    const containerRef = useRef<HTMLDivElement>(null)
    const elementRef = useRef<HTMLElement>(null)
    useEffect(() => {
      if (!id) return
      const preloadedElement = preloadQueue?.getResult(id) as HTMLElement
      if (preloadedElement && containerRef.current) {
        elementRef.current = preloadedElement
        // 将预加载的 HTMLElement 直接添加到容器中
        containerRef.current.appendChild(preloadedElement)
      }
    }, [id, preloadQueue])

    useImperativeHandle(
      ref,
      () => ({
        getContainer: () => containerRef.current,
        getElement: () => elementRef.current,
      }),
      [],
    )

    return (
      <div
        ref={containerRef}
        className={classNames(styles.contentContainer, className)}
        style={style}
      ></div>
    )
  },
)
export default observer(PreloadElement)

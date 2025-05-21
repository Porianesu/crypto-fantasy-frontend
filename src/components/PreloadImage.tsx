import { observer } from 'mobx-react-lite'
import React, { type CSSProperties, useEffect, useRef } from 'react'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import styles from './PreloadImage.module.css'
import classNames from 'classnames'

interface IPreloadImageProps {
  id: string
  className?: string
  style?: CSSProperties
}

const PreloadImage: React.FC<IPreloadImageProps> = ({ id, className, style }) => {
  const {
    appStore: { preloadQueue },
  } = useMobxStore()
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!id) return
    const preloadedImage = preloadQueue?.getResult(id) as HTMLImageElement
    if (preloadedImage && containerRef.current) {
      // 将预加载的 HTMLImageElement 直接添加到容器中
      containerRef.current.appendChild(preloadedImage)
    }
  }, [id, preloadQueue])

  return (
    <div
      ref={containerRef}
      className={classNames(styles.imageContainer, className)}
      style={style}
    ></div>
  )
}
export default observer(PreloadImage)

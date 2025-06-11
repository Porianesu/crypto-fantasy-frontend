import React, { type HTMLAttributes, useMemo } from 'react'
import Card, { type ICardData } from '@/components/Card.tsx'
import classNames from 'classnames'

interface IStaticCardProps extends HTMLAttributes<HTMLDivElement> {
  card: ICardData
  width: number
  undetected?: boolean
}

const aspectRatio = 285 / 413

const StaticCard: React.FC<IStaticCardProps> = ({
  card,
  width,
  className,
  style,
  undetected = false,
  ...otherProps
}) => {
  const height = useMemo(() => Math.round(width / aspectRatio), [width])
  const scale = useMemo(() => width / 285, [width])
  return (
    <div
      className={classNames('flex items-center justify-center', className, {
        grayscale: undetected,
        'contrast-[0.8]': undetected,
      })}
      style={{ width: `${width}px`, height: `${height}px`, ...style }}
      {...otherProps}
    >
      <Card type={'static'} card={card} scale={scale} undetected={undetected}></Card>
    </div>
  )
}
export default StaticCard

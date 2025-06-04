import React, { type HTMLAttributes, useMemo } from 'react'
import Card, { type ICardData } from '@/components/Card.tsx'
import classNames from 'classnames'

interface IStaticCardProps extends HTMLAttributes<HTMLDivElement> {
  card: ICardData
  width: number
}

const aspectRatio = 285 / 413

const StaticCard: React.FC<IStaticCardProps> = ({
  card,
  width,
  className,
  style,
  ...otherProps
}) => {
  const height = useMemo(() => Math.round(width / aspectRatio), [width])
  const scale = useMemo(() => width / 285, [width])
  return (
    <div
      className={classNames('flex items-center justify-center', className)}
      style={{ width: `${width}px`, height: `${height}px`, ...style }}
      {...otherProps}
    >
      <Card
        style={{
          transform: `scale(${scale})`,
        }}
        type={'static'}
        card={card}
      ></Card>
    </div>
  )
}
export default StaticCard

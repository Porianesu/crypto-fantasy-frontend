import React, { useMemo } from 'react'
import Card, { type ICardData } from '@/components/Card.tsx'

interface IStaticCardProps {
  card: ICardData
  width: number
}

const aspectRatio = 285 / 413

const StaticCard: React.FC<IStaticCardProps> = ({ card, width }) => {
  const height = useMemo(() => Math.round(width / aspectRatio), [width])
  const scale = useMemo(() => width / 285, [width])
  return (
    <div
      className={'flex items-center justify-center'}
      style={{ width: `${width}px`, height: `${height}px` }}
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

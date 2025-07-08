import React, { type HTMLAttributes, useMemo } from 'react'
import Card, { type ICardData } from '@/components/Card.tsx'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

interface IStaticCardProps extends HTMLAttributes<HTMLDivElement> {
  card: ICardData
  width: number
  undetected?: boolean
}

const CARD_DESIGN_WIDTH = 286
const CARD_DESIGN_HEIGHT = 413

const StaticCard: React.FC<IStaticCardProps> = ({
  card,
  width,
  className,
  style,
  undetected = false,
  ...otherProps
}) => {
  const {
    systemStore: { fontSizeScaleRate },
  } = useMobxStore()
  const height = useMemo(
    () => Math.round((width * CARD_DESIGN_HEIGHT) / CARD_DESIGN_WIDTH),
    [width],
  )
  const scale = useMemo(
    () => width / (CARD_DESIGN_WIDTH * fontSizeScaleRate),
    [fontSizeScaleRate, width],
  )

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
export default observer(StaticCard)

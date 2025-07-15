import React, { type HTMLAttributes, useMemo } from 'react'
import Card, { type ICardData } from '@/components/Card.tsx'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { BigNumber } from 'bignumber.js'

interface IStaticCardProps extends HTMLAttributes<HTMLDivElement> {
  card: ICardData
  width: number
  undetected?: boolean
}

const CARD_DESIGN_WIDTH = 286
const CARD_DESIGN_HEIGHT = 413

const StaticCard = React.forwardRef<HTMLDivElement, IStaticCardProps>(
  ({ card, width, className, style, undetected = false, ...otherProps }, ref) => {
    const {
      systemStore: { fontSizeScaleRate },
    } = useMobxStore()
    const scaledWidth = useMemo(
      () => new BigNumber(width).times(fontSizeScaleRate).decimalPlaces(2).toNumber(),
      [fontSizeScaleRate, width],
    )
    const height = useMemo(
      () => Math.round((scaledWidth * CARD_DESIGN_HEIGHT) / CARD_DESIGN_WIDTH),
      [scaledWidth],
    )
    const scale = useMemo(() => width / CARD_DESIGN_WIDTH, [width])

    return (
      <div
        ref={ref}
        className={classNames('flex items-center justify-center', className, {
          grayscale: undetected,
          'contrast-[0.8]': undetected,
        })}
        style={{ width: `${scaledWidth}px`, height: `${height}px`, ...style }}
        {...otherProps}
      >
        <Card type={'static'} card={card} scale={scale} undetected={undetected}></Card>
      </div>
    )
  },
)
export default observer(StaticCard)

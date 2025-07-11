import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import styles from './Craft.module.css'
import classNames from 'classnames'
import type { ICardData } from '@/components/Card.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import CountUp from 'react-countup'
import StaticCard from '@/components/StaticCard.tsx'

const ArrowArray = new Array(4).fill(null)
const Craft: React.FC = () => {
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const [craftTargetCard, setCraftTargetCard] = useState<ICardData>()
  const [additiveCards, setAdditiveCards] = useState<Array<ICardData>>([])
  const [successRate, setSuccessRate] = useState(0)

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.checklistContainer}>
        <div className={styles.title}>Checklist</div>
        <div className={styles.checklistTarget}>
          <div>Target</div>
          {craftTargetCard ? <div className={styles.targetCard}></div> : <div>???</div>}
        </div>
        <div className={styles.requiredContainer}>
          <div>Required</div>
          <div>
            {craftTargetCard ? (
              <div className={styles.requiredCardContainer}></div>
            ) : (
              <div>???</div>
            )}
            {craftTargetCard ? (
              true ? (
                <div className={styles.clearThrough}></div>
              ) : (
                <div className={styles.notClearThrough}></div>
              )
            ) : null}
          </div>
          <div>
            <div>
              {craftTargetCard ? 123 : '???'}
              <div className={styles.requiredAssetIcon}></div>
            </div>
            {craftTargetCard ? (
              true ? (
                <div className={styles.clearThrough}></div>
              ) : (
                <div className={styles.notClearThrough}></div>
              )
            ) : null}
          </div>
        </div>
        <div className={styles.optionalContainer}>
          <div>Optional</div>
          <div className={styles.optionalCount}>{`(${additiveCards.length}/4)`}</div>
        </div>
      </div>
      <div className={styles.middleContainer}>
        <div className={styles.magicContainer}>
          <div className={styles.magicBackground}></div>
          <div className={styles.successRateContainer}>
            <div className={styles.successRateTitle}>Synthesis Rate</div>
            <div>
              <CountUp
                start={undefined}
                end={successRate}
                decimals={2}
                duration={1}
                separator=","
                preserveValue
                easingFn={(t, b, c, d) => {
                  // easeOutQuad: 先快后慢
                  t /= d
                  return -c * t * (t - 2) + b
                }}
              />
              %
            </div>
          </div>
          {ArrowArray.map((_item, index) => (
            <div className={classNames(styles.arrow, styles[`arrow${index + 1}`])}></div>
          ))}
          <div
            className={classNames(styles.targetCardContainer, {
              [styles.targetCardEmpty]: !craftTargetCard,
              button: !craftTargetCard,
            })}
          >
            {craftTargetCard ? (
              <StaticCard width={100} card={craftTargetCard}></StaticCard>
            ) : (
              <div className={classNames(styles.targetCardTitle, 'text-shadow')}>Target</div>
            )}
          </div>
        </div>
        <button className={classNames(styles.craftButton, 'button text-shadow')}>
          Craft 256<div className={styles.assetIcon}></div>
        </button>
      </div>
      <div className={styles.additiveContainer}></div>
    </div>
  )
}
export default observer(Craft)

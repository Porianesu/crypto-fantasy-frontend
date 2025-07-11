import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import styles from './Craft.module.css'
import classNames from 'classnames'
import type { ICardData } from '@/components/Card.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

const Craft: React.FC = () => {
  const {
    appStore: { userInfo },
  } = useMobxStore()
  const [craftTargetCard, setCraftTargetCard] = useState<ICardData>()
  const [additiveCards, setAdditiveCards] = useState<Array<ICardData>>([])

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

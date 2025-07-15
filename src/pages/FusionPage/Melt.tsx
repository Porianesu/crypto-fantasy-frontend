import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import styles from './Melt.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY } from '@/components/Card.tsx'
import type { ICardDataInBag } from '@/stores/app-store.ts'
import classNames from 'classnames'
import StaticCard from '@/components/StaticCard.tsx'

const MeltRule = [
  {
    rarity: CARD_RARITY.NORMAL,
    faithCoin: 12,
  },
  {
    rarity: CARD_RARITY.RARE,
    faithCoin: 45,
  },
  {
    rarity: CARD_RARITY.EPIC,
    faithCoin: 200,
  },
  {
    rarity: CARD_RARITY.LEGENDARY,
    faithCoin: 1800,
  },
]
const Melt: React.FC = () => {
  const {
    appStore: { cardsBag },
  } = useMobxStore()
  const [meltTargetCard, setMeltTargetCard] = useState<ICardDataInBag>()
  const currentRule = useMemo(
    () => MeltRule.find((item) => item.rarity === meltTargetCard?.rarity),
    [meltTargetCard?.rarity],
  )

  const handleMeltButtonClick = () => {
    setMeltTargetCard(cardsBag[0])
  }

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.selectContainer}></div>
      <div className={styles.meltContainer}>
        {meltTargetCard ? (
          <StaticCard card={meltTargetCard} className={styles.meltCard} width={166}></StaticCard>
        ) : (
          <div className={styles.meltCardEmpty}></div>
        )}
        <div className={styles.meltDescriptionContainer}>
          {meltTargetCard ? "You'll get" : 'Please place the card'}
          {currentRule ? (
            <div className={styles.faithCoinContainer}>
              {currentRule.faithCoin}
              <div className={styles.faithCoin}></div>
            </div>
          ) : null}
        </div>
        <div
          className={classNames(styles.meltButton, 'button text-shadow')}
          onClick={handleMeltButtonClick}
        >
          Melt
        </div>
      </div>
    </div>
  )
}
export default observer(Melt)

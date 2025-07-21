import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import styles from './Melt.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY } from '@/components/Card.tsx'
import type { ICardDataInBag } from '@/stores/app-store.ts'
import classNames from 'classnames'
import StaticCard from '@/components/StaticCard.tsx'
import { RARITY_OPTIONS, type RARITY_SELECT_VALUE } from '@/components/RaritySelect.tsx'
import MeltResultModal from '@/pages/FusionPage/MeltResultModal.tsx'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

gsap.registerPlugin(Flip)

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
const Melt: React.FC<{ playMeltCardVideo: () => Promise<void> }> = ({ playMeltCardVideo }) => {
  const {
    appStore: { cardsBag, userInfo, meltCard },
  } = useMobxStore()
  const [meltTargetCard, setMeltTargetCard] = useState<ICardDataInBag>()
  const bodyContainerRef = useRef<HTMLDivElement>(null)
  const meltTargetCardRef = useRef<HTMLDivElement>(null)
  const [rarityFilter, setRarityFilter] = useState<RARITY_SELECT_VALUE>('all')
  const [meltResultModalData, setMeltResultModalData] = useState<{
    open: boolean
    faithCoin: number
  }>({
    open: false,
    faithCoin: 0,
  })
  const filteredCards = useMemo(() => {
    if (rarityFilter === 'all') {
      return cardsBag
    }
    return cardsBag.filter((card) => card.rarity === rarityFilter)
  }, [cardsBag, rarityFilter])
  const currentRule = useMemo(
    () => MeltRule.find((item) => item.rarity === meltTargetCard?.rarity),
    [meltTargetCard?.rarity],
  )

  const handleMeltButtonClick = async () => {
    if (!currentRule || !meltTargetCard || !meltTargetCardRef.current) return
    const meltResult = meltCard(meltTargetCard, currentRule.faithCoin)
    if (meltResult === 'success') {
      setMeltTargetCard(undefined)
      await playMeltCardVideo()
      setMeltResultModalData({
        open: true,
        faithCoin: currentRule.faithCoin,
      })
    }
  }

  return (
    <div className={styles.bodyContainer} ref={bodyContainerRef}>
      <div className={styles.selectContainer}>
        <div className={styles.selectHeader}>
          <div className={styles.selectHeaderTitle}>Select a card</div>
          {userInfo ? (
            <div className={styles.selectLimitContainer}>
              <div className={styles.selectLimitTextContainer}>
                Limit:
                <span
                  className={classNames(styles.selectLimitRemainText, {
                    [styles.selectLimitRemainTextNotEnough]: userInfo.meltCurrent <= 0,
                  })}
                >
                  {userInfo.meltCurrent}remaining
                </span>
                <span className={styles.selectLimitMaxText}>/{userInfo.meltMax}</span>
              </div>
              <button className={classNames(styles.plusButton, 'button')}></button>
            </div>
          ) : null}
        </div>
        <div className={styles.rarityContainer}>
          {RARITY_OPTIONS.map((item) => {
            return (
              <button
                key={item.value}
                onClick={() => {
                  setRarityFilter(item.value)
                }}
                className={classNames(
                  styles.rarityItem,
                  {
                    [styles.rarityItemSelected]: rarityFilter === item.value,
                  },
                  'button',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        <div className={classNames(styles.cardsListWrapper, 'no-scrollbar')}>
          <div className={styles.cardsList}>
            {filteredCards.map((card) => (
              <StaticCard
                key={`${card.id}-${card.bagPosition}`}
                card={card}
                width={178}
                onClick={() => {
                  setMeltTargetCard(card)
                }}
              ></StaticCard>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.meltContainer}>
        {meltTargetCard ? (
          <StaticCard
            card={meltTargetCard}
            className={styles.meltCard}
            width={166}
            ref={meltTargetCardRef}
          ></StaticCard>
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
      <MeltResultModal
        open={meltResultModalData.open}
        onOpenChange={(open) => {
          setMeltResultModalData((prevState) => ({ ...prevState, open }))
        }}
        faithCoin={meltResultModalData.faithCoin}
      ></MeltResultModal>
    </div>
  )
}
export default observer(Melt)

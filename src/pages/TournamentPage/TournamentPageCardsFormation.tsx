import React from 'react'
import styles from './TournamentPageCardsFormation.module.css'
import type { IPrizePool } from '@/pages/TournamentPage/TournamentPage.tsx'
import { observer } from 'mobx-react-lite'

interface TournamentPageCardsFormationProps {
  currentPrizePool: IPrizePool | undefined
}

const TournamentPageCardsFormation: React.FC<TournamentPageCardsFormationProps> = ({
  currentPrizePool,
}) => {
  if (!currentPrizePool) {
    return (
      <div className={styles.formationContainer}>
        <div className={styles.formationTitle}>Your Formation</div>
        <div className="flex flex-1 items-center justify-center w-full h-full text-blue-300 text-2xl">
          Loading...
        </div>
      </div>
    )
  }
  if (currentPrizePool.status !== 2 && !currentPrizePool.user_participated) {
    return (
      <div className={styles.formationContainer}>
        <div className={styles.formationTitle}>Your Formation</div>
        <div className="flex flex-1 items-center justify-center w-full h-full text-blue-300 text-xl">
          You did not participate in this pool.
        </div>
      </div>
    )
  }
  // 卡片渲染函数，避免重复
  const renderCard = (cardId: number | undefined | null, key: React.Key) =>
    cardId !== undefined && cardId !== null ? (
      <img
        key={key}
        className={styles.formationCardImg}
        src={`/public/cards/${cardId}.png`}
        alt={`Card ${cardId}`}
      />
    ) : (
      <div key={key} className={styles.formationCardSlot}>
        +
      </div>
    )

  const cards = currentPrizePool.user_card_formation || []
  // 保证5个卡槽
  const paddedCards = [...cards, ...Array(5 - cards.length).fill(undefined)]

  return (
    <div className={styles.formationContainer}>
      <div className={styles.formationTitle}>Your Formation</div>
      <div className={styles.formationCards}>
        <div className={styles.formationCardsRow}>
          {paddedCards.slice(0, 3).map((cardId, idx) => renderCard(cardId, idx))}
        </div>
        <div className={styles.formationCardsRow}>
          {paddedCards.slice(3, 5).map((cardId, idx) => renderCard(cardId, idx + 3))}
        </div>
      </div>
      <div className={styles.deckPowerLabel}>Deck Power</div>
      <div className={styles.deckPowerValue}>{currentPrizePool.user_deck_power ?? 0}</div>
    </div>
  )
}

export default observer(TournamentPageCardsFormation)

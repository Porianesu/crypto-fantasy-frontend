import React from 'react'
import styles from './TournamentPageCardsFormation.module.css'
import type { IPrizePool } from '@/pages/TournamentPage/TournamentPage.tsx'

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
        <div className="flex flex-1 items-center justify-center w-full h-full text-blue-300 text-2xl">Loading...</div>
      </div>
    )
  }
  const cards = currentPrizePool.user_card_formation || Array(5).fill(undefined)
  return (
    <div className={styles.formationContainer}>
      <div className={styles.formationTitle}>Your Formation</div>
      <div className={styles.formationCards}>
        <div className={styles.formationCardsRow}>
          {cards.slice(0, 3).map((cardId, idx) =>
            cardId !== undefined && cardId !== null ? (
              <img
                key={idx}
                className={styles.formationCardImg}
                src={`/public/cards/${cardId}.png`}
                alt={`Card ${cardId}`}
              />
            ) : (
              <div key={idx} className={styles.formationCardSlot}>
                +
              </div>
            ),
          )}
        </div>
        <div className={styles.formationCardsRow}>
          {cards.slice(3, 5).map((cardId, idx) =>
            cardId !== undefined && cardId !== null ? (
              <img
                key={idx + 3}
                className={styles.formationCardImg}
                src={`/public/cards/${cardId}.png`}
                alt={`Card ${cardId}`}
              />
            ) : (
              <div key={idx + 3} className={styles.formationCardSlot}>
                +
              </div>
            ),
          )}
        </div>
      </div>
      <div className={styles.deckPowerLabel}>Deck Power</div>
      <div className={styles.deckPowerValue}>{currentPrizePool.user_deck_power ?? 0}</div>
    </div>
  )
}

export default TournamentPageCardsFormation

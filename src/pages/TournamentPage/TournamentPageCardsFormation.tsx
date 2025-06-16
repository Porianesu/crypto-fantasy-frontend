import React from 'react'
import styles from './TournamentPageCardsFormation.module.css'

interface TournamentPageCardsFormationProps {
  user_card_formation?: number[]
  user_deck_power?: number
}

const TournamentPageCardsFormation: React.FC<TournamentPageCardsFormationProps> = ({
  user_card_formation,
  user_deck_power,
}) => {
  return (
    <div className={styles.formationContainer}>
      <div className={styles.formationTitle}>Your Formation</div>
      <div className={styles.formationCards}>
        {(user_card_formation || Array(5).fill(undefined)).map((cardId, idx) =>
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
      <div className={styles.deckPowerLabel}>Deck Power</div>
      <div className={styles.deckPowerValue}>{user_deck_power ?? 0}</div>
    </div>
  )
}

export default TournamentPageCardsFormation

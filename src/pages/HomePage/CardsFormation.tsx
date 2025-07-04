import { observer } from 'mobx-react-lite'
import React, { type Dispatch, type SetStateAction } from 'react'
import styles from './CardsFormation.module.css'
import classNames from 'classnames'
import StaticCard from '@/components/StaticCard.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

interface ICardsFormationProps {
  setCardsFormationModalVisible: Dispatch<SetStateAction<boolean>>
}
const CardsFormation: React.FC<ICardsFormationProps> = ({ setCardsFormationModalVisible }) => {
  const {
    appStore: { cardsFormation },
  } = useMobxStore()

  const handleCardClick = () => {
    setCardsFormationModalVisible(true)
  }

  return (
    <div className={styles.formationContainer}>
      <div className={styles.formationSquare}>
        {[0, 1, 2, 3, 4].map((idx) => {
          const card = cardsFormation[idx]
          return card ? (
            <StaticCard
              key={idx}
              className={styles.formationCard}
              width={142}
              card={card}
              onClick={handleCardClick}
            ></StaticCard>
          ) : (
            <div
              key={idx}
              className={classNames(styles.formationCard, styles.emptyCard, 'button')}
              onClick={handleCardClick}
            ></div>
          )
        })}
        <div
          className={classNames(styles.formationSquareBackground, {
            [styles.formationSquareBackgroundSpin]: cardsFormation.length >= 5,
          })}
        ></div>
      </div>
    </div>
  )
}
export default observer(CardsFormation)

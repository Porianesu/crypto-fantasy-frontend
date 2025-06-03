import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './CardFormation.module.css'
import classNames from 'classnames'
import StaticCard from '@/components/StaticCard.tsx'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

const CardFormation: React.FC = () => {
  const {
    appStore: { cardsFormation },
    modalStore: { changeCardsBagModalData },
  } = useMobxStore()

  const handleCardClick = () => {
    changeCardsBagModalData({
      visible: true,
      type: ICardsBagModalType.EDIT,
    })
  }

  return (
    <div className={styles.formationContainer}>
      <div className={styles.formationSquare}>
        {[0, 1, 2, 3, 4].map((idx) => {
          const card = cardsFormation[idx]
          return (
            <div
              key={idx}
              className={classNames(styles.formationCard, {
                [styles.emptyCard]: !card,
              })}
              onClick={handleCardClick}
            >
              {card ? (
                <StaticCard width={198} card={card}></StaticCard>
              ) : (
                <span className={styles.addIcon}>+</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default observer(CardFormation)

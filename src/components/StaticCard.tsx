import React from 'react'
import type { ICardData } from '@/components/Card.tsx'
import styles from './StaticCard.module.css'
import classNames from 'classnames'

interface IStaticCardProps {
  card: ICardData
}

const StaticCard: React.FC<IStaticCardProps> = ({ card }) => {
  return (
    <div className={classNames(styles.cardContainer, styles[`rarity_${card.rarity}`])}>
      <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
    </div>
  )
}
export default StaticCard

import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import styles from './Melt.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import type { ICardData } from '@/components/Card.tsx'

const Melt: React.FC = () => {
  const {
    appStore: { cardsBag },
  } = useMobxStore()
  const [meltTargetCard, setMeltTargetCard] = useState<ICardData>()

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.selectContainer}></div>
      <div className={styles.meltContainer}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
export default observer(Melt)

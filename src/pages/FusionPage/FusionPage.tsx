import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import styles from './FusionPage.module.css'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import Craft from '@/pages/FusionPage/Craft.tsx'
import Melt from '@/pages/FusionPage/Melt.tsx'

enum FUSION_PAGE_TYPE {
  CRAFT = 'craft',
  MELT = 'melt',
}

const PageType = [
  {
    key: FUSION_PAGE_TYPE.CRAFT,
    label: 'Craft',
  },
  {
    key: FUSION_PAGE_TYPE.MELT,
    label: 'Melt',
  },
]

const FusionPage: React.FC = () => {
  const navigate = useNavigate()
  const [pageType, setPageType] = useState<FUSION_PAGE_TYPE>(FUSION_PAGE_TYPE.CRAFT)

  const handleBack = () => {
    navigate(getHomePath())
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button className={classNames(styles.backButton, 'button')} onClick={handleBack}></button>
        <div className={styles.typeButtons}>
          {PageType.map((item) => (
            <button
              key={item.key}
              onClick={() => setPageType(item.key)}
              className={classNames(
                styles.typeButton,
                {
                  [styles.typeButtonActive]: pageType === item.key,
                },
                'button text-shadow',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        <button className={classNames(styles.questionButton, 'button')}></button>
      </div>
      {pageType === FUSION_PAGE_TYPE.CRAFT ? <Craft></Craft> : <Melt></Melt>}
    </div>
  )
}
export default observer(FusionPage)

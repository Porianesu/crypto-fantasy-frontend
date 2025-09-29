import { observer } from 'mobx-react-lite'
import React, { useMemo, useRef, useState } from 'react'
import styles from './BagModalCardsContent.module.css'
import type { ICardDataWithCount } from '@/stores/app-store.ts'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import { getGalleryPath } from '@/navigation/routes.tsx'
import { useNavigate } from 'react-router-dom'
import RaritySelect, { type RARITY_SELECT_VALUE } from '@/components/RaritySelect.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import classNames from 'classnames'

const BagModalCardsContent: React.FC = () => {
  const {
    appStore: { formattedCardsBag, cardsFormation, changeCardsFormation },
    modalStore: { changeBagModalData, bagModalData },
  } = useMobxStore()
  const navigate = useNavigate()
  const cardsListRef = useRef<HTMLDivElement>(null)
  const cardsGridRef = useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState<RARITY_SELECT_VALUE>('all')
  const [selectedIds, setSelectedIds] = useState<number[]>(cardsFormation.map((card) => card.id))
  const isEdit = useMemo(() => bagModalData.type === ICardsBagModalType.EDIT, [bagModalData.type])

  const handleSelect = (id: number) => {
    if (!isEdit) return
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id])
    }
  }
  // 卡牌过滤（暂时只做空和全部展示）
  const filteredCards = useMemo(
    () =>
      formattedCardsBag?.filter((card) => {
        const matchName = card.name?.toLowerCase().includes(search.toLowerCase())
        const matchRarity = rarity === 'all' || card.rarity === rarity
        return matchName && matchRarity
      }) || [],
    [formattedCardsBag, rarity, search],
  )

  const handleCardClick = (card: ICardDataWithCount, selected?: boolean) => {
    if (isEdit) {
      if (!selected && selectedIds.length >= 5) {
        return
      }
      handleSelect(card.id)
    } else {
      changeBagModalData({ visible: false, type: ICardsBagModalType.VIEW })
      navigate(getGalleryPath(card.id))
    }
  }

  const handleConfirmButtonClick = () => {
    if (isEdit) {
      // 确认编辑，更新卡牌阵容
      const selectedCards = formattedCardsBag.filter((card) => selectedIds.includes(card.id))
      changeCardsFormation(selectedCards)
    }
    changeBagModalData({ visible: false, type: ICardsBagModalType.VIEW })
  }

  return (
    <div className={styles.mainContent}>
      <div className={styles.cardsHeader}>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="search for cards"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <RaritySelect value={rarity} onChange={setRarity}></RaritySelect>
      </div>
      <div className={styles.cardsList} ref={cardsListRef}>
        {filteredCards.length === 0 ? (
          <div className={styles.emptyTip}>no cards</div>
        ) : (
          <div className={styles.cardsGrid} ref={cardsGridRef}>
            {filteredCards.map((card) => {
              const selected = selectedIds.includes(card.id)
              return (
                <div
                  key={card.id}
                  className={classNames(styles.cardItem, isEdit && selected && styles.selectedCard)}
                  onClick={() => handleCardClick(card, selected)}
                >
                  {isEdit && (
                    <button
                      className={classNames(styles.selectBtn, {
                        [styles.selectedBtn]: selected,
                      })}
                      type="button"
                    >
                      {selected ? '✓' : ''}
                    </button>
                  )}
                  <StaticCard width={258} card={card}></StaticCard>
                  <div className={styles.cardCount}>
                    <span>x</span>
                    {card.count}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      {isEdit && formattedCardsBag.length && (
        <div className={styles.footerBar}>
          <button className={styles.confirmBtn} onClick={handleConfirmButtonClick}>
            <div className={styles.confirmBtnText}>Confirm</div>
          </button>
        </div>
      )}
    </div>
  )
}
export default observer(BagModalCardsContent)

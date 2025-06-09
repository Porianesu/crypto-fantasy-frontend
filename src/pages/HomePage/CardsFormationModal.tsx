import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Close,
  Content,
  Description,
  Dialog,
  DialogOverlay,
  Portal,
  Title,
} from '@radix-ui/react-dialog'
import classNames from 'classnames'
import styles from './CardsFormationModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { RARITY_OPTIONS } from '@/utils/constant.ts'
import { CARD_RARITY } from '@/components/Card.tsx'
import type { IBagCardData } from '@/pages/HomePage/CardsBagModal.tsx'
import StaticCard from '@/components/StaticCard.tsx'

const CardsFormationModal: React.FC = () => {
  const {
    appStore: { cardsBag, cardsFormation, changeCardsFormation },
    modalStore: { cardsFormationModalVisible, changeCardsFormationModalVisible },
  } = useMobxStore()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState<CARD_RARITY | 'all'>('all')
  const selectedIds = useMemo<Array<number>>(
    () => cardsFormation.map((card) => card.id),
    [cardsFormation],
  )
  const formattedCardsBag = useMemo<Array<IBagCardData>>(() => {
    const cardCountMap: Record<string, IBagCardData> = {}
    cardsBag?.forEach((card) => {
      if (cardCountMap[card.id]) {
        cardCountMap[card.id].count += 1
      } else {
        cardCountMap[card.id] = { ...card, count: 1 }
      }
    })
    return Object.values(cardCountMap)
  }, [cardsBag])
  const [cardsFormationIdsBeforeModalOpen, setCardsFormationIdsBeforeModalOpen] =
    useState(selectedIds)
  const filteredCards = useMemo(
    () =>
      formattedCardsBag
        .filter((card) => {
          const matchName = card.name?.toLowerCase().includes(search.toLowerCase())
          const matchRarity = rarity === 'all' || card.rarity === rarity
          return matchName && matchRarity
        })
        .sort((a, b) => {
          const indexA = cardsFormationIdsBeforeModalOpen.indexOf(a.id)
          const indexB = cardsFormationIdsBeforeModalOpen.indexOf(b.id)
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
          }
          if (indexA !== -1) return -1
          if (indexB !== -1) return 1
          return a.id - b.id
        }),
    [formattedCardsBag, rarity, search, cardsFormationIdsBeforeModalOpen],
  )

  useEffect(() => {
    if (cardsFormationModalVisible) {
      setCardsFormationIdsBeforeModalOpen(selectedIds)
    }
  }, [cardsFormationModalVisible])

  const handleCardClick = (card: IBagCardData) => {
    const findIndex = cardsFormation.findIndex((c) => c.id === card.id)
    if (findIndex !== -1) {
      // If the card is already selected, remove it from the formation
      const newCardsFormation = cardsFormation.filter((c) => c.id !== card.id)
      changeCardsFormation(newCardsFormation)
    } else {
      if (cardsFormation.length >= 5) return
      // If the card is not selected, add it to the formation
      const newCardsFormation = [...cardsFormation, card]
      changeCardsFormation(newCardsFormation)
    }
  }

  return (
    <Dialog open={cardsFormationModalVisible} onOpenChange={changeCardsFormationModalVisible}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Description></Description>
          <Content className={styles.modalContent} ref={contentRef}>
            <Title></Title>
            <Close asChild>
              <div className={styles.closeBtn} aria-label="Close"></div>
            </Close>
            <div className={styles.headerPart}>
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
              <div className={styles.raritySelectWrapper}>
                <select
                  className={styles.raritySelect}
                  value={rarity}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === 'all') {
                      setRarity('all')
                    } else {
                      setRarity(Number(value))
                    }
                  }}
                >
                  {RARITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <div className={styles.raritySelectIcon}></div>
              </div>
            </div>
            <div className={styles.cardsList}>
              {filteredCards.length === 0 ? (
                <div className={styles.emptyTip}>no cards</div>
              ) : (
                <div className={styles.cardsGrid}>
                  {filteredCards.map((card) => {
                    const currentCardFormationIndex = selectedIds.findIndex((id) => id === card.id)
                    const selected = currentCardFormationIndex !== -1
                    return (
                      <div
                        key={card.id}
                        className={classNames(styles.cardItem, selected && styles.selectedCard)}
                        onClick={() => handleCardClick(card)}
                      >
                        {
                          <button
                            className={classNames(styles.selectBtn, {
                              [styles.selectedBtn]: selected,
                            })}
                            type="button"
                          >
                            {selected ? currentCardFormationIndex + 1 : ''}
                          </button>
                        }
                        <StaticCard width={202} card={card}></StaticCard>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(CardsFormationModal)

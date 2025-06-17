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
import styles from './TournamentPageCardsFormationModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY } from '@/components/Card.tsx'
import type { IBagCardData } from '@/pages/HomePage/CardsBagModal.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import RaritySelect from '@/components/RaritySelect.tsx'

interface ITournamentPageCardsFormationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cardsFormation: Array<number>
  changeCardsFormation: (cardsFormation: Array<number>) => void
}
const TournamentPageCardsFormationModal: React.FC<ITournamentPageCardsFormationModalProps> = ({
  open,
  onOpenChange,
  cardsFormation: selectedIds,
  changeCardsFormation,
}) => {
  const {
    appStore: { cardsBag },
  } = useMobxStore()
  const contentRef = React.useRef<HTMLDivElement>(null)
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState<CARD_RARITY | 'all'>('all')
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
    if (open) {
      setCardsFormationIdsBeforeModalOpen(selectedIds)
    }
  }, [open])

  const handleCardClick = (card: IBagCardData) => {
    const findIndex = selectedIds.findIndex((id) => id === card.id)
    if (findIndex !== -1) {
      // If the card is already selected, remove it from the formation
      const newCardsFormation = selectedIds.filter((id) => id !== card.id)
      changeCardsFormation(newCardsFormation)
    } else {
      if (selectedIds.length >= 5) return
      // If the card is not selected, add it to the formation
      const newCardsFormation = [...selectedIds, card.id]
      changeCardsFormation(newCardsFormation)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
              <RaritySelect value={rarity} onChange={setRarity}></RaritySelect>
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
export default observer(TournamentPageCardsFormationModal)

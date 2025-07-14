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
import styles from './CardSelectModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import RaritySelect from '@/components/RaritySelect.tsx'

interface ICardSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCardIds?: Array<number>
  selectedCardPositions?: Array<number>
  handleCardSelect: (card: IdModeCardData | PositionModeCardData) => void
  mode?: 'id' | 'positon'
}
export interface IdModeCardData extends ICardData {
  count: number
}

export interface PositionModeCardData extends ICardData {
  bagPosition: number
}

const CardSelectModal: React.FC<ICardSelectModalProps> = ({
  open,
  onOpenChange,
  selectedCardIds,
  selectedCardPositions,
  handleCardSelect,
  mode = 'id',
}) => {
  console.log('selectedCardPositions', selectedCardPositions)
  const {
    appStore: { cardsBag },
  } = useMobxStore()
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState<CARD_RARITY | 'all'>('all')
  const isPositionMode = useMemo(() => mode === 'positon', [mode])
  const formattedCardsBag = useMemo<Array<IdModeCardData | PositionModeCardData>>(() => {
    if (isPositionMode)
      return cardsBag.map((item, index) => ({
        ...item,
        bagPosition: index,
      }))
    const cardCountMap: Record<string, IdModeCardData> = {}
    cardsBag?.forEach((card) => {
      if (cardCountMap[card.id]) {
        cardCountMap[card.id].count += 1
      } else {
        cardCountMap[card.id] = { ...card, count: 1 }
      }
    })
    return Object.values(cardCountMap)
  }, [cardsBag, isPositionMode])
  const [selectedCardIdsBeforeModalOpen, setSelectedCardIdsBeforeModalOpen] =
    useState(selectedCardIds)
  const [selectedCardPositionsBeforeModalOpen, setSelectedCardPositionsBeforeModalOpen] =
    useState(selectedCardPositions)
  const filteredCards = useMemo(
    () =>
      formattedCardsBag
        .filter((card) => {
          const matchName = card.name?.toLowerCase().includes(search.toLowerCase())
          const matchRarity = rarity === 'all' || card.rarity === rarity
          return matchName && matchRarity
        })
        .sort((a, b) => {
          const indexA =
            (isPositionMode
              ? selectedCardPositionsBeforeModalOpen?.indexOf(
                  (a as PositionModeCardData).bagPosition,
                )
              : selectedCardIdsBeforeModalOpen?.indexOf(a.id)) || 0
          const indexB =
            (isPositionMode
              ? selectedCardPositionsBeforeModalOpen?.indexOf(
                  (b as PositionModeCardData).bagPosition,
                )
              : selectedCardIdsBeforeModalOpen?.indexOf(b.id)) || 0
          if (indexA !== -1 && indexB !== -1) {
            return indexA - indexB
          }
          if (indexA !== -1) return -1
          if (indexB !== -1) return 1
          return a.id - b.id
        }),
    [
      formattedCardsBag,
      isPositionMode,
      rarity,
      search,
      selectedCardIdsBeforeModalOpen,
      selectedCardPositionsBeforeModalOpen,
    ],
  )

  useEffect(() => {
    if (open) {
      setSelectedCardIdsBeforeModalOpen(selectedCardIds)
      setSelectedCardPositionsBeforeModalOpen(selectedCardPositions)
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Description></Description>
          <Content className={styles.modalContent}>
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
                    const selectedIndex = isPositionMode
                      ? selectedCardPositions?.indexOf((card as PositionModeCardData).bagPosition)
                      : selectedCardIds?.findIndex((id) => id === card.id)
                    const currentCardFormationIndex =
                      selectedIndex === undefined ? -1 : selectedIndex
                    const selected = currentCardFormationIndex !== -1
                    return (
                      <div
                        key={card.id}
                        className={classNames(styles.cardItem, selected && styles.selectedCard)}
                        onClick={() => handleCardSelect(card)}
                      >
                        {
                          <button
                            className={classNames(styles.selectBtn, {
                              [styles.selectedBtn]: selected,
                            })}
                            type="button"
                          >
                            {selected ? (isPositionMode ? '√' : currentCardFormationIndex + 1) : ''}
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
export default observer(CardSelectModal)

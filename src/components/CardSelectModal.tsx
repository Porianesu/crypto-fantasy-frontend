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
import { CARD_RARITY } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import RaritySelect from '@/components/RaritySelect.tsx'
import type { ICardDataInBag, ICardDataWithCount } from '@/stores/app-store.ts'

interface ICardSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCardIds?: Array<number>
  selectedCardPositions?: Array<number>
  handleCardSelect: (card: ICardDataInBag | ICardDataWithCount) => void
  mode?: 'id' | 'positon'
}

const CardSelectModal: React.FC<ICardSelectModalProps> = ({
  open,
  onOpenChange,
  selectedCardIds,
  selectedCardPositions,
  handleCardSelect,
  mode = 'id',
}) => {
  const {
    appStore: { cardsBag, formattedCardsBag: cardsBagWithCount },
  } = useMobxStore()
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState<CARD_RARITY | 'all'>('all')
  const isPositionMode = useMemo(() => mode === 'positon', [mode])
  const formattedCardsBag = useMemo<Array<ICardDataInBag | ICardDataWithCount>>(() => {
    if (isPositionMode) {
      return cardsBag
    } else {
      return cardsBagWithCount
    }
  }, [cardsBag, cardsBagWithCount, isPositionMode])
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
              ? selectedCardPositionsBeforeModalOpen?.indexOf((a as ICardDataInBag).bagPosition)
              : selectedCardIdsBeforeModalOpen?.indexOf(a.id)) || 0
          const indexB =
            (isPositionMode
              ? selectedCardPositionsBeforeModalOpen?.indexOf((b as ICardDataInBag).bagPosition)
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
                  {filteredCards.map((card, index) => {
                    const selectedIndex = isPositionMode
                      ? selectedCardPositions?.indexOf((card as ICardDataInBag).bagPosition)
                      : selectedCardIds?.findIndex((id) => id === card.id)
                    const currentCardFormationIndex =
                      selectedIndex === undefined ? -1 : selectedIndex
                    const selected = currentCardFormationIndex !== -1
                    const key = isPositionMode
                      ? `${card.id}-${(card as ICardDataInBag).bagPosition}-${index}`
                      : `${card.id}-${index}`
                    return (
                      <div
                        key={key}
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
export default observer(CardSelectModal)

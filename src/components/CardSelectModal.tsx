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
  selectedUserCardIds?: Array<number>
  handleCardSelect: (card: ICardDataInBag | ICardDataWithCount) => void
  mode?: 'cardId' | 'userCardId'
}

const CardSelectModal: React.FC<ICardSelectModalProps> = ({
  open,
  onOpenChange,
  selectedCardIds,
  selectedUserCardIds,
  handleCardSelect,
  mode = 'cardId',
}) => {
  const {
    appStore: { cardsBag, formattedCardsBag: cardsBagWithCount },
  } = useMobxStore()
  const [search, setSearch] = useState('')
  const [rarity, setRarity] = useState<CARD_RARITY | 'all'>('all')
  const isUserCardIdMode = useMemo(() => mode === 'userCardId', [mode])
  const formattedCardsBag = useMemo<Array<ICardDataInBag | ICardDataWithCount>>(() => {
    if (isUserCardIdMode) {
      return cardsBag
    } else {
      return cardsBagWithCount
    }
  }, [cardsBag, cardsBagWithCount, isUserCardIdMode])
  const [selectedCardIdsBeforeModalOpen, setSelectedCardIdsBeforeModalOpen] =
    useState(selectedCardIds)
  const [selectedUserCardIdsBeforeModalOpen, setSelectedCardPositionsBeforeModalOpen] =
    useState(selectedUserCardIds)
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
            (isUserCardIdMode
              ? selectedUserCardIdsBeforeModalOpen?.indexOf((a as ICardDataInBag).userCardId)
              : selectedCardIdsBeforeModalOpen?.indexOf(a.id)) || 0
          const indexB =
            (isUserCardIdMode
              ? selectedUserCardIdsBeforeModalOpen?.indexOf((b as ICardDataInBag).userCardId)
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
      isUserCardIdMode,
      rarity,
      search,
      selectedCardIdsBeforeModalOpen,
      selectedUserCardIdsBeforeModalOpen,
    ],
  )

  useEffect(() => {
    if (open) {
      setSelectedCardIdsBeforeModalOpen(selectedCardIds)
      setSelectedCardPositionsBeforeModalOpen(selectedUserCardIds)
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
                    const selectedIndex = isUserCardIdMode
                      ? selectedUserCardIds?.indexOf((card as ICardDataInBag).userCardId)
                      : selectedCardIds?.findIndex((id) => id === card.id)
                    const currentCardFormationIndex =
                      selectedIndex === undefined ? -1 : selectedIndex
                    const selected = currentCardFormationIndex !== -1
                    const key = isUserCardIdMode
                      ? `${card.id}-${(card as ICardDataInBag).userCardId}-${index}`
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

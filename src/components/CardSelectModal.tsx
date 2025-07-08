import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import type { IBagCardData } from '@/pages/HomePage/CardsBagModal.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import RaritySelect from '@/components/RaritySelect.tsx'
import { gsap } from 'gsap'
import { BigNumber } from 'bignumber.js'
import { useGSAP } from '@gsap/react'

interface ICardSelectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCards: Array<number>
  handleCardSelect: (card: ICardData) => void
}

const DEFAULT_DESIGN_GAP_X = 66

interface ICardsListProps {
  filteredCards: Array<IBagCardData>
  selectedIds: Array<number>
  handleCardSelect: (card: ICardData) => void
}
const CardsList: React.FC<ICardsListProps> = observer(
  ({ filteredCards, selectedIds, handleCardSelect }) => {
    const {
      systemStore: { fontSizeScaleRate },
    } = useMobxStore()
    const cardsListRef = useRef<HTMLDivElement>(null)
    const [cardWidth, setCardWidth] = useState(202)

    useGSAP(
      () => {
        if (!open) return
        const containerWidth = gsap.getProperty(cardsListRef.current, 'width')
        const cardWidth = new BigNumber(containerWidth)
          .minus(new BigNumber(DEFAULT_DESIGN_GAP_X).times(fontSizeScaleRate))
          .dividedBy(3)
          .decimalPlaces(0)
          .toNumber()
        setCardWidth(cardWidth)
      },
      {
        scope: cardsListRef,
        dependencies: [open],
      },
    )

    return (
      <div className={styles.cardsList} ref={cardsListRef}>
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
                  <StaticCard width={cardWidth} card={card}></StaticCard>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  },
)

const CardSelectModal: React.FC<ICardSelectModalProps> = ({
  open,
  onOpenChange,
  selectedCards: selectedIds,
  handleCardSelect,
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
            <CardsList
              filteredCards={filteredCards}
              selectedIds={selectedIds}
              handleCardSelect={handleCardSelect}
            ></CardsList>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(CardSelectModal)

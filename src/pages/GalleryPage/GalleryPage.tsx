import { observer } from 'mobx-react-lite'
import React, { useState, useMemo, useEffect, useRef } from 'react'
import styles from './GalleryPage.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import { useQuery } from '@tanstack/react-query'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import classNames from 'classnames'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import ViewDetailModal from '@/pages/GalleryPage/ViewDetailModal.tsx'

interface FormattedCardData extends ICardData {
  processed: boolean
}

const GalleryPage: React.FC = () => {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const {
    appStore: { preloadQueue, cardsBag },
    modalStore: { changeViewDetailModalData },
  } = useMobxStore()
  const [selectedCard, setSelectedCard] = useState<ICardData>()
  const [searchText, setSearchText] = useState('')
  const [rarityFilter, setRarityFilter] = useState<CARD_RARITY | ''>('')
  const [cardWidth, setCardWidth] = useState(300)
  const pageBodyRef = useRef<HTMLDivElement>(null)
  const cardsPartRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!cardsPartRef.current) return
      const width = gsap.getProperty(cardsPartRef.current, 'width')
      if (!width) return
      const cardWidth = Math.floor((Number(width) - 68 - 68 - 8 - 64 * 2) / 3)
      setCardWidth(cardWidth)
    },
    {
      dependencies: [],
      scope: cardsPartRef,
    },
  )

  const fetchCardDatabase = () => {
    return new Promise<Array<FormattedCardData>>((resolve, reject) => {
      if (!preloadQueue) reject(new Error('No preload queue'))
      const cardDatabase = preloadQueue!.getResult('cardsData') as Array<ICardData>
      const formattedCards = cardDatabase.map((card) => {
        return {
          ...card,
          processed: cardsBag.some((myCard) => myCard.id === card.id),
        }
      })
      setTimeout(() => {
        resolve(formattedCards)
      }, 500)
    })
  }
  const { data: cardData, isLoading } = useQuery({
    queryKey: ['cardDatabase'],
    queryFn: fetchCardDatabase,
  })

  const filteredCards = useMemo(() => {
    if (!cardData) return []
    return cardData
      .filter((card) => {
        const matchesSearch = card.name.toLowerCase().includes(searchText.toLowerCase())
        const matchesRarity = rarityFilter ? card.rarity === rarityFilter : true
        return matchesSearch && matchesRarity
      })
      .sort((a, b) => {
        if (a.processed && !b.processed) return -1
        if (!a.processed && b.processed) return 1
        return a.id - b.id
      })
  }, [cardData, searchText, rarityFilter])

  useEffect(() => {
    if (filteredCards.length && !selectedCard) {
      if (cardId) {
        const initialCard = filteredCards.find((card) => card.id === Number(cardId))
        if (initialCard) {
          setSelectedCard(initialCard)
        }
      } else {
        setSelectedCard(filteredCards[0])
      }
    }
  }, [filteredCards.length, cardId])

  const handleBackButtonClick = () => {
    navigate(getHomePath())
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.backButton} onClick={handleBackButtonClick}></div>
        <span className={styles.headerTitle}>Chainspirit Gallery</span>
        <div className={styles.searchBox}>
          <div className={styles.searchIcon}></div>
          <input
            className={styles.searchInput}
            placeholder="search for cards"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      <div className={styles.pageBody} ref={pageBodyRef}>
        <div className={styles.toolContainer}>
          <div className={styles.season}>Season 1</div>
          {[
            { label: 'All', value: '' },
            {
              label: 'Legendary',
              value: CARD_RARITY.LEGENDARY,
            },
            {
              label: 'Epic',
              value: CARD_RARITY.EPIC,
            },
            {
              label: 'Rare',
              value: CARD_RARITY.RARE,
            },
            {
              label: 'Normal',
              value: CARD_RARITY.NORMAL,
            },
          ].map((select) => {
            const selected = rarityFilter === select.value
            return (
              <div
                className={classNames(styles.raritySelect, { [styles.raritySelected]: selected })}
                onClick={() => setRarityFilter(select.value as CARD_RARITY)}
                key={select.value}
              >
                {select.label}
              </div>
            )
          })}
        </div>
        <div className={styles.cardsPart} ref={cardsPartRef}>
          {isLoading ? (
            <div className={styles.loadingWrapper}>Loading...</div>
          ) : (
            <div className={styles.cardListContainer}>
              {filteredCards.map((card) => (
                <StaticCard
                  className={card.processed ? undefined : styles.cardBlackWhite}
                  width={cardWidth}
                  card={card}
                  key={card.id}
                  onClick={() => setSelectedCard(card)}
                ></StaticCard>
              ))}
            </div>
          )}
        </div>
        <div className={styles.detailPartWrapper}>
          <div className={styles.detailTitle}>Card information</div>
          {selectedCard && (
            <>
              <img
                className={styles.detailImagePart}
                alt={'selected-card-img'}
                src={selectedCard.imageUrl}
              />
              <div className={styles.detailName}>{selectedCard.name}</div>
              <div className={styles.detailInfoPart}>
                <div>
                  <div>Faction:</div>
                  <div>{selectedCard.faction}</div>
                </div>
                <div>
                  <div>Tag:</div>
                  <div>{selectedCard.tag}</div>
                </div>
                <div>
                  <div>Quotes:</div>
                  <div>{selectedCard.quote}</div>
                </div>
              </div>
              <div className={styles.scorePart}>
                <div>
                  <div>30D PNL:</div>
                  <div>{selectedCard['30_pnl']}</div>
                </div>
                <div>
                  <div>30D WinRate:</div>
                  <div>{selectedCard['30_win_rate']}</div>
                </div>
                <div>
                  <div>Avg Duration:</div>
                  <div>{selectedCard.avg_duration}</div>
                </div>
              </div>
              <div
                className={styles.viewDetailButton}
                onClick={() => {
                  changeViewDetailModalData(selectedCard)
                }}
              >
                <div className={styles.viewDetailText}>View Details</div>
              </div>
            </>
          )}
        </div>
      </div>
      <ViewDetailModal></ViewDetailModal>
    </div>
  )
}

export default observer(GalleryPage)

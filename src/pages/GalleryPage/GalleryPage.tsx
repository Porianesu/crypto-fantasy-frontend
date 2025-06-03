import { observer } from 'mobx-react-lite'
import React, { useState, useMemo, useEffect } from 'react'
import styles from './GalleryPage.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import { getHomePath } from '@/navigation/routes.tsx'
import { useQuery } from '@tanstack/react-query'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'

const GalleryPage: React.FC = () => {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const {
    appStore: { preloadQueue },
  } = useMobxStore()
  const [selectedCard, setSelectedCard] = useState<ICardData>()
  const [searchText, setSearchText] = useState('')
  const [rarityFilter, setRarityFilter] = useState<CARD_RARITY | ''>('')

  const fetchCardDatabase = () => {
    return new Promise<Array<ICardData>>((resolve, reject) => {
      if (!preloadQueue) reject(new Error('No preload queue'))
      const cardDatabase = preloadQueue!.getResult('cardsData') as Array<ICardData>
      setTimeout(() => {
        resolve(cardDatabase)
      }, 500)
    })
  }
  const { data: cardData, isLoading } = useQuery({
    queryKey: ['cardDatabase'],
    queryFn: fetchCardDatabase,
  })

  const filteredCards = useMemo(() => {
    if (!cardData) return []
    return cardData.filter((card) => {
      const matchesSearch = card.name.toLowerCase().includes(searchText.toLowerCase())
      const matchesRarity = rarityFilter ? card.rarity === rarityFilter : true
      return matchesSearch && matchesRarity
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
        <button className={styles.backButton} onClick={handleBackButtonClick}>
          <ArrowLeftIcon className={styles.backIcon} />
        </button>
        <span className={styles.headerTitle}>Chainspirit Gallery</span>
      </div>
      <div className={styles.pageBody}>
        <div className={styles.cardsPart}>
          <div className={styles.toolContainer}>
            <div className={styles.searchBoxWrapper}>
              <span className={styles.searchIcon}>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </span>
              <input
                className={styles.searchInput}
                placeholder="search for cards"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
            <select
              className={styles.raritySelect}
              value={rarityFilter}
              onChange={(e) => {
                const value = e.target.value
                setRarityFilter(value === '' ? value : Number(value))
              }}
            >
              <option value="">All Rarity</option>
              <option value={CARD_RARITY.NORMAL}>Normal</option>
              <option value={CARD_RARITY.RARE}>Rare</option>
              <option value={CARD_RARITY.EPIC}>Epic</option>
              <option value={CARD_RARITY.LEGENDARY}>Legendary</option>
            </select>
          </div>
          <div className={styles.cardListWrapper}>
            {isLoading ? (
              <div className={styles.loadingWrapper}>Loading...</div>
            ) : (
              <div className={styles.cardListContainer}>
                {filteredCards.map((card) => (
                  <div
                    key={card.id}
                    className={styles.cardItem}
                    onClick={() => setSelectedCard(card)}
                  >
                    <StaticCard width={300} card={card}></StaticCard>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.detailPartWrapper}>
          {selectedCard && (
            <>
              <div className={styles.detailImagePart}>
                <StaticCard width={300} card={selectedCard}></StaticCard>
              </div>
              <div className={styles.detailInfoPart}>
                <div className={styles.detailName}>{selectedCard.name}</div>
                <div className={styles.detailRarity}>
                  Rarity: {['Normal', 'Rare', 'Epic', 'Legendary'][selectedCard.rarity]}
                </div>
                <div className={styles.detailDesc}>{selectedCard.description}</div>
                <div className={styles.detailScore}>Score: {selectedCard.score}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
export default observer(GalleryPage)

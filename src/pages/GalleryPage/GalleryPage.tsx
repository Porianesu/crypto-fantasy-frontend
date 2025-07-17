import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './GalleryPage.module.css'
import { type Location, useLocation, useNavigate, useParams } from 'react-router-dom'
import { type GalleryPathState } from '@/navigation/routes.tsx'
import { useQuery } from '@tanstack/react-query'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import classNames from 'classnames'
import ViewDetailModal from '@/pages/GalleryPage/ViewDetailModal.tsx'
import { getCardImageById, isCardsSameChain } from '@/utils/common.ts'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { BigNumber } from 'bignumber.js'
import { RARITY_OPTIONS } from '@/components/RaritySelect.tsx'
import { toast } from 'react-toastify'

dayjs.extend(duration)

interface ICardDataWithProcessed extends ICardData {
  processed: boolean
}

const UndetectedPlaceholderText = 'unknown'
const GalleryPage: React.FC = () => {
  const { cardId } = useParams()
  const navigate = useNavigate()
  const location: Location<GalleryPathState> = useLocation()
  const state = location.state
  const isSelectType = state?.type === 'select'
  const {
    preloadStore: { preloadQueue },
    appStore: { cardsBag, formattedCardsBag },
    modalStore: { changeViewDetailModalVisible, changeViewDetailModalData },
  } = useMobxStore()
  const [selectedCard, setSelectedCard] = useState<ICardDataWithProcessed>()
  const [searchText, setSearchText] = useState('')
  const [rarityFilter, setRarityFilter] = useState<CARD_RARITY | 'all'>('all')
  const pageBodyRef = useRef<HTMLDivElement>(null)
  const cardsPartRef = useRef<HTMLDivElement>(null)

  const fetchCardDatabase = () => {
    return new Promise<Array<ICardDataWithProcessed>>((resolve, reject) => {
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

  const CardsRarityFilter = useCallback(
    (card: ICardDataWithProcessed) => {
      const matchesSearch = card.name.toLowerCase().includes(searchText.toLowerCase())
      const matchesRarity = rarityFilter === 'all' ? true : card.rarity === rarityFilter
      return matchesSearch && matchesRarity
    },
    [rarityFilter, searchText],
  )

  const filteredCards = useMemo(() => {
    if (!cardData) return []
    if (isSelectType) {
      const filteredFormattedCardsBag = formattedCardsBag.filter((card) => card.count >= 2)
      return cardData
        .filter((card) =>
          filteredFormattedCardsBag.some(
            (myCard) => isCardsSameChain(myCard, card) && card.rarity === myCard.rarity + 1,
          ),
        )
        .filter(CardsRarityFilter)
    }
    return cardData.filter(CardsRarityFilter).sort((a, b) => {
      if (a.processed && !b.processed) return -1
      if (!a.processed && b.processed) return 1
      return a.id - b.id
    })
  }, [cardData, isSelectType, CardsRarityFilter, formattedCardsBag])

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
    navigate(-1)
  }

  const renderCardAvgDuration = () => {
    if (!selectedCard) return null
    if (!selectedCard.processed) {
      return UndetectedPlaceholderText
    }
    const d = dayjs.duration(selectedCard.average_duration * 1000) // Convert seconds to milliseconds
    const totalDays = d.asDays()
    if (totalDays >= 1) {
      return `${Math.floor(totalDays)} days`
    }
    const totalHours = d.asHours()
    if (totalHours >= 1) {
      return `${Math.floor(totalHours)} hours`
    }
    const totalMinutes = d.asMinutes()
    if (totalMinutes >= 1) {
      return `${Math.floor(totalMinutes)} minutes`
    } else {
      return '< 1 minute'
    }
  }

  const handleCardClick = (card: ICardDataWithProcessed) => {
    if (isSelectType) {
      if (card.rarity === CARD_RARITY.NORMAL) {
        return toast.warning('You cannot craft a common card.')
      }
      if (state?.from) {
        navigate(state.from, {
          state: { card },
        })
      }
    } else {
      setSelectedCard(card)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div className={styles.backButton} onClick={handleBackButtonClick}></div>
        <span className={styles.headerTitle}>
          {isSelectType ? 'Please select a card' : 'Chainspirit Gallery'}
        </span>
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
          {RARITY_OPTIONS.map((select) => {
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
          ) : filteredCards.length ? (
            <div
              className={classNames(styles.cardListContainer, {
                [styles.cardListContainerSelectType]: isSelectType,
                [styles.cardListContainerBrowseType]: !isSelectType,
              })}
            >
              {filteredCards.map((card) => (
                <StaticCard
                  undetected={isSelectType ? false : !card.processed}
                  width={258}
                  card={card}
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                ></StaticCard>
              ))}
            </div>
          ) : (
            <div className={styles.cardListEmptyContainer}>
              {isSelectType
                ? "You don't have any cards that can be fused. Hurry up and draw some"
                : null}
            </div>
          )}
        </div>
        {isSelectType ? null : (
          <div className={styles.detailPartWrapper}>
            <div className={styles.detailTitle}>Card information</div>
            {selectedCard && (
              <>
                <img
                  className={styles.detailImagePart}
                  alt={'selected-card-img'}
                  src={getCardImageById(selectedCard.id)}
                />
                <div className={styles.detailBottomPart}>
                  {!selectedCard.processed ? (
                    <div className={styles.detailUndetectedPart}>
                      You haven't collected this card yet.
                    </div>
                  ) : (
                    <>
                      <div
                        className={styles.detailName}
                      >{`${selectedCard.nickname} · ${selectedCard.name}`}</div>
                      <div className={styles.detailInfoPart}>
                        <div>
                          <div>Tag:</div>
                          <div>
                            {!selectedCard.processed ? UndetectedPlaceholderText : selectedCard.tag}
                          </div>
                        </div>
                        <div>
                          <div>Quotes:</div>
                          <div>
                            {!selectedCard.processed
                              ? UndetectedPlaceholderText
                              : selectedCard.quote}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  <div className={styles.scorePart}>
                    <div>
                      <div>30D PNL:</div>
                      <div>
                        {!selectedCard.processed
                          ? UndetectedPlaceholderText
                          : new BigNumber(selectedCard['30_pnl'])
                              .times(100)
                              .decimalPlaces(2)
                              .toString() + '%'}
                      </div>
                    </div>
                    <div>
                      <div>30D WinRate:</div>
                      <div>
                        {!selectedCard.processed
                          ? UndetectedPlaceholderText
                          : new BigNumber(selectedCard['30_winrate'])
                              .times(100)
                              .decimalPlaces(2)
                              .toString() + '%'}
                      </div>
                    </div>
                    <div>
                      <div>Avg Duration:</div>
                      <div>{renderCardAvgDuration()}</div>
                    </div>
                  </div>
                  {!selectedCard?.processed ? (
                    <div className={styles.viewDetailButtonDisabled}>
                      <div>Not collected</div>
                    </div>
                  ) : (
                    <div
                      className={styles.viewDetailButton}
                      onClick={() => {
                        changeViewDetailModalVisible(true)
                        changeViewDetailModalData(selectedCard)
                      }}
                    >
                      <div className={styles.viewDetailText}>View Details</div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
      <ViewDetailModal></ViewDetailModal>
    </div>
  )
}

export default observer(GalleryPage)

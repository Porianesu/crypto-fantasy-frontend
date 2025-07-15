import { observer } from 'mobx-react-lite'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import styles from './Craft.module.css'
import classNames from 'classnames'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import CountUp from 'react-countup'
import StaticCard from '@/components/StaticCard.tsx'
import { type Location, useLocation, useNavigate } from 'react-router-dom'
import { FUSION_PATH, type FusionPathState, getGalleryPath } from '@/navigation/routes.tsx'
import { toast } from 'react-toastify'
import { BigNumber } from 'bignumber.js'
import CardSelectModal, {
  type IdModeCardData,
  type PositionModeCardData,
} from '@/components/CardSelectModal.tsx'
import { isCardsSameChain } from '@/utils/common.ts'

const ArrowArray = new Array(4).fill(null)
const AdditiveCardArray = new Array(4).fill(null)
const CraftRule = [
  {
    targetRarity: CARD_RARITY.RARE,
    requiredCards: {
      rarity: CARD_RARITY.NORMAL,
      count: 2,
    },
    requiredFaithCoin: 51,
    baseSuccessRate: 0.5,
    maxSuccessRate: 0.7,
  },
  {
    targetRarity: CARD_RARITY.EPIC,
    requiredCards: {
      rarity: CARD_RARITY.RARE,
      count: 2,
    },
    requiredFaithCoin: 256,
    baseSuccessRate: 0.2,
    maxSuccessRate: 0.4,
  },
  {
    targetRarity: CARD_RARITY.LEGENDARY,
    requiredCards: {
      rarity: CARD_RARITY.EPIC,
      count: 2,
    },
    requiredFaithCoin: 2100,
    baseSuccessRate: 0.1,
    maxSuccessRate: 0.3,
  },
]
const REQUIRED_CARD_WIDTH = 178
const ADDITIVE_CARD_WIDTH = 128
const DEFAULT_REQUIRED_CARDS_COUNT = 2

function calculateAdditiveCardBonusRate(craftTargetCard: ICardData, additiveCard: ICardData) {
  let exponent = additiveCard.rarity - craftTargetCard.rarity
  if (!isCardsSameChain(additiveCard, craftTargetCard)) {
    exponent -= 1 // If the card is not in the same chain, reduce the exponent by 1
  }
  const baseSuccessRate = new BigNumber(0.1) // Base success rate for each additive card
  const base = new BigNumber(2)
  return baseSuccessRate.times(base.exponentiatedBy(exponent))
}

interface CardDataWithBagPosition {
  card: ICardData
  position: number
}

enum CARD_SELECT_TYPE {
  REQUIRED = 'required',
  ADDITIVE = 'additive',
}
const Craft: React.FC = () => {
  const {
    appStore: { userInfo, cardsBag, craftCard },
  } = useMobxStore()
  const navigate = useNavigate()
  const location: Location<FusionPathState> = useLocation()
  const [craftTargetCard, setCraftTargetCard] = useState(location.state?.card)
  const [requiredCards, setRequiredCards] = useState<Array<CardDataWithBagPosition>>([])
  const [additiveCards, setAdditiveCards] = useState<Array<CardDataWithBagPosition>>([])
  const cardSelectType = useRef<CARD_SELECT_TYPE>(CARD_SELECT_TYPE.REQUIRED)
  const selectedCardPositions = useMemo(() => {
    return requiredCards
      .map((card) => card.position)
      .concat(additiveCards.map((card) => card.position))
  }, [additiveCards, requiredCards])
  const [cardSelectModalOpen, setCardSelectModalOpen] = useState(false)
  const currentCraftRule = useMemo(
    () => CraftRule.find((item) => item.targetRarity === craftTargetCard?.rarity),
    [craftTargetCard?.rarity],
  )
  const successRate = useMemo(() => {
    if (!currentCraftRule || !craftTargetCard) return 0
    const baseSuccessRate = currentCraftRule.baseSuccessRate
    const maxSuccessRate = currentCraftRule.maxSuccessRate
    const additiveSuccessRate = additiveCards
      .reduce((previousValue, currentValue) => {
        return previousValue.plus(
          calculateAdditiveCardBonusRate(craftTargetCard, currentValue.card),
        )
      }, new BigNumber(0))
      .toNumber()
    return Math.min(maxSuccessRate, baseSuccessRate + additiveSuccessRate)
  }, [additiveCards, craftTargetCard, currentCraftRule])
  const userFaithAmountCheck = useMemo(() => {
    if (!userInfo?.faithAmount || !currentCraftRule?.requiredFaithCoin) return false
    return userInfo?.faithAmount >= currentCraftRule?.requiredFaithCoin
  }, [currentCraftRule?.requiredFaithCoin, userInfo?.faithAmount])

  const handleTargetCardClick = () => {
    navigate(getGalleryPath(undefined), { state: { type: 'select', from: FUSION_PATH } })
  }

  const handleCraftButtonClick = () => {
    if (!userInfo || !currentCraftRule || !craftTargetCard) return
    if (userInfo.faithAmount < currentCraftRule.requiredFaithCoin) {
      toast.warning('Insufficient faith amount to craft!')
    }
    if (requiredCards.length < currentCraftRule.requiredCards.count) {
      toast.warning('Required cards are not enough!')
    }
    craftCard(
      craftTargetCard,
      requiredCards,
      additiveCards,
      successRate,
      currentCraftRule.requiredFaithCoin,
    )
    setCraftTargetCard(undefined)
  }

  const handleRequiredCardClick = () => {
    setCardSelectModalOpen(true)
    cardSelectType.current = CARD_SELECT_TYPE.REQUIRED
  }

  const handleAdditiveCardClick = () => {
    setCardSelectModalOpen(true)
    cardSelectType.current = CARD_SELECT_TYPE.ADDITIVE
  }

  const handleCardSelect = (cardData: PositionModeCardData | IdModeCardData) => {
    const card = cardData as PositionModeCardData
    if (!craftTargetCard || !currentCraftRule) return
    if (requiredCards.some((item) => item.position === card.bagPosition)) {
      return toast.warning('You can not remove a required card')
    }
    if (cardSelectType.current === CARD_SELECT_TYPE.REQUIRED) {
      if (card.rarity + 1 !== currentCraftRule.requiredCards.rarity) {
        return toast.warning('Required cards must be the same rarity as required.')
      }
      if (!isCardsSameChain(craftTargetCard, card)) {
        return toast.warning('Required cards must be the same chain as the target card.')
      }
      if (selectedCardPositions.indexOf(card.bagPosition) !== -1) {
        return
      } else {
        if (requiredCards.length >= currentCraftRule.requiredCards.count) {
          return toast.warning('You have already selected the required number of cards.')
        }
        setRequiredCards((prevState) => prevState.concat([{ card, position: card.bagPosition }]))
      }
    } else {
      if (selectedCardPositions.indexOf(card.bagPosition) !== -1) {
        setAdditiveCards((prevState) =>
          prevState.filter((item) => item.position !== card.bagPosition),
        )
      } else {
        if (additiveCards.length >= 4) {
          return toast.warning('You can only add up to 4 additive cards.')
        }
        setAdditiveCards((prevState) => prevState.concat([{ card, position: card.bagPosition }]))
      }
    }
  }

  useEffect(() => {
    if (craftTargetCard && currentCraftRule) {
      // Auto select required cards based on the current craft rule
      const requiredCardsCount = currentCraftRule.requiredCards.count
      const requiredCardsRarity = currentCraftRule.requiredCards.rarity
      const availableCardsWithIndex = cardsBag
        .map((card, idx) => ({ card, position: idx }))
        .filter(
          ({ card }) =>
            card.rarity === requiredCardsRarity && isCardsSameChain(card, craftTargetCard),
        )
      const selectedRequiredCards = availableCardsWithIndex.slice(0, requiredCardsCount)
      setRequiredCards(selectedRequiredCards)
    } else {
      setRequiredCards([])
      setAdditiveCards([])
    }
  }, [craftTargetCard])

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.checklistContainer}>
        <div className={styles.title}>Checklist</div>
        <div className={styles.checklistTarget}>
          <div>Target</div>
          {craftTargetCard ? (
            <div
              className={classNames(
                styles.cardRarityExample,
                styles[`cardRarityExample${craftTargetCard.rarity}`],
              )}
            ></div>
          ) : (
            <div>???</div>
          )}
        </div>
        <div className={styles.requiredContainer}>
          <div>Required</div>
          <div>
            {currentCraftRule ? (
              <div className={styles.requiredCardContainer}>
                <div className={styles.requiredCardCount}>
                  {currentCraftRule.requiredCards.count}x
                </div>
                <div
                  className={classNames(
                    styles.cardRarityExample,
                    styles[`cardRarityExample${currentCraftRule.requiredCards.rarity}`],
                  )}
                ></div>
              </div>
            ) : (
              <div>???</div>
            )}
            {currentCraftRule ? (
              requiredCards.length === currentCraftRule.requiredCards.count ? (
                <div className={styles.inspectionPass}></div>
              ) : (
                <div className={styles.inspectionNotPass}>×</div>
              )
            ) : null}
          </div>
          <div>
            <div>
              {currentCraftRule ? currentCraftRule.requiredFaithCoin : '???'}
              <div className={styles.requiredAssetIcon}></div>
            </div>
            {currentCraftRule ? (
              userFaithAmountCheck ? (
                <div className={styles.inspectionPass}></div>
              ) : (
                <div className={styles.inspectionNotPass}>×</div>
              )
            ) : null}
          </div>
        </div>
        <div className={styles.optionalContainer}>
          <div>Optional</div>
          <div className={styles.optionalCount}>{`(${additiveCards.length}/4)`}</div>
        </div>
      </div>
      <div className={styles.middleContainer}>
        <div className={styles.magicContainer}>
          <div className={styles.magicBackground}></div>
          <div className={styles.successRateContainer}>
            <div className={styles.successRateTitle}>Synthesis Rate</div>
            <div>
              <CountUp
                start={undefined}
                end={successRate * 100}
                decimals={2}
                duration={1}
                separator=","
                preserveValue
                easingFn={(t, b, c, d) => {
                  // easeOutQuad: 先快后慢
                  t /= d
                  return -c * t * (t - 2) + b
                }}
              />
              %
            </div>
          </div>
          {ArrowArray.map((_item, index) => (
            <div
              key={index}
              className={classNames(styles.arrow, styles[`arrow${index + 1}`])}
            ></div>
          ))}
          <div
            className={classNames(styles.targetCardContainer, {
              [styles.targetCardEmpty]: !craftTargetCard,
              button: !craftTargetCard,
            })}
            onClick={handleTargetCardClick}
          >
            {craftTargetCard ? (
              <StaticCard width={REQUIRED_CARD_WIDTH} card={craftTargetCard}></StaticCard>
            ) : (
              <div className={classNames(styles.targetCardTitle, 'text-shadow')}>Target</div>
            )}
          </div>
          {new Array(currentCraftRule?.requiredCards.count || DEFAULT_REQUIRED_CARDS_COUNT)
            .fill(null)
            .map((_item, index) => {
              return (
                <div
                  key={`${index}-${requiredCards[index]?.card?.id}`}
                  className={classNames(
                    styles.cardRequiredContainer,
                    styles[`cardRequiredContainer${index + 1}`],
                    {
                      [styles.cardRequiredEmpty]: !requiredCards[index],
                      button: !requiredCards[index],
                    },
                  )}
                  onClick={handleRequiredCardClick}
                >
                  {requiredCards[index] ? (
                    <StaticCard
                      width={REQUIRED_CARD_WIDTH}
                      card={requiredCards[index].card}
                    ></StaticCard>
                  ) : null}
                </div>
              )
            })}
        </div>
        <button
          className={classNames(styles.craftButton, 'button text-shadow')}
          onClick={handleCraftButtonClick}
        >
          Craft 256<div className={styles.assetIcon}></div>
        </button>
      </div>
      <div className={styles.additiveContainer}>
        <div className={styles.additiveTitle}>Additive</div>
        <div className={styles.additiveDescription}>Add more cards to get higher chance.</div>
        <div className={styles.additiveCardsContainer}>
          {AdditiveCardArray.map((_item, index) => {
            return (
              <div
                key={`${index}-${additiveCards[index]?.card?.id}`}
                className={classNames(styles.additiveCardContainer, {
                  [styles.additiveCardContainerEmpty]: !additiveCards[index],
                  button: !additiveCards[index],
                })}
                onClick={handleAdditiveCardClick}
              >
                {additiveCards[index] ? (
                  <StaticCard
                    width={ADDITIVE_CARD_WIDTH}
                    card={additiveCards[index]?.card}
                  ></StaticCard>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
      <CardSelectModal
        open={cardSelectModalOpen}
        onOpenChange={setCardSelectModalOpen}
        selectedCardPositions={selectedCardPositions}
        handleCardSelect={handleCardSelect}
        mode={'positon'}
      ></CardSelectModal>
    </div>
  )
}
export default observer(Craft)

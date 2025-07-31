import { observer } from 'mobx-react-lite'
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react'
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
import { isCardsSameChain } from '@/utils/common.ts'
import type { ICardDataInBag, ICardDataWithCount } from '@/stores/app-store.ts'
import { gsap } from 'gsap'
import { AudioInstanceId } from '@/stores/preload-store.ts'

const CardSelectModal = React.lazy(() => import('@/components/CardSelectModal.tsx'))
const CraftResultModal = React.lazy(() => import('./CraftResultModal.tsx'))

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

enum CARD_SELECT_TYPE {
  REQUIRED = 'required',
  ADDITIVE = 'additive',
}
const Craft: React.FC<{ playCraftCardVideo: () => Promise<void> }> = ({ playCraftCardVideo }) => {
  const {
    preloadStore: { audioInstanceMap },
    appStore: { userInfo, cardsBag, craftCard },
  } = useMobxStore()
  const craftSuccessSound = audioInstanceMap.get(AudioInstanceId.CraftSuccessSound)
  const craftFailSound = audioInstanceMap.get(AudioInstanceId.CraftFailedSound)
  const navigate = useNavigate()
  const location: Location<FusionPathState> = useLocation()
  const [craftTargetCard, setCraftTargetCard] = useState(location.state?.card)
  const [requiredCards, setRequiredCards] = useState<Array<ICardDataInBag>>([])
  const [additiveCards, setAdditiveCards] = useState<Array<ICardDataInBag>>([])
  const [craftResultModalData, setCraftResultModalData] = useState<{
    open: boolean
    type: 'success' | 'fail'
    cards: Array<ICardData>
  }>({
    open: false,
    type: 'success',
    cards: [],
  })
  const cardSelectType = useRef<CARD_SELECT_TYPE>(CARD_SELECT_TYPE.REQUIRED)
  const selectedUserCardIds = useMemo(
    () => requiredCards.concat(additiveCards).map((card) => card.userCardId),
    [additiveCards, requiredCards],
  )
  const [cardSelectModalOpen, setCardSelectModalOpen] = useState(false)
  const currentCraftRule = useMemo(
    () => CraftRule.find((item) => item.targetRarity === craftTargetCard?.rarity),
    [craftTargetCard?.rarity],
  )
  const successRate = useMemo(() => {
    if (!currentCraftRule || !craftTargetCard) return new BigNumber(0)
    const baseSuccessRate = new BigNumber(currentCraftRule.baseSuccessRate)
    const maxSuccessRate = new BigNumber(currentCraftRule.maxSuccessRate)
    const additiveSuccessRate = additiveCards.reduce((previousValue, currentValue) => {
      return previousValue.plus(calculateAdditiveCardBonusRate(craftTargetCard, currentValue))
    }, new BigNumber(0))
    const finalSuccessRate = new BigNumber(baseSuccessRate).plus(additiveSuccessRate)
    if (finalSuccessRate.isGreaterThan(maxSuccessRate)) {
      return maxSuccessRate
    } else {
      return finalSuccessRate
    }
  }, [additiveCards, craftTargetCard, currentCraftRule])
  const userFaithAmountCheck = useMemo(() => {
    if (!userInfo?.faithAmount || !currentCraftRule?.requiredFaithCoin) return false
    return userInfo?.faithAmount >= currentCraftRule?.requiredFaithCoin
  }, [currentCraftRule?.requiredFaithCoin, userInfo?.faithAmount])
  const requiredCardsRef = useRef<Array<HTMLDivElement>>([])
  const additiveCardsRef = useRef<Array<HTMLDivElement>>([])
  const moveCardsToCenterTimeline = useRef<gsap.core.Timeline>(null)

  const handleTargetCardClick = () => {
    navigate(getGalleryPath(undefined), { state: { type: 'select', from: FUSION_PATH } })
  }

  const handleMoveCardsToCenter = () => {
    return new Promise<void>((resolve) => {
      if (!requiredCardsRef.current?.length) {
        resolve()
      }
      if (!moveCardsToCenterTimeline.current) {
        moveCardsToCenterTimeline.current = gsap.timeline({
          onComplete: () => {
            resolve()
          },
        })
        const needMoveTarget = requiredCardsRef.current.concat(
          additiveCardsRef.current.filter((_item, index) => Boolean(additiveCards[index])),
        )
        moveCardsToCenterTimeline.current.to(needMoveTarget, {
          x: (_index, cardRef) => {
            const rect = cardRef.getBoundingClientRect()
            const elCenterX = rect.left + rect.width / 2
            const winCenterX = window.innerWidth / 2
            return winCenterX - elCenterX
          },
          y: (_index, cardRef) => {
            const rect = cardRef.getBoundingClientRect()
            const elCenterY = rect.top + rect.height / 2
            const winCenterY = window.innerHeight / 2
            return winCenterY - elCenterY
          },
          scale: 0,
          duration: 1.2,
          ease: 'power1.in',
          stagger: 0.3,
        })
      } else {
        moveCardsToCenterTimeline.current.restart()
      }
    })
  }

  const playCraftAnimation = async () => {
    await handleMoveCardsToCenter()
    await playCraftCardVideo()
  }

  const handleCraftButtonClick = async () => {
    if (!userInfo || !currentCraftRule || !craftTargetCard) return
    if (userInfo.faithAmount < currentCraftRule.requiredFaithCoin) {
      return toast.warning('Insufficient faith amount to craft!')
    }
    if (requiredCards.length < currentCraftRule.requiredCards.count) {
      return toast.warning('Required cards are not enough!')
    }
    const [craftResult] = await Promise.all([
      craftCard(craftTargetCard, requiredCards, additiveCards),
      playCraftAnimation(),
    ])
    setCraftTargetCard(undefined)
    if (moveCardsToCenterTimeline.current) {
      moveCardsToCenterTimeline.current.revert()
    }
    if (!craftResult) {
      return
    }
    if (
      (craftResult as unknown as { type: 'success' | 'fail'; cards: Array<ICardData> }).type ===
      'success'
    ) {
      if (craftSuccessSound) {
        craftSuccessSound.play({ volume: 1 })
      }
    } else {
      if (craftFailSound) {
        craftFailSound.play({ volume: 1 })
      }
    }
    setCraftResultModalData({
      open: true,
      type: (craftResult as unknown as { type: 'success' | 'fail'; cards: Array<ICardData> }).type,
      cards: (craftResult as unknown as { type: 'success' | 'fail'; cards: Array<ICardData> })
        .cards,
    })
  }

  const handleRequiredCardClick = () => {
    setCardSelectModalOpen(true)
    cardSelectType.current = CARD_SELECT_TYPE.REQUIRED
  }

  const handleAdditiveCardClick = () => {
    setCardSelectModalOpen(true)
    cardSelectType.current = CARD_SELECT_TYPE.ADDITIVE
  }

  const handleCardSelect = (cardData: ICardDataInBag | ICardDataWithCount) => {
    const card = cardData as ICardDataInBag
    if (!craftTargetCard || !currentCraftRule) return
    if (cardSelectType.current === CARD_SELECT_TYPE.REQUIRED) {
      if (card.rarity + 1 !== currentCraftRule.requiredCards.rarity) {
        return toast.warning('Required cards must be the same rarity as required.')
      }
      if (!isCardsSameChain(craftTargetCard, card)) {
        return toast.warning('Required cards must be the same chain as the target card.')
      }
      if (requiredCards.map((item) => item.userCardId).indexOf(card.userCardId) !== -1) {
        setRequiredCards((prevState) =>
          prevState.filter((item) => item.userCardId !== card.userCardId),
        )
      } else {
        if (requiredCards.length >= currentCraftRule.requiredCards.count) {
          return toast.warning('You have already selected the required number of cards.')
        }
        setRequiredCards((prevState) => prevState.concat([card]))
      }
    } else {
      if (additiveCards.map((item) => item.userCardId).indexOf(card.userCardId) !== -1) {
        setAdditiveCards((prevState) =>
          prevState.filter((item) => item.userCardId !== card.userCardId),
        )
      } else {
        if (additiveCards.length >= 4) {
          return toast.warning('You can only add up to 4 additive cards.')
        }
        setAdditiveCards((prevState) => prevState.concat([card]))
      }
    }
  }

  const handleCraftResultModalOpenChange = (open: boolean) => {
    setCraftResultModalData((prevState) => ({ ...prevState, open }))
  }

  useEffect(() => {
    if (craftTargetCard && currentCraftRule) {
      // Auto select required cards based on the current craft rule
      const requiredCardsCount = currentCraftRule.requiredCards.count
      const requiredCardsRarity = currentCraftRule.requiredCards.rarity
      const availableCardsWithIndex = cardsBag.filter(
        (card) => card.rarity === requiredCardsRarity && isCardsSameChain(card, craftTargetCard),
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
          <div className={styles.magicBackground1}></div>
          <div className={styles.magicBackground2}></div>
          <div className={styles.successRateContainer}>
            <div className={styles.successRateTitle}>Success Rate</div>
            <div>
              <CountUp
                start={undefined}
                end={successRate.times(100).decimalPlaces(2, BigNumber.ROUND_HALF_UP).toNumber()}
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
                  key={`${index}-${requiredCards[index]?.userCardId}`}
                  className={classNames(
                    styles.cardRequiredContainer,
                    styles[`cardRequiredContainer${index + 1}`],
                    {
                      [styles.cardRequiredEmpty]: !requiredCards[index],
                      button: !requiredCards[index],
                    },
                  )}
                  onClick={handleRequiredCardClick}
                  ref={(el) => {
                    if (el) {
                      requiredCardsRef.current[index] = el
                    }
                  }}
                >
                  {requiredCards[index] ? (
                    <StaticCard
                      width={REQUIRED_CARD_WIDTH}
                      card={requiredCards[index]}
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
          Craft {currentCraftRule?.requiredFaithCoin || ''}
          <div className={styles.assetIcon}></div>
        </button>
      </div>
      <div className={styles.additiveContainer}>
        <div className={styles.additiveTitle}>Additive</div>
        <div className={styles.additiveDescription}>Add more cards to get higher chance.</div>
        <div className={styles.additiveCardsContainer}>
          {AdditiveCardArray.map((_item, index) => {
            return (
              <div
                key={`${index}-${additiveCards[index]?.userCardId}`}
                className={classNames(styles.additiveCardContainer, {
                  [styles.additiveCardContainerEmpty]: !additiveCards[index],
                  button: !additiveCards[index],
                })}
                onClick={handleAdditiveCardClick}
                ref={(el) => {
                  if (el) {
                    additiveCardsRef.current[index] = el
                  }
                }}
              >
                {additiveCards[index] ? (
                  <StaticCard width={ADDITIVE_CARD_WIDTH} card={additiveCards[index]}></StaticCard>
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
      <Suspense fallback={null}>
        <CardSelectModal
          open={cardSelectModalOpen}
          onOpenChange={setCardSelectModalOpen}
          selectedUserCardIds={selectedUserCardIds}
          handleCardSelect={handleCardSelect}
          mode={'userCardId'}
        ></CardSelectModal>
      </Suspense>
      <Suspense fallback={null}>
        <CraftResultModal
          open={craftResultModalData.open}
          onOpenChange={handleCraftResultModalOpenChange}
          type={craftResultModalData.type}
          cards={craftResultModalData.cards}
        ></CraftResultModal>
      </Suspense>
    </div>
  )
}
export default observer(Craft)

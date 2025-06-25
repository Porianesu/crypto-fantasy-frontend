import React, {
  Suspense,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import styles from './TournamentPageCardsFormation.module.css'
import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'
import { observer } from 'mobx-react-lite'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import classNames from 'classnames'
import { toast } from 'react-toastify'
import { BigNumber } from 'bignumber.js'

const TournamentPageCardsFormationModal = React.lazy(
  () => import('@/pages/TournamentPage/TournamentPageCardsFormationModal.tsx'),
)

export interface ITournamentPageCardsFormationHandle {
  tempCardsFormation: Array<number>
}

interface ITournamentPageCardsFormationWrapperProps {
  currentPrizePool: IPrizePool | undefined
  rules: {
    totalCrystal: number
    rarity: Array<{
      key: CARD_RARITY
      crystal: number
    }>
  }
}

const Rarity_Label_Map = {
  [CARD_RARITY.NORMAL]: 'Common',
  [CARD_RARITY.RARE]: 'Rare',
  [CARD_RARITY.EPIC]: 'Epic',
  [CARD_RARITY.LEGENDARY]: 'Legendary',
}

const TournamentPageCardsFormationWrapper = React.forwardRef<
  ITournamentPageCardsFormationHandle,
  ITournamentPageCardsFormationWrapperProps
>(({ currentPrizePool, rules }, ref) => {
  const {
    preloadStore: { preloadQueue },
  } = useMobxStore()
  const cardData = preloadQueue?.getResult('cardsData') as Array<ICardData> | undefined
  if (!currentPrizePool || !cardData) {
    return (
      <div className={styles.formationContainer}>
        <div className={styles.formationTitle}>Your Formation</div>
        <div className="flex flex-1 items-center justify-center pb-40 text-2xl text-white">
          Loading...
        </div>
      </div>
    )
  }
  if (
    currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING &&
    !currentPrizePool.user_participated
  ) {
    return (
      <div className={styles.formationContainer}>
        <div className={styles.formationTitle}>Your Formation</div>
        <div className="flex flex-1 items-center justify-center pb-40 text-2xl text-white px-2 text-center">
          You did not participate in this pool.
        </div>
      </div>
    )
  }

  return (
    <TournamentPageCardsFormation
      ref={ref}
      cardData={cardData}
      currentPrizePool={currentPrizePool}
      rules={rules}
    ></TournamentPageCardsFormation>
  )
})

interface ITournamentPageCardsFormationProps {
  cardData: Array<ICardData>
  currentPrizePool: IPrizePool
  rules: {
    totalCrystal: number
    rarity: Array<{
      key: CARD_RARITY
      crystal: number
    }>
  }
}

const TournamentPageCardsFormation = React.forwardRef<
  ITournamentPageCardsFormationHandle,
  ITournamentPageCardsFormationProps
>(({ currentPrizePool, rules, cardData }, ref) => {
  const [tempCardsFormation, setTempCardsFormation] = useState<Array<number>>([])
  const [cardsFormationModalOpen, setCardsFormationModalOpen] = useState(false)
  const [cardsDeckPowerRate, setCardsDeckPowerRate] = useState(1)
  const cards = useMemo(
    () =>
      currentPrizePool.status === PRIZE_POOL_STATUS.UPCOMING
        ? tempCardsFormation
        : currentPrizePool.user_card_formation || [],
    [currentPrizePool.status, currentPrizePool.user_card_formation, tempCardsFormation],
  )
  const formatedCards = useMemo(
    () => cards.map((cardId) => cardData.find((c) => c.id === cardId)).filter((card) => card),
    [cardData, cards],
  )
  const deckPower = useMemo(
    () =>
      currentPrizePool.status === PRIZE_POOL_STATUS.UPCOMING
        ? new BigNumber(
            formatedCards.reduce((previousValue, currentValue) => {
              return previousValue + (currentValue?.score || 0)
            }, 0),
          )
            .multipliedBy(cardsDeckPowerRate)
            .decimalPlaces(0)
            .toNumber()
        : currentPrizePool.user_deck_power || 0,
    [cardsDeckPowerRate, currentPrizePool.status, currentPrizePool.user_deck_power, formatedCards],
  )
  const paddedCards: Array<ICardData | undefined> = useMemo(
    () => [...formatedCards, ...Array(5 - formatedCards.length).fill(undefined)],
    [formatedCards],
  )
  const getTotalCrystal = useCallback(
    (cardsId: Array<number>) => {
      // 统计每种稀有度的数量
      const rarityCount: Record<CARD_RARITY, number> = {
        [CARD_RARITY.NORMAL]: 0,
        [CARD_RARITY.RARE]: 0,
        [CARD_RARITY.EPIC]: 0,
        [CARD_RARITY.LEGENDARY]: 0,
      }
      // 统计新阵容中每种稀有度的数量
      cardsId.forEach((cardId) => {
        const card = cardData?.find((c) => c.id === cardId)
        if (card) rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1
      })
      // 统计消耗的总水晶数量
      return Object.entries(rarityCount).reduce<number>((previousValue, currentValue) => {
        const [rarity, count] = currentValue
        const rarityRule = rules.rarity.find((r) => `${r.key}` === rarity)
        return previousValue + (rarityRule?.crystal || 0) * count
      }, 0)
    },
    [cardData, rules.rarity],
  )
  const currentDeckTotalCrystal = useMemo(() => getTotalCrystal(cards), [getTotalCrystal, cards])

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined
    if (currentPrizePool.status === PRIZE_POOL_STATUS.UPCOMING) {
      const updateCardsDeckPowerRate = () => {
        setCardsDeckPowerRate(Math.random() * 1.5 + 0.5) // 随机生成0.5到2之间的倍率
      }
      updateCardsDeckPowerRate()
      timer = setInterval(
        updateCardsDeckPowerRate,
        1000 * 10, // 每10秒更新一次倍率
      )
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [currentPrizePool.id, currentPrizePool.status])

  useEffect(() => {
    if (
      currentPrizePool?.status === PRIZE_POOL_STATUS.UPCOMING &&
      currentPrizePool.user_card_formation
    ) {
      setTempCardsFormation(currentPrizePool.user_card_formation)
    }
  }, [currentPrizePool?.id])

  useImperativeHandle(
    ref,
    () => ({
      tempCardsFormation,
    }),
    [tempCardsFormation],
  )

  const handleCardClick = () => {
    if (
      currentPrizePool.status !== PRIZE_POOL_STATUS.UPCOMING ||
      currentPrizePool.user_participated
    )
      return
    setCardsFormationModalOpen(true)
  }

  const changeTempCardsFormation = (newCards: Array<number>) => {
    const totalCrystal = getTotalCrystal(newCards)
    if (totalCrystal > rules.totalCrystal) {
      return toast.warning('Not enough energy slots remaining.')
    }
    setTempCardsFormation(newCards)
  }

  const renderCard = (card: ICardData | undefined, key: React.Key) =>
    card ? (
      <StaticCard
        className={classNames(styles.formationCard, styles[`formationCard${key}`])}
        key={card.id}
        card={card}
        width={111}
        onClick={handleCardClick}
      ></StaticCard>
    ) : (
      <button
        className={classNames(
          styles.formationCard,
          styles[`formationCard${key}`],
          styles.emptyCard,
          'button',
        )}
        onClick={handleCardClick}
      ></button>
    )

  return (
    <>
      <div className={styles.formationContainer}>
        <div className={styles.formationTitle}>My Deck</div>
        <div className={styles.crystalCount}>{`(${currentDeckTotalCrystal}/8)`}</div>
        <div className={styles.crystalContainer}>
          {new Array(rules.totalCrystal).fill(null).map((_item, index) => {
            return (
              <div
                key={index}
                className={classNames(styles.crystalBase, {
                  [styles.crystalInactive]: index >= currentDeckTotalCrystal,
                  [styles.crystalActive]: index < currentDeckTotalCrystal,
                })}
              ></div>
            )
          })}
        </div>
        <div className={styles.formationSquare}>
          <div>
            {renderCard(paddedCards[0], 0)}
            <div className={styles.powerContainer}>
              <div className={styles.powerLabel}>Power</div>
              <div>{deckPower}</div>
            </div>
            {renderCard(paddedCards[1], 1)}
          </div>
          <div>{paddedCards.slice(2, 5).map((card, idx) => renderCard(card, idx + 1))}</div>
          <div className={styles.formationSquareBackground}></div>
        </div>
        <div className={styles.rulesContainer}>
          {rules.rarity.map((r) => (
            <div key={r.key} className={styles.ruleItem}>
              <div className={styles.ruleRarity}>{Rarity_Label_Map[r.key]}</div>
              <div className={styles.ruleCrystal}>
                {new Array(r.crystal).fill(null).map((_item, index) => {
                  return <div key={index}></div>
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Suspense fallback={null}>
        <TournamentPageCardsFormationModal
          open={cardsFormationModalOpen}
          onOpenChange={setCardsFormationModalOpen}
          cardsFormation={tempCardsFormation}
          changeCardsFormation={changeTempCardsFormation}
        ></TournamentPageCardsFormationModal>
      </Suspense>
    </>
  )
})

export default observer(TournamentPageCardsFormationWrapper)

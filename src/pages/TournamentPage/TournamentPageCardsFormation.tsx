import React, { useEffect, useImperativeHandle, useMemo, useState } from 'react'
import styles from './TournamentPageCardsFormation.module.css'
import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'
import { observer } from 'mobx-react-lite'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import StaticCard from '@/components/StaticCard.tsx'
import classNames from 'classnames'
import TournamentPageCardsFormationModal from '@/pages/TournamentPage/TournamentPageCardsFormationModal.tsx'
import { toast } from 'react-toastify'
import { BigNumber } from 'bignumber.js'

export interface ITournamentPageCardsFormationHandle {
  tempCardsFormation: Array<number>
}
interface ITournamentPageCardsFormationWrapperProps {
  currentPrizePool: IPrizePool | undefined
  rules: Array<{
    key: CARD_RARITY
    value: number
  }>
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
        <div className="flex flex-1 items-center justify-center w-full h-full text-blue-300 text-2xl">
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
        <div className="flex flex-1 items-center justify-center w-full h-full text-blue-300 text-xl">
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
  rules: Array<{
    key: CARD_RARITY
    value: number
  }>
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
    setCardsFormationModalOpen(true)
  }

  const changeTempCardsFormation = (newCards: Array<number>) => {
    // 统计每种稀有度的数量
    const rarityCount: Record<CARD_RARITY, number> = {
      [CARD_RARITY.NORMAL]: 0,
      [CARD_RARITY.RARE]: 0,
      [CARD_RARITY.EPIC]: 0,
      [CARD_RARITY.LEGENDARY]: 0,
    }
    // 统计新阵容中每种稀有度的数量
    newCards.forEach((cardId) => {
      const card = cardData?.find((c) => c.id === cardId)
      if (card) rarityCount[card.rarity] = (rarityCount[card.rarity] || 0) + 1
    })
    // 检查是否超出规则限制
    for (const rule of rules) {
      if (rarityCount[rule.key] > rule.value) {
        toast.warn(`Exceeds the maximum allowed number of ${rule.key} cards: ${rule.value}`)
        return
      }
    }
    setTempCardsFormation(newCards)
  }

  // 卡片渲染函数，避免重复
  const renderCard = (card: ICardData | undefined, key: React.Key) =>
    card ? (
      <StaticCard key={card.id} card={card} width={142} onClick={handleCardClick}></StaticCard>
    ) : (
      <button
        key={key}
        className={classNames(styles.formationCardSlot, 'button')}
        onClick={handleCardClick}
      >
        +
      </button>
    )

  // 保证5个卡槽
  const paddedCards: Array<ICardData | undefined> = [
    ...formatedCards,
    ...Array(5 - formatedCards.length).fill(undefined),
  ]

  return (
    <div className={styles.formationContainer}>
      <div className={styles.formationTitle}>Your Formation</div>
      <div className={styles.formationCards}>
        <div className={styles.formationCardsRow}>
          {paddedCards.slice(0, 3).map((card, idx) => renderCard(card, idx))}
        </div>
        <div className={styles.formationCardsRow}>
          {paddedCards.slice(3, 5).map((card, idx) => renderCard(card, idx + 3))}
        </div>
      </div>
      <div className={styles.deckPowerLabel}>Deck Power</div>
      <div className={styles.deckPowerValue}>{deckPower}</div>
      <TournamentPageCardsFormationModal
        open={cardsFormationModalOpen}
        onOpenChange={setCardsFormationModalOpen}
        cardsFormation={tempCardsFormation}
        changeCardsFormation={changeTempCardsFormation}
      ></TournamentPageCardsFormationModal>
    </div>
  )
})

export default observer(TournamentPageCardsFormationWrapper)

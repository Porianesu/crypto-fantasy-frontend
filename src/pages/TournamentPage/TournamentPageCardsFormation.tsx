import React, {
  type RefObject,
  Suspense,
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
import type { IOpenPackHandle } from '@/components/OpenPack.tsx'

const TournamentPageCardsFormationModal = React.lazy(
  () => import('@/pages/TournamentPage/TournamentPageCardsFormationModal.tsx'),
)

export interface ITournamentPageCardsFormationHandle {
  tempCardsFormation: Array<number>
}
interface ITournamentPageCardsFormationWrapperProps {
  currentPrizePool: IPrizePool | undefined
  rules: Array<{
    key: CARD_RARITY
    value: number
  }>
  openPackRef: RefObject<IOpenPackHandle | null>
}

const TournamentPageCardsFormationWrapper = React.forwardRef<
  ITournamentPageCardsFormationHandle,
  ITournamentPageCardsFormationWrapperProps
>(({ currentPrizePool, rules, openPackRef }, ref) => {
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
      openPackRef={openPackRef}
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
  openPackRef: RefObject<IOpenPackHandle | null>
}
const TournamentPageCardsFormation = React.forwardRef<
  ITournamentPageCardsFormationHandle,
  ITournamentPageCardsFormationProps
>(({ currentPrizePool, rules, cardData, openPackRef }, ref) => {
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
  console.log('my deck power', deckPower)

  const paddedCards: Array<ICardData | undefined> = useMemo(
    () => [...formatedCards, ...Array(5 - formatedCards.length).fill(undefined)],
    [formatedCards],
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

  const handleOpenPack = () => {
    if (openPackRef.current) {
      openPackRef.current.handleOpenPack()
    }
  }

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
      <StaticCard
        className={classNames(styles.formationCard, styles[`formationCard${key}`])}
        key={card.id}
        card={card}
        width={122}
        onClick={handleCardClick}
      ></StaticCard>
    ) : (
      <button
        key={key}
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
        <div className={styles.formationSquare}>
          {paddedCards.map((card, idx) => renderCard(card, idx + 1))}
          <div className={styles.formationSquareBackground}></div>
        </div>
        {/*<div className={styles.deckPowerLabel}>Deck Power</div>*/}
        {/*<div className={styles.deckPowerValue}>{deckPower}</div>*/}
        <button className={classNames(styles.openPackButton, 'button')} onClick={handleOpenPack}>
          Open Pack
        </button>
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

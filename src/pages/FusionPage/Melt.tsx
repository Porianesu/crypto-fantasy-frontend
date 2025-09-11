import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import styles from './Melt.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import StaticCard from '@/components/StaticCard.tsx'
import { RARITY_OPTIONS, type RARITY_SELECT_VALUE } from '@/components/RaritySelect.tsx'
import MeltResultModal from '@/pages/FusionPage/MeltResultModal.tsx'
import type { ICardDataInBag } from '@/stores/app-store.ts'
import { toast } from 'react-toastify'

const MAX_MELT_CARDS = 5 // 最多同时熔炼的卡牌数量
const Melt: React.FC<{ playMeltCardVideo: () => Promise<void> }> = ({ playMeltCardVideo }) => {
  const {
    appStore: { appConfig, cardsBag, userInfo, meltCard },
  } = useMobxStore()
  const [meltButtonLoading, setMeltButtonLoading] = useState(false)
  const [meltTargetCards, setMeltTargetCards] = useState<Array<ICardDataInBag>>([])
  const [rarityFilter, setRarityFilter] = useState<RARITY_SELECT_VALUE>('all')
  const [meltResultModalData, setMeltResultModalData] = useState<{
    open: boolean
    faithCoin: number
  }>({
    open: false,
    faithCoin: 0,
  })
  const deckUserCardIds = useMemo(
    () => userInfo?.deckCards?.map((item) => item.userCardId) || [],
    [userInfo?.deckCards],
  )
  const filteredCards = useMemo(() => {
    if (rarityFilter === 'all') {
      return cardsBag
    }
    return cardsBag.filter(
      (card) => card.rarity === rarityFilter && !deckUserCardIds.includes(card.userCardId),
    )
  }, [cardsBag, deckUserCardIds, rarityFilter])
  const totalFaithCoinCost = useMemo(() => {
    return meltTargetCards.reduce((total, card) => {
      const rule = appConfig?.MeltRule?.find((item) => item.rarity === card.rarity)
      if (rule) {
        return total + rule.faithCoin
      }
      return total
    }, 0)
  }, [appConfig?.MeltRule, meltTargetCards])

  const handleMeltButtonClick = async () => {
    if (!totalFaithCoinCost || !meltTargetCards) return
    if (
      deckUserCardIds.some((userCardId) =>
        meltTargetCards.find((card) => card.userCardId === userCardId),
      )
    ) {
      toast.warning('You cannot melt a card that is in your deck.')
      return
    }
    setMeltButtonLoading(true)
    const meltResult = await meltCard(meltTargetCards)
    if ((meltResult as unknown as string) === 'success') {
      setMeltTargetCards([])
      await playMeltCardVideo()
      setMeltResultModalData({
        open: true,
        faithCoin: totalFaithCoinCost,
      })
    }
    setMeltButtonLoading(false)
  }

  const handleCardClick = (card: ICardDataInBag) => {
    if (!userInfo) return
    if (deckUserCardIds.includes(card.userCardId)) {
      toast.warning('This card is in your deck, please remove it first.')
      return
    }
    setMeltTargetCards((prevState) => {
      const existIndex = prevState.findIndex((item) => item.userCardId === card.userCardId)
      if (existIndex > -1) {
        // 如果已经存在，则移除该卡牌
        const newState = [...prevState]
        newState.splice(existIndex, 1)
        return newState
      } else {
        // 如果不存在，则添加该卡牌（限制最多添加5张）
        if (prevState.length >= MAX_MELT_CARDS) {
          toast.warning('You can melt up to 5 cards at a time.')
          return prevState
        }
        if (prevState.length >= userInfo.meltCurrent) {
          toast.warning('You have reached your melt limit.')
          return prevState
        }
        return [...prevState, card]
      }
    })
  }

  return (
    <div className={styles.bodyContainer}>
      <div className={styles.selectContainer}>
        <div className={styles.selectHeader}>
          <div className={styles.selectHeaderTitle}>Select a card</div>
          {userInfo ? (
            <div className={styles.selectLimitContainer}>
              <div className={styles.selectLimitTextContainer}>
                Limit:
                <span
                  className={classNames(styles.selectLimitRemainText, {
                    [styles.selectLimitRemainTextNotEnough]: userInfo.meltCurrent <= 0,
                  })}
                >
                  {userInfo.meltCurrent}remaining
                </span>
                <span className={styles.selectLimitMaxText}>/{userInfo.meltMax}</span>
              </div>
              <button className={classNames(styles.plusButton, 'button')}></button>
            </div>
          ) : null}
        </div>
        <div className={styles.rarityContainer}>
          {RARITY_OPTIONS.map((item) => {
            return (
              <button
                key={item.value}
                onClick={() => {
                  setRarityFilter(item.value)
                }}
                className={classNames(
                  styles.rarityItem,
                  {
                    [styles.rarityItemSelected]: rarityFilter === item.value,
                  },
                  'button',
                )}
              >
                {item.label}
              </button>
            )
          })}
        </div>
        <div className={classNames(styles.cardsListWrapper, 'no-scrollbar')}>
          <div className={styles.cardsList}>
            {filteredCards.map((card) => (
              <StaticCard
                key={`${card.id}-${card.userCardId}`}
                card={card}
                width={178}
                onClick={() => {
                  handleCardClick(card)
                }}
              ></StaticCard>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.meltContainer}>
        {meltTargetCards.length ? (
          <StaticCard
            card={meltTargetCards[0]}
            className={styles.meltCard}
            width={166}
          ></StaticCard>
        ) : (
          <div className={styles.meltCardEmpty}></div>
        )}
        <div className={styles.meltDescriptionContainer}>
          {meltTargetCards?.length ? "You'll get" : 'Please place the card'}
          {totalFaithCoinCost ? (
            <div className={styles.faithCoinContainer}>
              {totalFaithCoinCost}
              <div className={styles.faithCoin}></div>
            </div>
          ) : null}
        </div>
        <button
          className={classNames(styles.meltButton, 'text-shadow', {
            button: !meltButtonLoading,
          })}
          disabled={meltButtonLoading}
          onClick={handleMeltButtonClick}
        >
          Melt
        </button>
      </div>
      <MeltResultModal
        open={meltResultModalData.open}
        onOpenChange={(open) => {
          setMeltResultModalData((prevState) => ({ ...prevState, open }))
        }}
        faithCoin={meltResultModalData.faithCoin}
      ></MeltResultModal>
    </div>
  )
}
export default observer(Melt)

import { observer } from 'mobx-react-lite'
import React, { useMemo } from 'react'
import {
  Content,
  Description,
  Dialog,
  DialogOverlay,
  Portal,
  Title,
  Close,
} from '@radix-ui/react-dialog'
import classNames from 'classnames'
import styles from './CardsBagModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid'
import { CARD_RARITY, type ICardData } from '@/components/Card.tsx'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import StaticCard from '@/components/StaticCard.tsx'
import { useNavigate } from 'react-router-dom'
import { getGalleryPath } from '@/navigation/routes.tsx'

interface IBagCardData extends ICardData {
  count: number
}
// 稀有度选项
const RarityOptions = [
  { value: 'all', label: 'All' },
  { value: CARD_RARITY.NORMAL, label: 'Common' },
  { value: CARD_RARITY.RARE, label: 'Rare' },
  { value: CARD_RARITY.EPIC, label: 'Epic' },
  { value: CARD_RARITY.LEGENDARY, label: 'Legendary' },
]

const CardsBagModal: React.FC = () => {
  const {
    appStore: { cardsBag, cardsFormation, changeCardsFormation },
    modalStore: { changeCardsBagModalData, cardsBagModalData },
  } = useMobxStore()
  const navigate = useNavigate()
  const formattedCardsBag = useMemo<Array<IBagCardData>>(() => {
    // 格式化卡牌背包数据，统计每张卡牌的数量
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

  const [search, setSearch] = React.useState('')
  const [rarity, setRarity] = React.useState<CARD_RARITY | 'all'>('all')
  const [selectedIds, setSelectedIds] = React.useState<number[]>(
    cardsFormation.map((card) => card.id),
  )
  const isEdit = useMemo(
    () => cardsBagModalData.type === ICardsBagModalType.EDIT,
    [cardsBagModalData.type],
  )

  const handleSelect = (id: number) => {
    if (!isEdit) return
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id))
    } else if (selectedIds.length < 5) {
      setSelectedIds([...selectedIds, id])
    }
  }

  // 卡牌过滤（暂时只做空和全部展示）
  const filteredCards = useMemo(
    () =>
      formattedCardsBag?.filter((card) => {
        const matchName = card.name?.toLowerCase().includes(search.toLowerCase())
        const matchRarity = rarity === 'all' || card.rarity === rarity
        return matchName && matchRarity
      }) || [],
    [formattedCardsBag, rarity, search],
  )

  const handleCardClick = (card: IBagCardData, selected?: boolean) => {
    if (isEdit) {
      if (!selected && selectedIds.length >= 5) {
        return
      }
      handleSelect(card.id)
    } else {
      navigate(getGalleryPath(card.id))
    }
  }

  const handleConfirmButtonClick = () => {
    if (isEdit) {
      // 确认编辑，更新卡牌阵容
      const selectedCards = formattedCardsBag.filter((card) => selectedIds.includes(card.id))
      changeCardsFormation(selectedCards)
    }
    changeCardsBagModalData({ visible: false, type: ICardsBagModalType.VIEW })
  }

  return (
    <Dialog
      open={cardsBagModalData.visible}
      onOpenChange={(visible) => {
        changeCardsBagModalData({
          visible,
          type: ICardsBagModalType.VIEW, // 关闭时重置为查看模式
        })
      }}
    >
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Description></Description>
          <Content className={styles.modalContent}>
            <div className={styles.header}>
              <Title className={styles.title}>Bag</Title>
              <Close asChild>
                <button className={styles.closeBtn} aria-label="Close">
                  <XMarkIcon className={styles.closeIcon} />
                </button>
              </Close>
            </div>
            <div className={styles.contentBody}>
              <div className={styles.sidebar}>
                <button className={classNames(styles.sidebarBtn, styles.active)}>Cards</button>
                <button className={styles.sidebarBtn} disabled>
                  Item
                </button>
                <button className={styles.sidebarBtn} disabled>
                  Materials
                </button>
              </div>
              <div className={styles.mainContent}>
                <div className={styles.cardsHeader}>
                  <div className={styles.searchBox}>
                    <MagnifyingGlassIcon className={styles.searchIcon} />
                    <input
                      className={styles.searchInput}
                      type="text"
                      placeholder="search for cards"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className={styles.raritySelect}
                    value={rarity}
                    onChange={(e) => {
                      const value = e.target.value
                      if (value === 'all') {
                        setRarity('all')
                      } else {
                        setRarity(Number(value))
                      }
                    }}
                  >
                    {RarityOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.cardsList}>
                  {filteredCards.length === 0 ? (
                    <div className={styles.emptyTip}>no cards</div>
                  ) : (
                    <div className={styles.cardsGrid}>
                      {filteredCards.map((card) => {
                        const selected = selectedIds.includes(card.id)
                        return (
                          <div
                            key={card.id}
                            className={classNames(
                              styles.cardItem,
                              isEdit && selected && styles.selectedCard,
                            )}
                            onClick={() => handleCardClick(card, selected)}
                          >
                            {isEdit && (
                              <button
                                className={classNames(styles.selectBtn, {
                                  [styles.selectedBtn]: selected,
                                })}
                                type="button"
                              >
                                {selected ? '✓' : ''}
                              </button>
                            )}
                            <StaticCard card={card}></StaticCard>
                            <div className={styles.cardCount}>x{card.count}</div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                {isEdit && (
                  <div className={styles.footerBar}>
                    <button className={styles.confirmBtn} onClick={handleConfirmButtonClick}>
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(CardsBagModal)

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
    appStore: { cardsBag },
    modalStore: { cardsBagModalVisible, changeCardsBagModalVisible, cardsBagModalType },
  } = useMobxStore()
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

  return (
    <Dialog open={cardsBagModalVisible} onOpenChange={changeCardsBagModalVisible}>
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
                      {filteredCards.map((card) => (
                        <div
                          key={card.id}
                          className={classNames(styles.cardItem, styles[`rarity_${card.rarity}`])}
                        >
                          <img src={card.imageUrl} alt={card.name} className={styles.cardImage} />
                          <div className={styles.cardCount}>x{card.count}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(CardsBagModal)

import { observer } from 'mobx-react-lite'
import React, { useMemo, useState } from 'react'
import styles from './BagModalItemsContent.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import classNames from 'classnames'
import type { MyMagicItem } from '@/axios/api.ts'

const BagModalItemsContent: React.FC = () => {
  const {
    rewardStore: { magicItems, consumeMagicItem },
  } = useMobxStore()
  const [buttonLoadingId, setButtonLoadingId] = useState(new Map<number, boolean>())
  const myMagicItems = useMemo(() => magicItems.filter((item) => item.owned > 0), [magicItems])

  const handleUseItem = async (item: MyMagicItem) => {
    if (buttonLoadingId.get(item.id)) return
    setButtonLoadingId((prevState) => prevState.set(item.id, true))
    try {
      await consumeMagicItem(item)
    } catch (error) {
      console.error('Use item error:', error)
    } finally {
      setButtonLoadingId((prevState) => prevState.set(item.id, false))
    }
  }

  return (
    <div className={styles.content}>
      {myMagicItems.length ? (
        <div className={styles.itemsList}>
          {myMagicItems.map((item) => {
            const isButtonLoading = buttonLoadingId.get(item.id) || false
            return (
              <div key={item.id}>
                <div>{item.name}</div>
                <div>{item.description}</div>
                <div>{`You got ${item.owned} of this.`}</div>
                <button
                  className={classNames({ button: !isButtonLoading })}
                  onClick={() => handleUseItem(item)}
                  disabled={isButtonLoading}
                >
                  Use One
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className={styles.noData}>You don't have any items</div>
      )}
    </div>
  )
}
export default observer(BagModalItemsContent)

import { observer } from 'mobx-react-lite'
import React, { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import classNames from 'classnames'
import styles from './ShopModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import API, { type ShopItem } from '@/axios/api.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { toast } from 'react-toastify'

const ShopModalContent: React.FC<{
  shopItems: Array<ShopItem>
  setShopItems: Dispatch<SetStateAction<ShopItem[]>>
}> = ({ shopItems, setShopItems }) => {
  const {
    appStore: { userInfo, updateUserInfo },
  } = useMobxStore()

  useEffect(() => {
    console.log('Modal content mounted')
    return () => {
      console.log('Modal content unmounted')
    }
  }, [])

  const handleBuyItem = async (item: ShopItem) => {
    if (!userInfo) return
    if (userInfo.solAmount < item.price) {
      return toast.error('Insufficient balance to buy this item.')
    }
    if (item.dailyLimit > 0 && item.todayPurchased >= item.dailyLimit) {
      return toast.error('You have reached the daily purchase limit for this item.')
    }
    const result = await API.buyShopItem(item.id)
    if (result?.data?.user?.email === userInfo.email) {
      updateUserInfo(result.data.user)
      toast.success(`Successfully purchased ${item.name}!`)
      // 更新今日已购买数量
      setShopItems((prevItems) =>
        prevItems.map((i) =>
          i.id === item.id ? { ...i, todayPurchased: i.todayPurchased + 1 } : i,
        ),
      )
    }
  }

  return (
    <div className={styles.contentContainer}>
      {shopItems.map((item) => (
        <div key={item.id} className={styles.itemContainer}>
          <img src={item.image} alt={item.name} className={styles.itemImage} />
          <h3 className={styles.itemName}>{item.name}</h3>
          <p className={styles.itemPrice}>Price: {item.price} Faith</p>
          <button className={styles.buyButton} onClick={() => handleBuyItem(item)}>
            Buy
            {item.dailyLimit > 0 ? (
              <span>{`${item.todayPurchased}/${item.dailyLimit}`}</span>
            ) : null}
          </button>
        </div>
      ))}
    </div>
  )
}

interface IShopModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ShopModal: React.FC<IShopModalProps> = ({ open, onOpenChange }) => {

  return shopItems.length ? (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            <Title>Shop</Title>
            <Description>Come and Buy</Description>
            <ShopModalContent shopItems={shopItems} setShopItems={setShopItems}></ShopModalContent>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  ) : null
}
export default observer(ShopModal)

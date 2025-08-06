import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import classNames from 'classnames'
import styles from '@/components/RedeemCodeModal.module.css'
import { Content, Description, Dialog, DialogOverlay, Portal, Title } from '@radix-ui/react-dialog'
import { useQuery } from '@tanstack/react-query'
import API from '@/axios/api.ts'

const ShopModalContent = () => {
  useEffect(() => {
    console.log('Modal content mounted')
    return () => {
      console.log('Modal content unmounted')
    }
  }, [])
  return (
    <div>
      <Title>123</Title>
      <Description>123123</Description>
    </div>
  )
}

interface IShopModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ShopModal: React.FC<IShopModalProps> = ({ open, onOpenChange }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['shopItems'],
    queryFn: API.getShopItems,
    refetchInterval: 5 * 60 * 1000, // 每5分钟刷新一次
    refetchOnWindowFocus: false,
  })
  console.log('Shop items data:', isLoading, data)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Portal>
        <DialogOverlay className={classNames(styles.overlay)}>
          <Content className={styles.modalContent}>
            <ShopModalContent></ShopModalContent>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(ShopModal)

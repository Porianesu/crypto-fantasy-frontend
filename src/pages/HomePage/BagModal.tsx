import { observer } from 'mobx-react-lite'
import React from 'react'
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
import styles from './BagModal.module.css'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import { ICardsBagModalType } from '@/stores/modal-store.ts'
import BagModalCardsContent from '@/pages/HomePage/BagModalCardsContent.tsx'
import BagModalItemsContent from '@/pages/HomePage/BagModalItemsContent.tsx'

const Tabs = [
  {
    label: 'Cards',
    key: 'cards',
  },
  {
    label: 'Items',
    key: 'items',
  },
]

const CardsBagContent: React.FC = observer(() => {
  const [selectedTab, setSelectedTab] = React.useState(Tabs[0].key)

  const renderBody = () => {
    switch (selectedTab) {
      case 'cards':
        return <BagModalCardsContent></BagModalCardsContent>
      case 'items':
        return <BagModalItemsContent></BagModalItemsContent>
      default:
        return null
    }
  }

  return (
    <Content className={styles.modalContent}>
      <Title className={styles.title}>Bags</Title>
      <Close asChild>
        <div className={styles.closeBtn} aria-label="Close"></div>
      </Close>
      <div className={styles.contentBody}>
        <div className={styles.sidebar}>
          {Tabs.map((tab) => (
            <button
              key={tab.key}
              className={classNames(styles.sidebarBtn, {
                [styles.active]: selectedTab === tab.key,
                ['button']: selectedTab !== tab.key,
              })}
              onClick={() => setSelectedTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {renderBody()}
      </div>
    </Content>
  )
})

const BagModal = () => {
  const {
    modalStore: { bagModalData, changeBagModalData },
  } = useMobxStore()
  return (
    <Dialog
      open={bagModalData.visible}
      onOpenChange={(visible) => {
        changeBagModalData({
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
          <CardsBagContent></CardsBagContent>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(BagModal)

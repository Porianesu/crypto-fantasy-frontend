import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './BattleModal.module.css'
import { useNavigate } from 'react-router-dom'
import { getTournamentPath } from '@/navigation/routes.tsx'
import classNames from 'classnames'
import {
  Close,
  Content,
  Description,
  Dialog,
  DialogOverlay,
  Portal,
  Title,
} from '@radix-ui/react-dialog'
import { useMobxStore } from '@/stores/StoreProvider.tsx'
import tradingAbyssIcon from '@/assets/images/home_page/battle_modal/trading_abyss_icon.png'
import arenaDuelIcon from '@/assets/images/home_page/battle_modal/arena_duel_icon.png'
import tournamentIcon from '@/assets/images/home_page/battle_modal/tournament_icon.png'

const BattleModal: React.FC = () => {
  const {
    modalStore: { battleModalVisible, changeBattleModalVisible },
  } = useMobxStore()
  const navigate = useNavigate()
  const handleTournamentClick = () => {
    changeBattleModalVisible(false)
    navigate(getTournamentPath())
  }
  // mock 数据
  const blocks = [
    {
      key: 'tournament',
      title: 'Tournament',
      desc: 'Participate in regular tournaments and compete for the leaderboard.',
      btn: 'Join Now',
      onClick: handleTournamentClick,
      disabled: false,
      icon: tournamentIcon,
    },
    {
      key: 'abyss',
      title: 'Trading Abyss',
      desc: 'Battle ancient Chainspirits, uncover lost stories, and collect epic rewards.',
      btn: 'Coming Soon',
      onClick: undefined,
      disabled: true,
      icon: tradingAbyssIcon,
    },
    {
      key: 'arena',
      title: 'Arena Duel',
      desc: 'Battle other players in real time and experience strategy and luck.',
      btn: 'Coming Soon',
      onClick: undefined,
      disabled: true,
      icon: arenaDuelIcon,
    },
  ]
  return (
    <Dialog open={battleModalVisible} onOpenChange={changeBattleModalVisible}>
      <Portal>
        <DialogOverlay
          className={classNames(
            'data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out',
            styles.overlay,
          )}
        >
          <Content className={styles.contentContainer}>
            <Title className={styles.title}>Battle</Title>
            <Description></Description>
            <Close asChild={true}>
              <div className={classNames('button', styles.closeButton)}></div>
            </Close>
            <div className={styles.blocksWrapper}>
              {blocks.map((b) => (
                <div className={styles.block} key={b.key}>
                  <div className={styles.blockContent}>
                    <div className={styles.blockTitle}>{b.title}</div>
                    <div
                      className={styles.blockImage}
                      style={{
                        backgroundImage: `url(${b.icon})`,
                      }}
                    ></div>
                    <div className={styles.blockDesc}>{b.desc}</div>
                  </div>
                  <button
                    className={classNames(styles.blockBtn, {
                      button: !b.disabled,
                      [styles.blockBtnDisabled]: b.disabled,
                    })}
                    onClick={b.disabled ? undefined : b.onClick}
                    disabled={b.disabled}
                  >
                    <div>{b.btn}</div>
                  </button>
                </div>
              ))}
            </div>
          </Content>
        </DialogOverlay>
      </Portal>
    </Dialog>
  )
}
export default observer(BattleModal)

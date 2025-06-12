import { observer } from 'mobx-react-lite'
import React from 'react'
import styles from './BattleModal.module.css'
import { useNavigate } from 'react-router-dom'
import { getTournamentPath, getHomePath } from '@/navigation/routes.tsx'

const BattleModal: React.FC = () => {
  const navigate = useNavigate()
  const handleBack = () => navigate(getHomePath())
  const handleTournamentClick = () => {
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
      tag: null,
      disabled: false,
    },
    {
      key: 'abyss',
      title: 'Trading Abyss',
      desc: 'Challenge AI stages and win generous rewards.',
      btn: 'Coming Soon',
      onClick: undefined,
      tag: 'PVE',
      disabled: true,
    },
    {
      key: 'arena',
      title: 'Arena Duel',
      desc: 'Battle other players in real time and experience strategy and luck.',
      btn: 'Coming Soon',
      onClick: undefined,
      tag: 'PVP',
      disabled: true,
    },
  ]
  return (
    <div className={styles.pageContainer}>
      <button className={styles.backButton} onClick={handleBack} />
      <div className={styles.blocksWrapper}>
        {blocks.map((b) => (
          <div
            className={
              styles.block +
              ' ' +
              (b.key === 'tournament'
                ? styles.tournamentBlock
                : b.key === 'abyss'
                  ? styles.abyssBlock
                  : styles.arenaBlock)
            }
            key={b.key}
          >
            {b.tag && <div className={styles.blockTag}>{b.tag}</div>}
            <div className={styles.blockTitle}>{b.title}</div>
            <div className={styles.blockDesc}>{b.desc}</div>
            <button
              className={styles.blockBtn + (b.disabled ? ' ' + styles.blockBtnDisabled : '')}
              onClick={b.disabled ? undefined : b.onClick}
              disabled={b.disabled}
            >
              {b.btn}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default observer(BattleModal)

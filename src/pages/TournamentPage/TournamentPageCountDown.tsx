import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'
import styles from './TournamentPageCountDown.module.css'
import FlipNumbers from 'react-flip-numbers'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
dayjs.extend(duration)

interface ITournamentPageCountDownProps {
  currentPrizePool: IPrizePool | undefined
}

const TournamentPageCountDown: React.FC<ITournamentPageCountDownProps> = ({ currentPrizePool }) => {
  const DEFAULT_COUNTDOWN = {
    days: '00',
    minutes: '00',
    seconds: '00',
  }
  const [countdown, setCountdown] = React.useState(DEFAULT_COUNTDOWN)
  const NUMBER_COLOR = '#734319'
  const NUMBER_HEIGHT = 40
  const NUMBER_WIDTH = 30
  useEffect(() => {
    if (!currentPrizePool || currentPrizePool.status !== PRIZE_POOL_STATUS.PROCESSING) {
      setCountdown(DEFAULT_COUNTDOWN)
      return
    }
    const updateCountdown = () => {
      const now = dayjs()
      const end = dayjs(currentPrizePool.end_date)
      const diff = end.diff(now, 'second')
      if (diff <= 0) {
        setCountdown(DEFAULT_COUNTDOWN)
        return
      }
      const d = dayjs.duration(diff, 'seconds')
      const days = String(Math.floor(d.asHours())).padStart(2, '0')
      const minutes = String(d.minutes()).padStart(2, '0')
      const seconds = String(d.seconds()).padStart(2, '0')
      setCountdown({ days, minutes, seconds })
    }
    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [currentPrizePool])

  return currentPrizePool?.status === PRIZE_POOL_STATUS.PROCESSING ? (
    <div className={styles.prizeCountdown}>
      <div className={styles.title}>Countdown</div>
      <div className={styles.numberContainer}>
        <FlipNumbers
          color={NUMBER_COLOR}
          numbers={countdown.days}
          play={true}
          height={NUMBER_HEIGHT}
          width={NUMBER_WIDTH}
        ></FlipNumbers>
        <FlipNumbers
          color={NUMBER_COLOR}
          numbers={countdown.minutes}
          play={true}
          height={NUMBER_HEIGHT}
          width={NUMBER_WIDTH}
        ></FlipNumbers>
        <FlipNumbers
          color={NUMBER_COLOR}
          numbers={countdown.seconds}
          play={true}
          height={NUMBER_HEIGHT}
          width={NUMBER_WIDTH}
        ></FlipNumbers>
      </div>
    </div>
  ) : null
}
export default observer(TournamentPageCountDown)

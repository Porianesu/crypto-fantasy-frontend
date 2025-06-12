import { type IPrizePool, PRIZE_POOL_STATUS } from '@/pages/TournamentPage/TournamentPage.tsx'
import dayjs from 'dayjs'
import { generateFantasyEnglishName, getDefaultAvatar } from '@/utils/common.ts'

export const fetchHomeLeaderboard = async () => {
  const originalData = Array.from({ length: 20 }).map((_, i) => ({
    name: generateFantasyEnglishName(),
    score: Math.floor(Math.random() * 450),
    avatar: getDefaultAvatar(i),
  }))
  return new Promise<Array<{ name: string; score: number; avatar: string }>>((resolve) => {
    setTimeout(() => {
      resolve(originalData)
    }, 1000)
  })
}

export const fetchPrizePoolLeaderboard = async () => {
  const originalData = Array.from({ length: 20 }).map((_, i) => ({
    name: generateFantasyEnglishName(),
    score: Math.floor(Math.random() * 990),
    avatar: getDefaultAvatar(i),
  }))
  return new Promise<Array<{ name: string; score: number; avatar: string }>>((resolve) => {
    setTimeout(() => {
      resolve(originalData)
    }, 1000)
  })
}

export const fetchPrizePools = async () => {
  return new Promise<Array<IPrizePool>>((resolve) => {
    const today = dayjs().startOf('day')
    const getRandomPrice = () =>
      new BigNumber(Math.random() * 490).plus(10).decimalPlaces(2).toNumber()
    resolve([
      {
        id: 0,
        start_date: today.subtract(9, 'day').valueOf(),
        end_date: today.subtract(7, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.END,
      },
      {
        id: 1,
        start_date: today.subtract(6, 'day').valueOf(),
        end_date: today.subtract(4, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.END,
      },
      {
        id: 2,
        start_date: today.subtract(3, 'day').valueOf(),
        end_date: today.subtract(1, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.END,
      },
      {
        id: 3,
        start_date: today.valueOf(),
        end_date: today.add(2, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.PROCESSING,
      },
      {
        id: 4,
        start_date: today.add(3, 'day').valueOf(),
        end_date: today.add(5, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.UPCOMING,
      },
    ])
  })
}

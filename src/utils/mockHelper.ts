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

/**
 * 计算某名次应��得的奖金和FaithCoin
 * @param totalPrize 总奖金
 * @param rank 当前名次（从1开始）
 * @param totalPlayers 总参与人数
 * @returns { prize: number, faithCoin: number }
 */
export function calculatePrizeAndCoin(totalPrize: number, rank: number, totalPlayers: number) {
  if (rank < 1 || rank > totalPlayers) return { prize: 0, faithCoin: 0 }

  // FaithCoin奖励区间
  const top10Percent = Math.ceil(totalPlayers * 0.1)
  const top30Percent = Math.ceil(totalPlayers * 0.3)
  const top60Percent = Math.ceil(totalPlayers * 0.6)

  // 奖金分配
  if (rank === 1) {
    return { prize: totalPrize * 0.4, faithCoin: 10000 }
  } else if (rank === 2) {
    return { prize: totalPrize * 0.3, faithCoin: 7000 }
  } else if (rank === 3) {
    return { prize: totalPrize * 0.2, faithCoin: 4000 }
  } else if (rank >= 4 && rank <= 10) {
    // 4-10名平分10%奖金
    return { prize: (totalPrize * 0.1) / 7, faithCoin: 2000 }
  } else if (rank >= 11 && rank <= top10Percent) {
    return { prize: 0, faithCoin: 400 }
  } else if (rank > top10Percent && rank <= top30Percent) {
    return { prize: 0, faithCoin: 300 }
  } else if (rank > top30Percent && rank <= top60Percent) {
    return { prize: 0, faithCoin: 200 }
  } else {
    return { prize: 0, faithCoin: 100 }
  }
}

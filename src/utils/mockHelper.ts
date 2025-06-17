import { type IPrizePool, PRIZE_POOL_STATUS } from '@/types/TournamentPageTypes.ts'
import dayjs from 'dayjs'
import { generateFantasyEnglishName, getDefaultAvatar } from '@/utils/common.ts'
import { BigNumber } from 'bignumber.js'
import type { UserInfo } from '@/stores/app-store.ts'

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

export const fetchPrizePools = async () => {
  return new Promise<Array<IPrizePool>>((resolve) => {
    const today = dayjs().startOf('day')
    const getRandomPrice = () =>
      new BigNumber(Math.random() * 490).plus(10).decimalPlaces(2).toNumber()
    const getRandomPlayerCount = () => Math.floor(Math.random() * 100) + 1
    const getRandomFormation = () => Array.from({ length: 5 }, () => Math.floor(Math.random() * 80))
    const getRandomDeckPower = () => Math.floor(Math.random() * 991)
    const data = [
      {
        id: 0,
        start_date: today.subtract(9, 'day').valueOf(),
        end_date: today.subtract(7, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.END,
        player_count: getRandomPlayerCount(),
      },
      {
        id: 1,
        start_date: today.subtract(6, 'day').valueOf(),
        end_date: today.subtract(4, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.END,
        player_count: getRandomPlayerCount(),
      },
      {
        id: 2,
        start_date: today.subtract(3, 'day').valueOf(),
        end_date: today.subtract(1, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.END,
        player_count: getRandomPlayerCount(),
      },
      {
        id: 3,
        start_date: today.valueOf(),
        end_date: today.add(2, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.PROCESSING,
        player_count: getRandomPlayerCount(),
      },
      {
        id: 4,
        start_date: today.add(3, 'day').valueOf(),
        end_date: today.add(5, 'day').endOf('day').valueOf(),
        price: getRandomPrice(),
        status: PRIZE_POOL_STATUS.UPCOMING,
        player_count: getRandomPlayerCount(),
      },
    ]
    // 随机为非UPCOMING奖池生成当前用户参与信息
    const result = data.map((pool) => {
      if (
        pool.status === PRIZE_POOL_STATUS.PROCESSING ||
        (pool.status === PRIZE_POOL_STATUS.END && Math.random() < 0.5)
      ) {
        return {
          ...pool,
          user_participated: true,
          user_card_formation: getRandomFormation(),
          user_deck_power: getRandomDeckPower(),
        }
      }
      return {
        ...pool,
        user_participated: false,
      }
    })
    resolve(result)
  })
}

/**
 * 计算某名次应��得的奖金和FaithCoin
 * @param totalSol 总奖金
 * @param rank 当前名次（从1开始）
 * @param totalPlayers 总参与人数
 * @returns { prize: number, faithCoin: number }
 */
export function calculateSolAndCoin(totalSol: number, rank: number, totalPlayers: number) {
  if (rank < 1 || rank > totalPlayers) return { sol: 0, faithCoin: 0 }

  // FaithCoin奖励区间
  const top10Percent = Math.ceil(totalPlayers * 0.1)
  const top30Percent = Math.ceil(totalPlayers * 0.3)
  const top60Percent = Math.ceil(totalPlayers * 0.6)

  // 奖金分配
  if (rank === 1) {
    return { sol: totalSol * 0.4, faithCoin: 10000 }
  } else if (rank === 2) {
    return { sol: totalSol * 0.3, faithCoin: 7000 }
  } else if (rank === 3) {
    return { sol: totalSol * 0.2, faithCoin: 4000 }
  } else if (rank >= 4 && rank <= 10) {
    // 4-10名平分10%奖金
    return { sol: (totalSol * 0.1) / 7, faithCoin: 2000 }
  } else if (rank >= 11 && rank <= top10Percent) {
    return { sol: 0, faithCoin: 400 }
  } else if (rank > top10Percent && rank <= top30Percent) {
    return { sol: 0, faithCoin: 300 }
  } else if (rank > top30Percent && rank <= top60Percent) {
    return { sol: 0, faithCoin: 200 }
  } else {
    return { sol: 0, faithCoin: 100 }
  }
}

export const fetchPrizePoolLeaderboard = async (pool: IPrizePool, userInfo: UserInfo) => {
  return new Promise<
    Array<{
      name: string
      deckPower: number
      avatar: string
      rank: number
      prize: {
        sol: number
        faithCoin: number
      }
      isCurrentUser?: boolean
      user_card_formation?: number[]
    }>
  >((resolve) => {
    // 生成排行榜数据
    const originalData = Array.from({ length: pool.player_count }).map((_, i) => ({
      name: generateFantasyEnglishName(),
      deckPower: Math.floor(Math.random() * 990),
      avatar: getDefaultAvatar(i),
    }))
    // 如果当前用户参与，插入用户数据
    if (pool.user_participated && userInfo) {
      const userDeckPower = pool.user_deck_power ?? Math.floor(Math.random() * 990)
      // 用一个特殊的avatar
      originalData.push({
        name: userInfo.email || 'You',
        deckPower: userDeckPower,
        avatar: userInfo.avatarUrl || getDefaultAvatar(99),
      })
    }
    // 排序，生成rank
    const sorted = originalData.sort((a, b) => b.deckPower - a.deckPower)
    const withRankAndPrize = sorted.map((item, idx) => {
      const rank = idx + 1
      const prize = calculateSolAndCoin(pool.price, rank, pool.player_count)
      return {
        ...item,
        rank,
        prize: {
          sol: prize.sol,
          faithCoin: prize.faithCoin,
        },
      }
    })
    setTimeout(() => {
      resolve(withRankAndPrize)
    }, 1000)
  })
}

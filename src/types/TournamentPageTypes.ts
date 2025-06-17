export enum PRIZE_POOL_STATUS {
  END,
  PROCESSING,
  UPCOMING,
}

export interface IPrizePool {
  id: number
  start_date: number
  end_date: number
  price: number
  status: PRIZE_POOL_STATUS
  player_count: number
  user_participated: boolean
  user_card_formation?: Array<number>
  user_deck_power?: number
}

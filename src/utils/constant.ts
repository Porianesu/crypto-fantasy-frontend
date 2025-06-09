import { CARD_RARITY } from '@/components/Card.tsx'

export const USER_INFO_STORAGE_KEY = 'user_info'
export interface UserStorageInfo {
  email: string
  hasAlreadyReadGuide?: boolean
}

export const RARITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: CARD_RARITY.NORMAL, label: 'Common' },
  { value: CARD_RARITY.RARE, label: 'Rare' },
  { value: CARD_RARITY.EPIC, label: 'Epic' },
  { value: CARD_RARITY.LEGENDARY, label: 'Legendary' },
]

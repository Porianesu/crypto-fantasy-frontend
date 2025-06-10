import * as Popover from '@radix-ui/react-popover'
import React from 'react'
import styles from './RaritySelect.module.css'
import { CARD_RARITY } from '@/components/Card.tsx'

export type RARITY_SELECT_VALUE = CARD_RARITY | 'all'

interface IRaritySelectProps {
  value?: RARITY_SELECT_VALUE
  onChange?: (value: RARITY_SELECT_VALUE) => void
}

export const RARITY_OPTIONS: Array<{
  value: RARITY_SELECT_VALUE
  label: string
}> = [
  { value: 'all', label: 'All' },
  { value: CARD_RARITY.NORMAL, label: 'Common' },
  { value: CARD_RARITY.RARE, label: 'Rare' },
  { value: CARD_RARITY.EPIC, label: 'Epic' },
  { value: CARD_RARITY.LEGENDARY, label: 'Legendary' },
]

const RaritySelect: React.FC<IRaritySelectProps> = ({ value = 'all', onChange }) => {
  const [open, setOpen] = React.useState(false)
  const handleSelect = (val: RARITY_SELECT_VALUE) => {
    onChange?.(val)
    setOpen(false)
  }
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <div className={styles.raritySelectWrapper} tabIndex={0}>
          <div className={styles.raritySelect}>
            {RARITY_OPTIONS.find((opt) => opt.value === value)?.label || value}
          </div>
          <div className={styles.raritySelectIcon}></div>
        </div>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content sideOffset={8} className={styles.selectContent}>
          {RARITY_OPTIONS.map((opt) => (
            <div
              key={opt.value}
              className={styles.selectOption}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
export default RaritySelect

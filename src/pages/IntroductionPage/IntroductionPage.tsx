import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef } from 'react'
import styles from './IntroductionPage.module.css'
import Text, { type ITextHandle } from '@/components/Text.tsx'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import { setStorageUserInfo } from '@/utils/common.ts'

const IntroductionPage: React.FC = () => {
  const navigate = useNavigate()
  const textRef = useRef<ITextHandle>(null)

  const handleTextContainerClick = () => {
    textRef.current?.tweenRef.current?.revert()
  }

  const handleStartButtonClick = () => {
    navigate(getHomePath())
  }

  useEffect(() => {
    setStorageUserInfo({
      hasAlreadyReadGuide: true,
    })
  }, [])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.textContainer} onClick={handleTextContainerClick}>
        <Text
          ref={textRef}
          className={classNames(styles.introduction)}
          splitTextVars={{
            smartWrap: false,
          }}
        >
          {'Since the dawn of Bitcoin, the civilization of blockchain has rapidly \n' +
            "expanded. Satoshi's dream evolvedinto the Interchain Realms-a world \n" +
            'of countless projects coexisting. Each public chain is like acontinent, birthing \n' +
            'unique ecosystems, economic systems, and belief cultures:'}
          <div className={'my-2'} />
          {'・Solana, where speed and frenzy reign,\n' +
            '・Ethereum, master of structure and order,\n' +
            '・Base, the cutting-edge frontier of tech...\n' +
            'For ages, two opposing primal forces have ruled these realms:\n' +
            'The Bullof Fire s.The Bear of Tide\n' +
            'But now...Chaos stirs once more.\n' +
            'Legends speak of a Cryptowalker-one,who wields the "Eye of Asset Control"-destined to lead a"Strategy War" that will alter the fate of the chains.\n' +
            'And you... are the Chosen One.\n' +
            'Follow in their footsteps. Awaken the slumbering Chainspirits. Battle through trading labyrinths. Risevictorious in the Grand Tournament. And ultimately...tame the Bull and Bear, breaking through the Gates of Destiny.'}
        </Text>
      </div>
      <button className={styles.skipButton} onClick={handleStartButtonClick}>
        Start Adventure
      </button>
    </div>
  )
}
export default observer(IntroductionPage)

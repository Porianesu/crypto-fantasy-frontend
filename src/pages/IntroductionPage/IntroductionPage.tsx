import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef } from 'react'
import styles from './IntroductionPage.module.css'
import Text, { type ITextHandle } from '@/components/Text.tsx'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import { setStorageUserInfo } from '@/utils/common.ts'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

const IntroductionPage: React.FC = () => {
  const {
    preloadStore: { audioInstanceMap },
  } = useMobxStore()
  const navigate = useNavigate()
  const textRef = useRef<ITextHandle>(null)
  const bgmSound = audioInstanceMap.get(AudioInstanceId.BGM)
  const introductionSound = audioInstanceMap.get(AudioInstanceId.IntroductionSound)
  const playIntroductionSoundTimer = useRef<number>(null)

  const handleStartButtonClick = () => {
    navigate(getHomePath())
  }

  const playIntroductionSound = () => {
    if (playIntroductionSoundTimer.current) {
      clearTimeout(playIntroductionSoundTimer.current)
    }
    playIntroductionSoundTimer.current = setTimeout(() => {
      if (bgmSound) {
        bgmSound.volume = 0.2
      }
      if (introductionSound) {
        introductionSound.play({
          loop: 0,
          volume: 1,
        })
      }
    }, 300)
  }

  const stopIntroductionSound = () => {
    if (bgmSound) {
      bgmSound.volume = 1
    }
    if (introductionSound) {
      introductionSound.stop()
    }
  }

  const handleTextContainerClick = () => {
    textRef.current?.revertSplitText()
  }

  useEffect(() => {
    setStorageUserInfo({
      hasAlreadyReadGuide: true,
    })
    return () => {
      stopIntroductionSound()
    }
  }, [])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.textContainer} onClick={handleTextContainerClick}>
        <Text
          ref={textRef}
          className={classNames(styles.introduction)}
          splitTextVars={{
            smartWrap: false,
            onSplit: () => {
              playIntroductionSound()
            },
          }}
          animationVars={{
            duration: 0.04,
            stagger: 0.072,
          }}
        >
          Since the dawn of Bitcoin, the civilization of blockchain has rapidly expanded. Satoshi's
          dream evolved into the Interchain Realms - a world of countless projects coexisting.
          <div className={styles.lineDivider} />
          Each public chain is like a continent, birthing unique ecosystems, economic systems, and
          belief cultures:
          <div className={styles.lineDivider} />
          ・Solana, where speed and frenzy reign,
          <div className={styles.lineDivider} />
          ・Ethereum, master of structure and order,
          <div className={styles.lineDivider} />
          ・Base, the cutting-edge frontier of tech...
          <div className={styles.lineDivider} />
          For ages, two opposing primal forces have ruled these realms:
          <div className={styles.lineDivider} />
          The Bull of Fire vs. The Bear of Tide.
          <div className={styles.lineDivider} />
          But now...Chaos stirs once more.
          <div className={styles.lineDivider} />
          Legends speak of a Cryptowalker - one who wields the "Eye of Asset Control"-destined to
          lead a"Strategy War" that will alter the fate of the chains.
          <div className={styles.lineDivider} />
          And you... are the Chosen One.
          <div className={styles.lineDivider} />
          Follow in their footsteps. Awaken the slumbering Chainspirits. Battle through trading
          labyrinths. Risevictorious in the Grand Tournament. And ultimately...tame the Bull and
          Bear, breaking through the Gates of Destiny.
        </Text>
      </div>
      <button className={styles.skipButton} onClick={handleStartButtonClick}>
        Start Adventure
      </button>
    </div>
  )
}
export default observer(IntroductionPage)

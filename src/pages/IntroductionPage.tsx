import { observer } from 'mobx-react-lite'
import React, { useEffect } from 'react'
import styles from './IntroductionPage.module.css'
import Text from '@/components/Text.tsx'
import classNames from 'classnames'
import { useNavigate } from 'react-router-dom'
import { getHomePath } from '@/navigation/routes.tsx'
import { setStorageUserInfo } from '@/utils/common.ts'

const IntroductionPage: React.FC = () => {
  const navigate = useNavigate()
  const handleSkipButtonClick = () => {
    navigate(getHomePath())
  }

  useEffect(() => {
    setStorageUserInfo({
      hasAlreadyReadGuide: true,
    })
  }, [])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.textContainer}>
        <Text className={classNames(styles.introduction)}>
          {
            '    In the beginning was the Word. The Word was close beside God, and the Word was God. 2 In the beginning, he was close beside God.'
          }
          <div className={'my-4'} />
          {
            '    All things came into existence through him; not one thing that exists came into existence without him. 4 Life was in him, and this life was the light of the human race. 5 The light shines in the darkness, and the darkness did not overcome it.'
          }
          <div className={'my-4'} />
          {
            '    There was a man called John, who was sent from God. 7 He came as evidence, to give evidence about the light, so that everyone might believe through him. 8 He was not himself the light, but he came to give evidence about the light.'
          }
          <div className={'my-4'}></div>
          {
            '    The true light, which gives light to every human being, was coming into the world. 10 He was in the world, and the world was made through him, and the world did not know him. 11 He came to what was his own, and his own people did not accept him. 12 But to anyone who did accept him, he gave the right to become God’s children; yes, to anyone who believed in his name. 13 They were not born from blood, or from fleshly desire, or from the intention of a man, but from God.'
          }
        </Text>
      </div>
      <button className={styles.skipButton} onClick={handleSkipButtonClick}>
        Skip
      </button>
    </div>
  )
}
export default observer(IntroductionPage)

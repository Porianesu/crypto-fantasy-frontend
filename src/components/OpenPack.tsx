import { observer } from 'mobx-react-lite'
import React, { useCallback, useImperativeHandle, useRef, useState } from 'react'
import DrawCardsModal from '@/pages/HomePage/DrawCardsModal.tsx'
import PreloadElement, { type IPreloadElementHandle } from '@/components/PreloadElement.tsx'
import styles from './OpenPack.module.css'
import { gsap } from 'gsap'
import type { ICardData } from '@/components/Card.tsx'
import { AudioInstanceId } from '@/stores/preload-store.ts'
import { useMobxStore } from '@/stores/StoreProvider.tsx'

export interface IOpenPackHandle {
  handleOpenPack: () => Promise<Array<ICardData> | void>
}

const OpenPack = React.forwardRef<IOpenPackHandle, any>((_props, ref) => {
  const {
    preloadStore: { audioInstanceMap },
    appStore: { drawCards },
    modalStore: { changeDrawCardsModalVisible },
  } = useMobxStore()
  const bgmSound = audioInstanceMap.get(AudioInstanceId.BGM)
  const drawCardSound = audioInstanceMap.get(AudioInstanceId.DrawCardSound)
  const [cards, setCards] = useState<Array<ICardData>>([])
  const videoRef = useRef<IPreloadElementHandle>(null)

  const playOpenPackAnimation = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (!videoRef.current) {
        reject(new Error('No video element found'))
      }
      gsap.set(videoRef.current!.getContainer(), {
        zIndex: 10,
        width: '100%',
        height: '100%',
      })
      gsap.to(videoRef.current!.getContainer(), {
        autoAlpha: 1,
        duration: 0.3,
        onStart: () => {
          const videoEl = videoRef.current!.getElement() as HTMLVideoElement
          videoEl.loop = false
          videoEl.onended = () => {
            if (bgmSound) {
              bgmSound.volume = 0.5
            }
            gsap.to(videoRef.current!.getContainer(), {
              autoAlpha: 0,
              duration: 0.3,
              onStart: () => {
                gsap.set(videoRef.current!.getContainer(), { zIndex: -1 })
                resolve()
              },
            })
          }
          if (bgmSound) {
            bgmSound.volume = 0.2
          }
          if (drawCardSound) {
            drawCardSound.play({
              volume: 1,
            })
          }
          videoEl.play()
        },
      })
    })
  }, [bgmSound, drawCardSound])

  const handleOpenPack = useCallback(async () => {
    // 重置卡牌元素避免gsap索引不生效
    setCards([])
    const [cards] = await Promise.all([drawCards(), playOpenPackAnimation()])
    if (Array.isArray(cards) && cards?.length) {
      setCards(cards)
      changeDrawCardsModalVisible(true)
      return cards
    }
  }, [changeDrawCardsModalVisible, drawCards, playOpenPackAnimation])

  useImperativeHandle(
    ref,
    () => ({
      handleOpenPack,
    }),
    [handleOpenPack],
  )

  return (
    <>
      <PreloadElement
        ref={videoRef}
        id={'openPackVideo'}
        className={styles.videoContainer}
      ></PreloadElement>
      {cards.length ? <DrawCardsModal cards={cards}></DrawCardsModal> : null}
    </>
  )
})
export default observer(OpenPack)

import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect.tsx'
import { gsap } from 'gsap'
import classNames from 'classnames'

const Text: React.FC<{ text: string }> = ({ text }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const words = useRef<Array<HTMLSpanElement>>([])
  const addWord = (ref: HTMLSpanElement) => {
    words.current.push(ref)
  }
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(words.current, {
        opacity: 0,
        transform: 'translate3d(-20px, 80px, 0px) rotateX(-60deg) rotateY(-20deg) rotateZ(-10deg)',
      })
      const tl = gsap.timeline({})
      tl.to(words.current, {
        opacity: 1,
        transform: 'translate3d(0px, 0px, 0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)',
        duration: 0.5,
        stagger: 0.02,
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])
  return (
    <div
      ref={containerRef}
      className={classNames(
        'max-w-[1200px] mx-auto px-4 py-8 text-white',
        'perspective-midrange',
        'text-2xl',
        'whitespace-pre-wrap',
      )}
    >
      {text.split('').map((word, index) => {
        return (
          <span className={'inline-block'} key={`${word}-${index}`} ref={addWord}>
            {word}
          </span>
        )
      })}
    </div>
  )
}
export default observer(Text)

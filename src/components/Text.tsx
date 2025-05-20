import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import useIsomorphicLayoutEffect from '@/hooks/useIsomorphicLayoutEffect.tsx'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import classNames from 'classnames'
gsap.registerPlugin(SplitText)

const Text: React.FC<{ text: string }> = ({ text }) => {
  const textRef = useRef<HTMLDivElement>(null)
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const split = SplitText.create(textRef.current, {
        type: 'words, lines',
      })
      gsap.from(split.words, {
        opacity: 0,
        transform: 'translate3d(-20px, 80px, 0px) rotateX(-60deg) rotateY(-20deg) rotateZ(-10deg)',
        duration: 1,
        stagger: 0.02,
      })
    }, textRef)
    return () => ctx.revert()
  }, [])
  return (
    <div
      ref={textRef}
      className={classNames(
        'max-w-[1200px] mx-auto px-4 py-8 text-white',
        'perspective-midrange',
        'text-2xl',
        'whitespace-pre-wrap',
      )}
    >
      {text}
    </div>
  )
}
export default observer(Text)

import { observer } from 'mobx-react-lite'
import React, { useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import classNames from 'classnames'

const Text: React.FC<{ text: string }> = ({ text }) => {
  const textRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const split = SplitText.create(textRef.current, {
        type: 'words, lines, chars',
        autoSplit: true,
        mask: 'lines',
        onSplit: (self) => {
          return gsap.from(self.words, {
            x: 'random(-100, 100)',
            y: 'random(-100, 100)',
            opacity: 0,
            stagger: 0.1,
            onComplete: () => split.revert(), // <-- restores original innerHTML
          })
          // return gsap.from(self.words, {
          //   opacity: 0,
          //   transform:
          //     'translate3d(-20px, 80px, 0px) rotateX(-60deg) rotateY(-20deg) rotateZ(-10deg)',
          //   duration: 1,
          //   stagger: 0.1,
          // })
        },
      })
    },
    {
      dependencies: [],
      scope: textRef,
      revertOnUpdate: true,
    },
  )
  return (
    <div
      ref={textRef}
      className={classNames(
        'max-w-[1200px] mx-auto px-4 py-8 text-white',
        'perspective-midrange',
        'text-2xl',
        'whitespace-pre-wrap',
        'will-change-transform',
      )}
    >
      {text}
    </div>
  )
}
export default observer(Text)

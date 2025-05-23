import { observer } from 'mobx-react-lite'
import React, { type CSSProperties, type PropsWithChildren, useRef } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import classNames from 'classnames'

interface ITextProps {
  className?: string
  style?: CSSProperties
}
const Text: React.FC<PropsWithChildren<ITextProps>> = ({ children, className, style }) => {
  const textRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      SplitText.create(textRef.current, {
        type: 'words, lines',
        autoSplit: true,
        mask: 'lines',
        wordsClass: 'word',
        linesClass: 'line',
        reduceWhiteSpace: false,
        onSplit: (self) => {
          // return gsap.from(self.words, {
          //   opacity: 0,
          //   duration: 0.6,
          //   yPercent: 'random([-150, 150])',
          //   xPercent: 'random([-150, 150])',
          //   stagger: 0.1,
          //   ease: 'power3.out',
          //   onComplete: () => self.revert(), // <-- restores original innerHTML
          // })
          return gsap.from(self.words, {
            opacity: 0,
            transform:
              'translate3d(-20px, 80px, 0px) rotateX(-60deg) rotateY(-20deg) rotateZ(-10deg)',
            duration: 1,
            stagger: 0.1,
            onUpdate: (...args) => {
              console.log('on Update', args)
            },
            onComplete: () => self.revert(), // <-- restores original innerHTML
          })
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
      className={classNames('will-change-transform', 'perspective-midrange', className)}
      style={style}
    >
      {children}
    </div>
  )
}
export default observer(Text)

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
        type: 'chars',
        autoSplit: true,
        // mask: 'lines',
        smartWrap: true,
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
          // return gsap.from(self.words, {
          //   opacity: 0,
          //   transform:
          //     'translate3d(-20px, 80px, 0px) rotateX(-60deg) rotateY(-20deg) rotateZ(-10deg)',
          //   duration: 1,
          //   stagger: 0.1,
          //   onComplete: () => self.revert(), // <-- restores original innerHTML
          // })
          return gsap.from(self.chars, {
            opacity: 0,
            y: 10,
            duration: 0.05,
            stagger: 0.04,
            ease: 'power1.out',
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

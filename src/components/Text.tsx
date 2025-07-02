import React, {
  type CSSProperties,
  type PropsWithChildren,
  useImperativeHandle,
  useRef,
} from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { SplitText } from 'gsap/SplitText'
import classNames from 'classnames'

export interface ITextHandle {
  splitTextRef: React.RefObject<SplitText | null>
  tweenRef: React.RefObject<gsap.core.Tween | null>
  revertSplitText: () => void
}
interface ITextProps {
  className?: string
  style?: CSSProperties
  splitTextVars?: Partial<SplitText.Vars>
  animationVars?: Partial<SplitText.Vars>
}
const Text = React.forwardRef<ITextHandle, PropsWithChildren<ITextProps>>(
  ({ children, className, splitTextVars, style, animationVars }, ref) => {
    const textRef = useRef<HTMLDivElement>(null)
    const splitTextRef = useRef<SplitText>(null)
    const tweenRef = useRef<gsap.core.Tween>(null)

    const revertSplitText = () => {
      if (tweenRef.current) {
        tweenRef.current.kill()
      }
      if (splitTextRef.current) {
        splitTextRef.current.revert()
      }
    }

    useGSAP(
      () => {
        splitTextRef.current = SplitText.create(textRef.current, {
          type: 'chars',
          autoSplit: true,
          // mask: 'lines',
          smartWrap: true,
          wordsClass: 'word',
          linesClass: 'line',
          reduceWhiteSpace: false,
          ...splitTextVars,
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
            tweenRef.current = gsap.from(self.chars, {
              opacity: 0,
              y: 10,
              duration: 0.05,
              stagger: 0.04,
              ease: 'power1.out',
              ...animationVars,
            })
            if (splitTextVars?.onSplit) {
              splitTextVars.onSplit(self)
            }
            return tweenRef.current
          },
        })
      },
      {
        dependencies: [],
        scope: textRef,
        revertOnUpdate: true,
      },
    )

    useImperativeHandle(ref, () => ({ splitTextRef, tweenRef, revertSplitText }), [])

    return (
      <div
        ref={textRef}
        className={classNames('will-change-transform', 'perspective-midrange', className)}
        style={style}
      >
        {children}
      </div>
    )
  },
)

export default Text

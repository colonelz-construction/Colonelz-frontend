import { useRef, useState, useEffect } from 'react'
import classNames from 'classnames'
import type { CommonProps } from '@/@types/common'
import type { HTMLAttributes } from 'react'

interface StickyHeaderProps
  extends CommonProps,
    HTMLAttributes<HTMLDivElement> {
  stickyClass?: string
}

const StickyHeader = (props: StickyHeaderProps) => {
  const { children, className, stickyClass, ...rest } = props

  const [isSticky, setIsSticky] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cachedRef = ref.current
    const observer = new IntersectionObserver(
      ([e]) => setIsSticky(e.intersectionRatio < 1),
      {
        threshold: [1],
      }
    )

    observer.observe(cachedRef as Element)

    return () => {
      observer.unobserve(cachedRef as Element)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={classNames(
        'sticky top-0 z-10', // Make the header sticky at the top
        className,
        isSticky && stickyClass
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export default StickyHeader

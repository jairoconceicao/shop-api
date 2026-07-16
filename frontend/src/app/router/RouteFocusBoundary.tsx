import { type PropsWithChildren, useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

function currentPageHeading(previous: HTMLElement | null, pathname: string) {
  const heading = document.querySelector<HTMLElement>('main h1')
  return heading?.isConnected
    && (heading !== previous || heading.dataset.routePathname !== pathname)
    ? heading
    : null
}

export function RouteFocusBoundary({ children }: PropsWithChildren) {
  const { pathname } = useLocation()
  const initialPathname = useRef<string | null>(null)
  const previousHeading = useRef<HTMLElement | null>(null)

  useLayoutEffect(() => {
    if (initialPathname.current === null) {
      initialPathname.current = pathname
      previousHeading.current = document.querySelector<HTMLElement>('main h1')
      if (previousHeading.current) previousHeading.current.dataset.routePathname = pathname
      return
    }

    let active = true
    let observer: MutationObserver | null = null
    const previous = previousHeading.current
    const focusWhenReady = () => {
      const heading = currentPageHeading(previous, pathname)
      if (!active || !heading) return false
      heading.tabIndex = -1
      heading.dataset.routePathname = pathname
      heading.focus()
      previousHeading.current = heading
      observer?.disconnect()
      return true
    }

    if (!focusWhenReady()) {
      const root = document.getElementById('root') ?? document.body
      observer = new MutationObserver(focusWhenReady)
      observer.observe(root, { childList: true, subtree: true })
    }

    return () => {
      active = false
      observer?.disconnect()
    }
  }, [pathname])

  return children
}

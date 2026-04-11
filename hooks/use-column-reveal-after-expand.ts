'use client'

import { useState, useLayoutEffect, useRef, type RefObject } from 'react'

/**
 * Пока колонка «компактная» (isCompact) — revealFull=false.
 * При выходе из компактного режима сначала false, затем true после transitionend ширины колонки (или таймаут).
 */
export function useColumnRevealAfterExpand(
  isCompact: boolean,
  asideRef: RefObject<HTMLElement | null>,
): boolean {
  const [revealFull, setRevealFull] = useState(true)
  const prevCompactRef = useRef<boolean | null>(null)

  useLayoutEffect(() => {
    const prev = prevCompactRef.current
    prevCompactRef.current = isCompact

    if (isCompact) {
      setRevealFull(false)
      return
    }

    if (prev !== true) {
      setRevealFull(true)
      return
    }

    setRevealFull(false)
    const el = asideRef.current
    if (!el || typeof window === 'undefined') {
      setRevealFull(true)
      return
    }

    let finished = false
    const reveal = () => {
      if (finished) return
      finished = true
      setRevealFull(true)
    }

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.target !== el) return
      if (!['width', 'min-width', 'max-width'].includes(e.propertyName)) return
      reveal()
    }

    el.addEventListener('transitionend', onTransitionEnd)
    const t = window.setTimeout(reveal, 400)
    return () => {
      window.clearTimeout(t)
      el.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [isCompact, asideRef])

  return revealFull
}

'use client'

import { useState, useEffect } from 'react'

/** true когда viewport не шире maxPx (для сжатия колонки «Группы» на главной). */
export function useMediaMaxWidth(maxPx: number): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${maxPx}px)`)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [maxPx])

  return matches
}

/**
 * Гистерезис по ширине окна: «узкий» режим включается при w <= collapseAtPx,
 * обратно «широкий» только при w >= expandAtPx (expandAtPx > collapseAtPx).
 * Между порогами сохраняется предыдущее состояние — полный список групп появляется после заметного расширения окна.
 */
export function useViewportWidthHysteresis(collapseAtPx: number, expandAtPx: number): boolean {
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === 'undefined') return false
    const w = window.innerWidth
    if (w <= collapseAtPx) return true
    if (w >= expandAtPx) return false
    return false
  })

  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setNarrow(prev => {
        if (w <= collapseAtPx) return true
        if (w >= expandAtPx) return false
        return prev
      })
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [collapseAtPx, expandAtPx])

  return narrow
}

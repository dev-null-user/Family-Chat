'use client'

import { useLayoutEffect, useRef, useState } from 'react'

/** Минимальная ширина колонки сайдбара (группы / разделы / списки) для полной строки на lg+. */
export const SIDEBAR_COLUMN_FULL_LAYOUT_MIN_PX = 280

/**
 * На &lt;lg всегда «широко» для строк (мобильная вёрстка).
 * На lg+: «широко» только если колонка ≥ {@link SIDEBAR_COLUMN_FULL_LAYOUT_MIN_PX}.
 */
export function useSidebarColumnWideEnoughForFullRow() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [wideEnoughForFullDesktopRow, setWideEnoughForFullDesktopRow] = useState(false)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el || typeof ResizeObserver === 'undefined') return

    const mql = window.matchMedia('(min-width: 1024px)')

    const sync = () => {
      const isLg = mql.matches
      const w = el.getBoundingClientRect().width
      setWideEnoughForFullDesktopRow(!isLg || w >= SIDEBAR_COLUMN_FULL_LAYOUT_MIN_PX)
    }

    sync()
    const ro = new ResizeObserver(() => sync())
    ro.observe(el)
    mql.addEventListener('change', sync)
    return () => {
      ro.disconnect()
      mql.removeEventListener('change', sync)
    }
  }, [])

  return { rootRef, wideEnoughForFullDesktopRow }
}

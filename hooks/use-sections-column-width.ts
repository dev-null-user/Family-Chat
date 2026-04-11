'use client'

import { useState, useLayoutEffect, useMemo } from 'react'
import type { Section } from '@/lib/types'

const ROW_CHROME_PX = 188
const MIN_COL_PX = 200
const BADGE_SLACK_PX = 28

function maxColPx() {
  if (typeof window === 'undefined') return 480
  return Math.min(480, Math.floor(window.innerWidth * 0.36))
}

function measureSectionsColumnWidth(sections: Section[]): number {
  if (sections.length === 0) return MIN_COL_PX
  if (typeof document === 'undefined') return MIN_COL_PX

  const el = document.createElement('span')
  el.style.cssText =
    'position:absolute;left:-10000px;top:0;white-space:nowrap;visibility:hidden;pointer-events:none;font-size:0.875rem;font-weight:500;line-height:1.25rem'
  el.style.fontFamily = getComputedStyle(document.documentElement).fontFamily
  document.body.appendChild(el)

  let maxText = 0
  for (const s of sections) {
    el.textContent = s.name
    maxText = Math.max(maxText, el.getBoundingClientRect().width)
  }
  document.body.removeChild(el)

  const hasUnread = sections.some(s => s.unreadCount > 0)
  const cap = maxColPx()
  return Math.min(
    Math.max(Math.round(maxText + ROW_CHROME_PX + (hasUnread ? BADGE_SLACK_PX : 0)), MIN_COL_PX),
    cap,
  )
}

export function useSectionsColumnWidthPx(sections: Section[], enabled: boolean): number | null {
  const measureKey = useMemo(
    () =>
      sections.map(s => `${s.name}\u0001${s.unreadCount > 0 ? '1' : '0'}`).join('\u0000'),
    [sections],
  )

  const [px, setPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled) {
      setPx(null)
      return
    }
    const run = () => setPx(measureSectionsColumnWidth(sections))
    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [enabled, measureKey, sections])

  return enabled ? px : null
}

'use client'

import { useState, useLayoutEffect, useMemo } from 'react'
import type { Group } from '@/lib/types'

const ROW_CHROME_PX = 200
/** Карточка группы на max-lg: иконка, отступы, колонка действий */
const ROW_CHROME_MOBILE_CARD_PX = 248
/** Сумма max-lg:px-4 у шапки и области списка (контент уже внутри этих полей) */
const MOBILE_LIST_HORIZONTAL_GUTTER_PX = 32
const MIN_COL_PX = 216
const BADGE_SLACK_PX = 28

export type GroupsColumnMeasureMode = 'desktopRow' | 'mobileCard'

function maxColPx() {
  if (typeof window === 'undefined') return 560
  return Math.min(560, Math.floor(window.innerWidth * 0.42))
}

function measureGroupsColumnWidth(groups: Group[], mode: GroupsColumnMeasureMode = 'desktopRow'): number {
  if (groups.length === 0) return MIN_COL_PX

  if (typeof document === 'undefined') return MIN_COL_PX

  const el = document.createElement('span')
  const font =
    mode === 'mobileCard'
      ? 'font-size:0.9375rem;font-weight:600;line-height:1.25rem'
      : 'font-size:0.875rem;font-weight:600;line-height:1.25rem'
  el.style.cssText = `position:absolute;left:-10000px;top:0;white-space:nowrap;visibility:hidden;pointer-events:none;${font}`
  el.style.fontFamily = getComputedStyle(document.documentElement).fontFamily

  document.body.appendChild(el)

  let maxText = 0
  for (const g of groups) {
    el.textContent = g.name
    maxText = Math.max(maxText, el.getBoundingClientRect().width)
  }
  document.body.removeChild(el)

  const hasUnread = groups.some(g => g.unreadCount > 0)
  const chrome = mode === 'mobileCard' ? ROW_CHROME_MOBILE_CARD_PX : ROW_CHROME_PX
  const gutter = mode === 'mobileCard' ? MOBILE_LIST_HORIZONTAL_GUTTER_PX : 0
  const cap = maxColPx()
  return Math.min(
    Math.max(Math.round(maxText + chrome + gutter + (hasUnread ? BADGE_SLACK_PX : 0)), MIN_COL_PX),
    cap
  )
}

/**
 * Ширина колонки «Группы» по самому длинному названию.
 * При enabled=false возвращает null — ширина задаётся классами (узкий режим).
 */
export function useGroupsColumnWidthPx(
  groups: Group[],
  enabled: boolean,
  mode: GroupsColumnMeasureMode = 'desktopRow',
): number | null {
  const measureKey = useMemo(
    () =>
      groups
        .map(g => `${g.name}\u0001${g.unreadCount > 0 ? '1' : '0'}`)
        .join('\u0000'),
    [groups]
  )

  const [px, setPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled) {
      setPx(null)
      return
    }

    const run = () => setPx(measureGroupsColumnWidth(groups, mode))

    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [enabled, measureKey, groups, mode])

  return enabled ? px : null
}

'use client'

import { useState, useLayoutEffect, useMemo } from 'react'
import type { TaskList } from '@/lib/types'

/** Иконка, отступы, прогресс в строке, шеврон, колонка с карандашом, запас под бейдж — без текста названия */
const ROW_CHROME_PX = 228
const MIN_COL_PX = 208
const BADGE_SLACK_PX = 32

function maxColPx() {
  if (typeof window === 'undefined') return 560
  return Math.min(560, Math.floor(window.innerWidth * 0.42))
}

function measureTaskListsColumnWidth(taskLists: TaskList[]): number {
  if (taskLists.length === 0) return MIN_COL_PX
  if (typeof document === 'undefined') return MIN_COL_PX

  const el = document.createElement('span')
  el.style.cssText =
    'position:absolute;left:-10000px;top:0;white-space:nowrap;visibility:hidden;pointer-events:none;font-size:0.875rem;font-weight:500;line-height:1.25rem'
  el.style.fontFamily = getComputedStyle(document.documentElement).fontFamily
  document.body.appendChild(el)

  let maxText = 0
  for (const tl of taskLists) {
    el.textContent = tl.title
    maxText = Math.max(maxText, el.getBoundingClientRect().width)
  }
  document.body.removeChild(el)

  const hasUnread = taskLists.some(tl => tl.unreadCount > 0)
  const cap = maxColPx()
  return Math.min(
    Math.max(Math.round(maxText + ROW_CHROME_PX + (hasUnread ? BADGE_SLACK_PX : 0)), MIN_COL_PX),
    cap,
  )
}

export function useTaskListsColumnWidthPx(taskLists: TaskList[], enabled: boolean): number | null {
  const measureKey = useMemo(
    () =>
      taskLists.map(tl => `${tl.title}\u0001${tl.unreadCount > 0 ? '1' : '0'}`).join('\u0000'),
    [taskLists],
  )

  const [px, setPx] = useState<number | null>(null)

  useLayoutEffect(() => {
    if (!enabled) {
      setPx(null)
      return
    }
    const run = () => setPx(measureTaskListsColumnWidth(taskLists))
    run()
    window.addEventListener('resize', run)
    return () => window.removeEventListener('resize', run)
  }, [enabled, measureKey, taskLists])

  return enabled ? px : null
}

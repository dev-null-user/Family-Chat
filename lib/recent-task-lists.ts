'use client'

const STORAGE_KEY = 'familyhub.recentTaskLists'
const MAX_ENTRIES = 5

export const RECENT_TASK_LISTS_EVENT = 'familyhub:recent-task-lists'

export interface RecentTaskListEntry {
  groupId: string
  sectionId: string
  taskListId: string
  title: string
  touchedAt: number
}

export function loadRecentTaskLists(): RecentTaskListEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as RecentTaskListEntry[]
    return Array.isArray(parsed) ? parsed.slice(0, MAX_ENTRIES) : []
  } catch {
    return []
  }
}

export function pushRecentTaskList(entry: Omit<RecentTaskListEntry, 'touchedAt'>) {
  if (typeof window === 'undefined') return
  const prev = loadRecentTaskLists().filter(e => e.taskListId !== entry.taskListId)
  const next: RecentTaskListEntry[] = [
    { ...entry, touchedAt: Date.now() },
    ...prev,
  ].slice(0, MAX_ENTRIES)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  window.dispatchEvent(new Event(RECENT_TASK_LISTS_EVENT))
}

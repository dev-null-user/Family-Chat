export type NotificationPreferenceKey = 'tasks' | 'news' | 'support' | 'promo'

export interface NotificationPreferences {
  tasks: boolean
  news: boolean
  support: boolean
  promo: boolean
}

export const defaultNotificationPreferences: NotificationPreferences = {
  tasks: true,
  news: true,
  support: true,
  promo: false,
}

const STORAGE_KEY = 'fh-notification-prefs'

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultNotificationPreferences
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultNotificationPreferences
    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>
    return { ...defaultNotificationPreferences, ...parsed }
  } catch {
    return defaultNotificationPreferences
  }
}

export function saveNotificationPreferences(p: NotificationPreferences): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

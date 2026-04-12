'use client'

import { useMemo, useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/lib/store'
import type { InboxNotification, InboxNavUiHint } from '@/lib/types'
import { Bell } from 'lucide-react'
import { cn, formatDistanceToNow } from '@/lib/utils'

interface NotificationsBellProps {
  className?: string
  /** Переключить вкладки/экраны после применения цели из уведомления */
  onInboxNavigate?: (hint: InboxNavUiHint) => void
}

function notificationKindMeta(
  kind: InboxNotification['target']['kind'],
): { label: string; className: string } {
  switch (kind) {
    case 'chat':
      return {
        label: 'Чат',
        className: 'bg-violet-500/12 text-violet-700 dark:text-violet-300',
      }
    case 'task_list':
    case 'section':
    case 'group':
      return {
        label: 'Задачи',
        className: 'bg-emerald-500/12 text-emerald-800 dark:text-emerald-300',
      }
    case 'news':
      return {
        label: 'Новости',
        className: 'bg-sky-500/12 text-sky-800 dark:text-sky-300',
      }
    case 'support':
      return {
        label: 'Поддержка',
        className: 'bg-amber-500/15 text-amber-900 dark:text-amber-200',
      }
    case 'profile':
      return {
        label: 'Профиль',
        className: 'bg-rose-500/12 text-rose-800 dark:text-rose-300',
      }
    default:
      return { label: '', className: '' }
  }
}

function bucketForNotification(createdAt: Date): 'today' | 'yesterday' | 'older' {
  const now = new Date()
  const t0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const c0 = new Date(createdAt.getFullYear(), createdAt.getMonth(), createdAt.getDate()).getTime()
  const diffDays = Math.round((t0 - c0) / 86400000)
  if (diffDays === 0) return 'today'
  if (diffDays === 1) return 'yesterday'
  return 'older'
}

function targetHint(target: InboxNotification['target']): InboxNavUiHint {
  switch (target.kind) {
    case 'task_list':
      return 'home_task_detail'
    case 'section':
      return 'home_task_lists'
    case 'group':
      return 'home_sections'
    case 'news':
      return 'news'
    case 'support':
      return 'support'
    case 'profile':
      return 'profile'
    case 'chat':
      return 'chat'
  }
}

export function NotificationsBell({ className, onInboxNavigate }: NotificationsBellProps) {
  const [open, setOpen] = useState(false)
  const {
    inboxNotifications,
    markInboxNotificationRead,
    markAllInboxNotificationsRead,
    setNavigationContext,
    setPendingNewsId,
    setPendingSupportNav,
    setSelectedChatPeerId,
  } = useAppStore()

  const sorted = useMemo(
    () => [...inboxNotifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [inboxNotifications]
  )

  const groupedNotifications = useMemo(() => {
    const buckets: Record<'today' | 'yesterday' | 'older', InboxNotification[]> = {
      today: [],
      yesterday: [],
      older: [],
    }
    for (const n of sorted) {
      buckets[bucketForNotification(n.createdAt)].push(n)
    }
    const order: ('today' | 'yesterday' | 'older')[] = ['today', 'yesterday', 'older']
    const titles = { today: 'Сегодня', yesterday: 'Вчера', older: 'Ранее' } as const
    return order
      .filter(k => buckets[k].length > 0)
      .map(k => ({ key: k, title: titles[k], items: buckets[k] }))
  }, [sorted])

  const unreadCount = useMemo(() => inboxNotifications.filter(n => !n.read).length, [inboxNotifications])

  const handleItem = (n: InboxNotification) => {
    markInboxNotificationRead(n.id)
    const t = n.target
    switch (t.kind) {
      case 'task_list':
        setNavigationContext({
          groupId: t.groupId,
          sectionId: t.sectionId,
          taskListId: t.taskListId,
        })
        break
      case 'section':
        setNavigationContext({
          groupId: t.groupId,
          sectionId: t.sectionId,
          taskListId: null,
        })
        break
      case 'group':
        setNavigationContext({
          groupId: t.groupId,
          sectionId: null,
          taskListId: null,
        })
        break
      case 'news':
        setPendingNewsId(t.newsId)
        break
      case 'support':
        setPendingSupportNav({ tab: t.tab, articleId: t.articleId })
        break
      case 'profile':
        break
      case 'chat':
        setSelectedChatPeerId(t.peerId)
        break
    }
    onInboxNavigate?.(targetHint(t))
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className={cn('h-9 w-9 relative', className)}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 min-w-4 px-1 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(100vw-2rem,22rem)] p-0" sideOffset={8}>
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Уведомления</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markAllInboxNotificationsRead()}>
              Прочитать все
            </Button>
          )}
        </div>
        <ScrollArea className="h-[min(24rem,50vh)]">
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8 px-4">Пока нет уведомлений</p>
          ) : (
            <div className="py-1">
              {groupedNotifications.map(group => (
                <div key={group.key}>
                  <p className="sticky top-0 z-[1] bg-popover px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {group.title}
                  </p>
                  <ul>
                    {group.items.map(n => {
                      const meta = notificationKindMeta(n.target.kind)
                      return (
                        <li key={n.id}>
                          <button
                            type="button"
                            className={cn(
                              'w-full border-b border-border/60 text-left transition-colors hover:bg-accent/60',
                              !n.read && 'bg-primary/5'
                            )}
                            onClick={() => handleItem(n)}
                          >
                            <div className="flex items-start gap-2 px-3 py-2.5">
                              {!n.read && (
                                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                              )}
                              <div className={cn('min-w-0 flex-1', n.read && 'pl-3.5')}>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {meta.label && (
                                    <span
                                      className={cn(
                                        'rounded px-1.5 py-0 text-[9px] font-semibold',
                                        meta.className
                                      )}
                                    >
                                      {meta.label}
                                    </span>
                                  )}
                                  <p className="text-sm font-medium leading-snug text-foreground">{n.title}</p>
                                </div>
                                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                                <p className="mt-1 text-[10px] text-muted-foreground/85">
                                  {formatDistanceToNow(n.createdAt)}
                                </p>
                              </div>
                            </div>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

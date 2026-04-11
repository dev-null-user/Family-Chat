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
  } = useAppStore()

  const sorted = useMemo(
    () => [...inboxNotifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    [inboxNotifications]
  )

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
            <ul className="py-1">
              {sorted.map(n => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn(
                      'w-full text-left px-3 py-2.5 hover:bg-accent/60 transition-colors border-b border-border/60 last:border-0',
                      !n.read && 'bg-primary/5'
                    )}
                    onClick={() => handleItem(n)}
                  >
                    <div className="flex items-start gap-2">
                      {!n.read && (
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                      )}
                      <div className={cn('min-w-0 flex-1', n.read && 'pl-3.5')}>
                        <p className="text-sm font-medium text-foreground leading-snug">{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground/80 mt-1">
                          {formatDistanceToNow(n.createdAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

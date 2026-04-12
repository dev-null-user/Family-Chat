'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Home, Newspaper, Headphones, User, MessageCircle } from 'lucide-react'

export type MobileTab = 'home' | 'news' | 'chat' | 'support' | 'profile'

interface MobileNavProps {
  currentTab: MobileTab
  onTabChange: (tab: MobileTab) => void
}

export function MobileNav({ currentTab, onTabChange }: MobileNavProps) {
  const { groups, inboxNotifications, chatThreads } = useAppStore()

  const totalUnread = groups.reduce((sum, g) => sum + g.unreadCount, 0)
  const newsUnread = inboxNotifications.filter(
    n => !n.read && n.target.kind === 'news',
  ).length
  const chatUnread = chatThreads.reduce((sum, t) => sum + t.unreadCount, 0)
  const supportUnread = inboxNotifications.filter(
    n => !n.read && n.target.kind === 'support',
  ).length
  const profileUnread = inboxNotifications.filter(
    n => !n.read && n.target.kind === 'profile',
  ).length

  const navItems = [
    {
      id: 'home' as const,
      label: 'Главная',
      icon: Home,
      badge: totalUnread,
    },
    {
      id: 'news' as const,
      label: 'Новости',
      icon: Newspaper,
      badge: newsUnread,
    },
    {
      id: 'chat' as const,
      label: 'Чат',
      icon: MessageCircle,
      badge: chatUnread,
    },
    {
      id: 'support' as const,
      label: 'Поддержка',
      icon: Headphones,
      badge: supportUnread,
    },
    {
      id: 'profile' as const,
      label: 'Профиль',
      icon: User,
      badge: profileUnread,
    },
  ]

  return (
    <nav
      aria-label="Основная навигация"
      className="w-full shrink-0 rounded-t-2xl border-x border-t border-border/40 bg-background/55 shadow-[0_-8px_32px_-12px_rgba(15,23,42,0.1)] backdrop-blur-md dark:border-white/10 dark:bg-background/40 dark:shadow-[0_-10px_36px_-14px_rgba(0,0,0,0.4)]"
    >
      <div
        className={cn(
          'relative px-1.5 pt-1.5',
          'pb-[max(0.35rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        <div className="relative flex min-h-[3.65rem] w-full items-stretch gap-0.5">
            {navItems.map(item => {
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl py-1 px-0.5',
                    'text-muted-foreground transition-[color,transform,background-color] duration-200 ease-out',
                    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'hover:text-foreground hover:bg-muted/50',
                    isActive &&
                      'bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20 dark:bg-primary/18 dark:ring-primary/25',
                    isActive && 'scale-[1.02]'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-[1.15rem] w-[1.15rem] shrink-0 transition-[stroke-width,transform] duration-200',
                      isActive && 'stroke-[2.35] scale-105'
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'max-w-full truncate text-center text-[9px] font-semibold leading-tight tracking-tight sm:text-[10px]',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="absolute right-0 top-0 flex h-[15px] min-w-[15px] items-center justify-center rounded-full bg-primary px-0.5 text-[8px] font-semibold text-primary-foreground shadow-sm sm:right-0.5 sm:top-0.5 sm:h-4 sm:min-w-4 sm:text-[9px]">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              )
            })}
        </div>
      </div>
    </nav>
  )
}

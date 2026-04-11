'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Home, Newspaper, Headphones, User, MessageCircle } from 'lucide-react'

export type MobileTab = 'home' | 'news' | 'chat' | 'support' | 'profile'

const TAB_ORDER: MobileTab[] = ['home', 'news', 'chat', 'support', 'profile']

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

  const tabCount = TAB_ORDER.length

  const navItems = [
    {
      id: 'home' as const,
      label: '',
      icon: Home,
      badge: totalUnread,
    },
    {
      id: 'news' as const,
      label: '',
      icon: Newspaper,
      badge: newsUnread,
    },
    {
      id: 'chat' as const,
      label: '',
      icon: MessageCircle,
      badge: chatUnread,
    },
    {
      id: 'support' as const,
      label: '',
      icon: Headphones,
      badge: supportUnread,
    },
    {
      id: 'profile' as const,
      label: '',
      icon: User,
      badge: profileUnread,
    },
  ]

  const activeIndex = Math.max(0, TAB_ORDER.indexOf(currentTab))

  return (
    <nav
      aria-label="Основная навигация"
      className="w-full shrink-0 rounded-t-2xl border-x border-t border-border/40 bg-background/45 shadow-[0_-8px_32px_-12px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-background/35 dark:shadow-[0_-10px_36px_-14px_rgba(0,0,0,0.4)]"
    >
      <div
        className={cn(
          'relative px-2 pt-1.5',
          'pb-[max(0.4rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        <div className="relative min-h-[3.35rem] w-full">
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0 min-h-[3.35rem] rounded-2xl',
              'bg-primary/14 shadow-sm ring-1 ring-primary/25',
              'dark:bg-primary/22 dark:ring-primary/30',
              'transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform'
            )}
            style={{
              width: `${100 / tabCount}%`,
              transform: `translateX(calc(${activeIndex} * 100%))`,
            }}
          />
          <div className="relative z-10 flex min-h-[3.35rem] w-full items-stretch">
            {navItems.map(item => {
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-1.5',
                    'text-muted-foreground transition-colors duration-150 ease-out',
                    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'hover:text-foreground',
                    isActive && 'text-primary'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-[1.2rem] w-[1.2rem] shrink-0 transition-[stroke-width,transform] duration-200',
                      isActive && 'stroke-[2.35]'
                    )}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      'max-w-full truncate px-0.5 text-[10px] font-medium leading-none tracking-tight',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </span>
                  {item.badge > 0 && (
                    <span className="absolute right-1 top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[9px] font-semibold text-primary-foreground shadow-sm">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}

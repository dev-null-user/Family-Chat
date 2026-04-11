'use client'

import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Home, Newspaper, Headphones, User } from 'lucide-react'

export type MobileTab = 'home' | 'news' | 'support' | 'profile'

const TAB_ORDER: MobileTab[] = ['home', 'news', 'support', 'profile']

interface MobileNavProps {
  currentTab: MobileTab
  onTabChange: (tab: MobileTab) => void
}

export function MobileNav({ currentTab, onTabChange }: MobileNavProps) {
  const { groups } = useAppStore()

  const totalUnread = groups.reduce((sum, g) => sum + g.unreadCount, 0)

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
      badge: 1,
    },
    {
      id: 'support' as const,
      label: 'Поддержка',
      icon: Headphones,
      badge: 0,
    },
    {
      id: 'profile' as const,
      label: 'Профиль',
      icon: User,
      badge: 0,
    },
  ]

  const activeIndex = Math.max(0, TAB_ORDER.indexOf(currentTab))

  return (
    <nav
      aria-label="Основная навигация"
      className="w-full shrink-0 rounded-t-2xl border-x border-t border-border/40 bg-background/45 shadow-[0_-8px_32px_-12px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:border-white/10 dark:bg-background/35 dark:shadow-[0_-10px_36px_-14px_rgba(0,0,0,0.4)] md:hidden"
    >
      <div
        className={cn(
          'relative px-2 pt-1.5',
          'pb-[max(0.4rem,env(safe-area-inset-bottom,0px))]'
        )}
      >
        <div className="relative h-11 w-full">
          <div
            aria-hidden
            className={cn(
              'pointer-events-none absolute top-0 left-0 h-11 w-1/4 rounded-2xl',
              'bg-primary/14 shadow-sm ring-1 ring-primary/25',
              'dark:bg-primary/22 dark:ring-primary/30',
              'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform'
            )}
            style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
          />
          <div className="relative z-10 flex h-11 w-full items-stretch">
            {navItems.map(item => {
              const isActive = currentTab === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={item.label}
                  title={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    'relative flex min-w-0 flex-1 items-center justify-center rounded-2xl',
                    'text-muted-foreground transition-colors duration-150 ease-out',
                    'hover:text-foreground',
                    isActive && 'text-primary'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-[1.35rem] w-[1.35rem] transition-[stroke-width,transform] duration-200',
                      isActive && 'stroke-[2.35]'
                    )}
                    aria-hidden
                  />
                  {item.badge > 0 && (
                    <span className="absolute right-1 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground shadow-sm">
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

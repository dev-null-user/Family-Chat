'use client'

import { useState, useMemo, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Clock, ChevronRight, Sparkles, Gift, Bell, ArrowLeft } from 'lucide-react'
import { formatDistanceToNow } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  title: string
  excerpt: string
  content: string
  category: 'update' | 'feature' | 'promo'
  date: Date
  author: {
    name: string
    avatar?: string
  }
  isNew?: boolean
}

const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'Новая версия приложения 2.0',
    excerpt: 'Мы полностью обновили интерфейс и добавили множество новых функций для удобной работы с задачами.',
    content: '',
    category: 'update',
    date: new Date(Date.now() - 1000 * 60 * 30),
    author: { name: 'Команда FamilyHub' },
    isNew: true,
  },
  {
    id: '2',
    title: 'Совместный бюджет теперь доступен',
    excerpt: 'Теперь вы можете вести семейный бюджет прямо в приложении. Отслеживайте расходы и планируйте вместе.',
    content: '',
    category: 'feature',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    author: { name: 'Команда FamilyHub' },
  },
  {
    id: '3',
    title: 'Приглашайте друзей и получайте бонусы',
    excerpt: 'За каждого приглашенного друга вы получаете месяц премиум-подписки бесплатно!',
    content: '',
    category: 'promo',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    author: { name: 'Команда FamilyHub' },
  },
  {
    id: '4',
    title: 'Улучшена синхронизация данных',
    excerpt: 'Теперь все изменения синхронизируются мгновенно между всеми устройствами участников группы.',
    content: '',
    category: 'update',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    author: { name: 'Команда FamilyHub' },
  },
  {
    id: '5',
    title: 'Темная тема теперь доступна',
    excerpt: 'По многочисленным просьбам добавили темную тему. Переключайтесь в настройках профиля.',
    content: '',
    category: 'feature',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
    author: { name: 'Команда FamilyHub' },
  },
]

const categoryConfig = {
  update: { label: 'Обновление', icon: Bell, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  feature: { label: 'Новая функция', icon: Sparkles, color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  promo: { label: 'Акция', icon: Gift, color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
}

const glassCard = cn(
  'cursor-pointer rounded-xl border border-border/45 bg-card/50 shadow-sm backdrop-blur-xl transition-[box-shadow,transform] duration-200',
  'hover:border-primary/25 hover:shadow-md active:scale-[0.99] dark:border-white/10 dark:bg-card/35'
)

export function NewsPage() {
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const { pendingNewsId, setPendingNewsId } = useAppStore()

  useEffect(() => {
    if (!pendingNewsId) return
    const item = mockNews.find(x => x.id === pendingNewsId) ?? null
    if (item) setSelectedNews(item)
    setPendingNewsId(null)
  }, [pendingNewsId, setPendingNewsId])

  const sortedNews = useMemo(() => {
    return [...mockNews].sort((a, b) => b.date.getTime() - a.date.getTime())
  }, [])

  if (selectedNews) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-transparent">
        <div className="flex shrink-0 items-center border-b border-border/35 bg-background/45 px-3 py-2 backdrop-blur-md md:px-5">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-1 h-8 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedNews(null)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            <span className="text-xs">Новости</span>
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-lg px-3 py-3 md:max-w-2xl md:px-5 md:py-4">
            <article className="rounded-2xl border border-border/40 bg-card/40 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-card/30">
              <div className="flex flex-wrap items-center gap-2">
                {(() => {
                  const config = categoryConfig[selectedNews.category]
                  return (
                    <Badge variant="secondary" className={cn('text-[10px]', config.color)}>
                      <config.icon className="mr-1 h-3 w-3" />
                      {config.label}
                    </Badge>
                  )
                })()}
                <span className="text-[11px] text-muted-foreground">{formatDistanceToNow(selectedNews.date)}</span>
              </div>
              <h1 className="mt-2 text-base font-bold leading-tight text-foreground md:text-xl">
                {selectedNews.title}
              </h1>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground md:text-sm">{selectedNews.excerpt}</p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground md:text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex
                ea commodo consequat.
              </p>
              <div className="mt-4 flex items-center gap-2 border-t border-border/40 pt-3">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={selectedNews.author.avatar} />
                  <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                    {selectedNews.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{selectedNews.author.name}</span>
              </div>
            </article>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto w-full max-w-lg px-3 pb-2 pt-2 md:max-w-xl md:px-4 md:pt-3">
          <p className="mb-2 text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Лента
          </p>
          <div className="flex flex-col gap-2">
            {sortedNews.map(item => {
              const config = categoryConfig[item.category]
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedNews(item)}
                  className={cn(glassCard, 'w-full text-left')}
                >
                  <div className="flex items-start gap-2.5 p-2.5 md:gap-3 md:p-3">
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg md:h-9 md:w-9', config.color)}>
                      <config.icon className="h-4 w-4 md:h-[1.15rem] md:w-[1.15rem]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex flex-wrap items-center gap-1">
                        <span className={cn('rounded px-1.5 py-0 text-[9px] font-medium', config.color)}>{config.label}</span>
                        {item.isNew && (
                          <span className="rounded bg-primary px-1.5 py-0 text-[9px] font-medium text-primary-foreground">
                            Новое
                          </span>
                        )}
                      </div>
                      <h3 className="line-clamp-2 text-xs font-semibold leading-snug text-foreground sm:text-sm">
                        {item.title}
                      </h3>
                      <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-[11px]">
                        {item.excerpt}
                      </p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3 shrink-0" />
                        {formatDistanceToNow(item.date)}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  BookOpen, 
  Search, 
  Send,
  ChevronRight,
  HelpCircle,
  Users,
  Settings,
  CreditCard,
  Shield,
  ArrowLeft
} from 'lucide-react'
import { cn, formatTime } from '@/lib/utils'
import { useAppStore } from '@/lib/store'

interface Message {
  id: string
  text: string
  isUser: boolean
  timestamp: Date
}

interface KnowledgeArticle {
  id: string
  title: string
  excerpt: string
  category: string
  icon: typeof HelpCircle
}

const knowledgeBase: KnowledgeArticle[] = [
  {
    id: '1',
    title: 'Как создать группу?',
    excerpt: 'Узнайте, как создать новую группу и пригласить участников.',
    category: 'Начало работы',
    icon: Users,
  },
  {
    id: '2',
    title: 'Настройка уведомлений',
    excerpt: 'Как настроить push-уведомления и оповещения по email.',
    category: 'Настройки',
    icon: Settings,
  },
  {
    id: '3',
    title: 'Управление подпиской',
    excerpt: 'Информация о тарифах, оплате и отмене подписки.',
    category: 'Оплата',
    icon: CreditCard,
  },
  {
    id: '4',
    title: 'Безопасность аккаунта',
    excerpt: 'Советы по защите вашего аккаунта и данных.',
    category: 'Безопасность',
    icon: Shield,
  },
  {
    id: '5',
    title: 'Часто задаваемые вопросы',
    excerpt: 'Ответы на самые популярные вопросы пользователей.',
    category: 'FAQ',
    icon: HelpCircle,
  },
]

const initialMessages: Message[] = [
  {
    id: '1',
    text: 'Здравствуйте! Я виртуальный помощник FamilyHub. Чем могу помочь?',
    isUser: false,
    timestamp: new Date(Date.now() - 1000 * 60),
  },
]

export function SupportPage() {
  const { pendingSupportNav, setPendingSupportNav } = useAppStore()
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!pendingSupportNav) return
    setActiveTab(pendingSupportNav.tab === 'chat' ? 'chat' : 'knowledge')
    if (pendingSupportNav.articleId) {
      const art = knowledgeBase.find(a => a.id === pendingSupportNav.articleId)
      if (art) setSelectedArticle(art)
    }
    setPendingSupportNav(null)
  }, [pendingSupportNav, setPendingSupportNav])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: `m${Date.now()}`,
      text: inputValue.trim(),
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    setTimeout(() => {
      const botMessage: Message = {
        id: `m${Date.now() + 1}`,
        text: 'Спасибо за ваше сообщение! Наш специалист скоро свяжется с вами. Если вопрос срочный, попробуйте найти ответ в базе знаний.',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, botMessage])
    }, 1000)
  }

  const filteredArticles = knowledgeBase.filter(
    article =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (selectedArticle) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-transparent">
        <div className="flex shrink-0 items-center border-b border-border/35 bg-background/45 px-3 py-2 backdrop-blur-md md:px-5">
          <Button
            variant="ghost"
            size="sm"
            className="-ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setSelectedArticle(null)}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Назад к базе знаний
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-2xl p-3 md:p-5">
            <article className="space-y-3 rounded-2xl border border-border/40 bg-card/45 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-card/35">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <selectedArticle.icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground">{selectedArticle.category}</span>
              </div>
              <h1 className="text-lg font-bold leading-tight text-foreground sm:text-2xl">{selectedArticle.title}</h1>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-lg">{selectedArticle.excerpt}</p>
              <div className="space-y-3 text-xs leading-relaxed text-muted-foreground sm:space-y-4 sm:text-base">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <h3 className="text-sm font-medium text-foreground sm:text-base">Шаг 1</h3>
                <p>
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <h3 className="text-sm font-medium text-foreground sm:text-base">Шаг 2</h3>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
                </p>
              </div>
            </article>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="shrink-0 border-b border-border/35 bg-background/40 px-3 py-2 backdrop-blur-md md:px-5 md:py-2.5">
          <TabsList className="grid h-10 w-full max-w-md grid-cols-2 gap-1 rounded-xl border border-border/30 bg-muted/40 p-1 dark:bg-muted/30 md:h-9 md:max-w-xs">
            <TabsTrigger
              value="chat"
              aria-label="Чат поддержки"
              className="gap-1.5 rounded-lg px-3 data-[state=active]:shadow-sm md:px-2"
            >
              <MessageCircle className="h-5 w-5 shrink-0 md:h-4" />
              <span className="hidden md:inline">Чат</span>
            </TabsTrigger>
            <TabsTrigger
              value="knowledge"
              aria-label="База знаний"
              className="gap-1.5 rounded-lg px-3 data-[state=active]:shadow-sm md:px-2"
            >
              <BookOpen className="h-5 w-5 shrink-0 md:h-4" />
              <span className="hidden md:inline">База знаний</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="chat"
          className="m-0 flex min-h-0 flex-1 flex-col p-0 focus-visible:outline-none data-[state=inactive]:hidden"
        >
          <div className="flex min-h-0 w-full flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-4 pb-2 pt-3 md:px-6 md:pb-4 md:pt-4">
              <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      'flex max-w-[85%] gap-2 md:max-w-[70%]',
                      message.isUser ? 'ml-auto flex-row-reverse' : ''
                    )}
                  >
                    {!message.isUser && (
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">FH</AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'rounded-2xl px-3 py-2 shadow-sm backdrop-blur-md',
                        message.isUser
                          ? 'rounded-br-sm bg-primary text-primary-foreground'
                          : 'rounded-bl-sm border border-border/35 bg-card/55 text-foreground dark:bg-card/40'
                      )}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p
                        className={cn(
                          'mt-1 text-[10px]',
                          message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Поле ввода внизу колонки чата; нижний бар приложения идёт сразу под main без зазора */}
            <div className="w-full shrink-0 border-t border-border/35 bg-background/45 px-3 py-2 shadow-[0_-6px_24px_-8px_rgba(15,23,42,0.1)] backdrop-blur-xl dark:shadow-[0_-8px_28px_-10px_rgba(0,0,0,0.35)] md:px-5 md:py-2.5">
              <div className="mx-auto flex w-full max-w-3xl gap-2">
                <Input
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  placeholder="Сообщение…"
                  className="h-9 min-w-0 flex-1 border-border/40 bg-background/55 dark:bg-background/40 md:h-10"
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                />
                <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleSendMessage}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="knowledge"
          className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0 focus-visible:outline-none data-[state=inactive]:hidden"
        >
          <div className="shrink-0 border-b border-border/35 bg-background/40 px-3 py-2 backdrop-blur-md md:px-5 md:py-2.5">
            <div className="relative mx-auto w-full max-w-3xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Поиск по базе знаний…"
                className="h-9 border-border/40 bg-background/50 pl-9 dark:bg-background/35 md:h-10"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 md:px-5">
            <div className="mx-auto max-w-3xl space-y-2">
              {filteredArticles.map(article => (
                <Card
                  key={article.id}
                  className="cursor-pointer rounded-xl border-border/40 bg-card/50 shadow-sm backdrop-blur-xl transition-shadow hover:shadow-md dark:border-white/10 dark:bg-card/35"
                  onClick={() => setSelectedArticle(article)}
                >
                  <CardContent className="p-2.5 md:p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <article.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-sm font-medium text-foreground">{article.title}</h3>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{article.excerpt}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

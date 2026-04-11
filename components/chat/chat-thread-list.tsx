'use client'

import { useMemo, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/lib/store'
import { mockUsers } from '@/lib/mock-data'
import { userMatchesChatQuery } from '@/lib/chat-search'
import type { User } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'

interface ChatThreadListProps {
  onSelectPeer: (peerId: string) => void
  selectedPeerId: string | null
}

export function ChatThreadList({ onSelectPeer, selectedPeerId }: ChatThreadListProps) {
  const { currentUser, chatThreads, ensureChatThread } = useAppStore()
  const [query, setQuery] = useState('')

  const contacts = useMemo(
    () => (currentUser ? mockUsers.filter(u => u.id !== currentUser.id) : []),
    [currentUser],
  )

  const filteredThreads = useMemo(() => {
    if (!query.trim()) return chatThreads
    return chatThreads.filter(t => userMatchesChatQuery(t.peer, query))
  }, [chatThreads, query])

  const extraContacts = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    const inThreads = new Set(chatThreads.map(t => t.peerId))
    return contacts.filter(u => !inThreads.has(u.id) && userMatchesChatQuery(u, q))
  }, [contacts, chatThreads, query])

  const openContact = (user: User) => {
    ensureChatThread(user)
    onSelectPeer(user.id)
  }

  if (!currentUser) return null

  return (
    <div className="flex h-full min-h-0 flex-col border-border/40 bg-card/40 lg:border-r">
      <div className="shrink-0 space-y-2 border-b border-border/40 p-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Поиск: имя, email или телефон"
            className="h-10 pl-9 text-sm"
            aria-label="Поиск по нику, почте или телефону"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-2">
          {filteredThreads.length === 0 && extraContacts.length === 0 && (
            <p className="px-2 py-8 text-center text-sm text-muted-foreground">
              {query.trim() ? 'Никого не нашли' : 'Нет переписок'}
            </p>
          )}

          <ul className="space-y-0.5">
            {filteredThreads.map(t => (
              <li key={t.peerId}>
                <button
                  type="button"
                  onClick={() => onSelectPeer(t.peerId)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors',
                    'hover:bg-accent/70',
                    selectedPeerId === t.peerId && 'bg-primary/10 ring-1 ring-primary/20',
                  )}
                >
                  <Avatar className="h-11 w-11 shrink-0">
                    <AvatarImage src={t.peer.avatar} alt="" />
                    <AvatarFallback>{t.peer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium text-foreground">{t.peer.name}</span>
                      {t.unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 shrink-0 px-1.5 text-[10px]">{t.unreadCount}</Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {t.lastPreview || 'Нет сообщений'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/80">
                      {t.lastMessageAt.getTime() > 0 ? formatDistanceToNow(t.lastMessageAt) : ''}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {extraContacts.length > 0 && (
            <div className="mt-4 border-t border-border/40 pt-3">
              <p className="mb-2 px-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Контакты
              </p>
              <ul className="space-y-0.5">
                {extraContacts.map(u => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => openContact(u)}
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-accent/70"
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={u.avatar} alt="" />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-foreground">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                        {u.phone && <p className="truncate text-[11px] text-muted-foreground">{u.phone}</p>}
                      </div>
                      <span className="shrink-0 text-xs text-primary">Написать</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

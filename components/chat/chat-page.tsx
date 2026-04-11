'use client'

import { useAppStore } from '@/lib/store'
import { useIsMobile } from '@/components/ui/use-mobile'
import { ChatThreadList } from './chat-thread-list'
import { ChatConversation } from './chat-conversation'
import { Empty } from '@/components/ui/empty'
import { MessageCircle } from 'lucide-react'

export function ChatPage() {
  const isMobile = useIsMobile()
  const { selectedChatPeerId, setSelectedChatPeerId } = useAppStore()

  if (isMobile) {
    if (selectedChatPeerId) {
      return (
        <ChatConversation
          peerId={selectedChatPeerId}
          onBack={() => setSelectedChatPeerId(null)}
        />
      )
    }
    return (
      <ChatThreadList
        selectedPeerId={selectedChatPeerId}
        onSelectPeer={id => setSelectedChatPeerId(id)}
      />
    )
  }

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden">
      <div className="flex w-full min-w-0 max-w-sm shrink-0 flex-col lg:max-w-[22rem]">
        <ChatThreadList
          selectedPeerId={selectedChatPeerId}
          onSelectPeer={id => setSelectedChatPeerId(id)}
        />
      </div>
      <div className="min-w-0 flex-1 border-l border-border/40">
        {selectedChatPeerId ? (
          <ChatConversation peerId={selectedChatPeerId} />
        ) : (
          <div className="flex h-full items-center justify-center p-6">
            <Empty
              icon={<MessageCircle className="h-12 w-12 text-muted-foreground" />}
              title="Выберите чат"
              description="Слева список переписок и поиск по имени, email или телефону"
            />
          </div>
        )}
      </div>
    </div>
  )
}

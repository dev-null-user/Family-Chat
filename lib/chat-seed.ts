import type { User, ChatMessage, ChatThreadSummary } from './types'
import { mockUsers } from './mock-data'

function sortThreads(rows: ChatThreadSummary[]): ChatThreadSummary[] {
  return [...rows].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
}

export function createInitialChatState(me: User): {
  threads: ChatThreadSummary[]
  messages: Record<string, ChatMessage[]>
} {
  const peers = mockUsers.filter(u => u.id !== me.id)
  const ivan = peers.find(p => p.id === '2')
  const maria = peers.find(p => p.id === '3')
  const sergey = peers.find(p => p.id === '4')
  const now = Date.now()

  const messages: Record<string, ChatMessage[]> = {}

  if (ivan) {
    messages[ivan.id] = [
      {
        id: 'cm1',
        threadPeerId: ivan.id,
        senderId: ivan.id,
        createdAt: new Date(now - 3_600_000),
        kind: 'text',
        text: 'Привет! Купил хлеб и молоко.',
      },
      {
        id: 'cm2',
        threadPeerId: ivan.id,
        senderId: me.id,
        createdAt: new Date(now - 3_500_000),
        kind: 'text',
        text: 'Спасибо, супер.',
      },
    ]
  }

  if (maria) {
    messages[maria.id] = [
      {
        id: 'cm3',
        threadPeerId: maria.id,
        senderId: maria.id,
        createdAt: new Date(now - 86_400_000),
        kind: 'text',
        text: 'Договорились на воскресенье?',
      },
    ]
  }

  if (sergey) {
    messages[sergey.id] = [
      {
        id: 'cm4',
        threadPeerId: sergey.id,
        senderId: me.id,
        createdAt: new Date(now - 172_800_000),
        kind: 'text',
        text: 'Скинь, пожалуйста, счёт за интернет.',
      },
    ]
  }

  const threads: ChatThreadSummary[] = []
  if (ivan && messages[ivan.id]?.length) {
    const last = messages[ivan.id][messages[ivan.id].length - 1]
    threads.push({
      peerId: ivan.id,
      peer: ivan,
      lastMessageAt: last.createdAt,
      lastPreview: last.kind === 'text' && last.text ? last.text : 'Сообщение',
      unreadCount: 0,
    })
  }
  if (maria && messages[maria.id]?.length) {
    const last = messages[maria.id][messages[maria.id].length - 1]
    threads.push({
      peerId: maria.id,
      peer: maria,
      lastMessageAt: last.createdAt,
      lastPreview: last.kind === 'text' && last.text ? last.text : 'Сообщение',
      unreadCount: 1,
    })
  }
  if (sergey && messages[sergey.id]?.length) {
    const last = messages[sergey.id][messages[sergey.id].length - 1]
    threads.push({
      peerId: sergey.id,
      peer: sergey,
      lastMessageAt: last.createdAt,
      lastPreview: last.kind === 'text' && last.text ? last.text : 'Сообщение',
      unreadCount: 0,
    })
  }

  return { threads: sortThreads(threads), messages }
}

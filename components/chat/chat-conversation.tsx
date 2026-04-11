'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'
import { mockUsers } from '@/lib/mock-data'
import type { ChatMessage, ChatReplyRef } from '@/lib/types'
import { ChatComposer } from './chat-composer'
import { ChatImageGallery } from './chat-image-gallery'
import { ChatVoiceTrack } from './chat-voice-track'
import { cn, formatDistanceToNow } from '@/lib/utils'
import { ChevronDown, ChevronLeft, CornerUpLeft, FileIcon } from 'lucide-react'

interface ChatConversationProps {
  peerId: string
  /** На телефоне — вернуться к списку чатов */
  onBack?: () => void
}

function getMessagePreview(msg: ChatMessage): string {
  switch (msg.kind) {
    case 'text':
      return (msg.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 140) || 'Сообщение'
    case 'voice':
      return 'Голосовое сообщение'
    case 'image':
      return msg.mediaUrls && msg.mediaUrls.length > 1 ? `${msg.mediaUrls.length} фото` : 'Фото'
    case 'file':
      return msg.fileName ?? 'Файл'
    default:
      return 'Сообщение'
  }
}

function replyRefFromMessage(msg: ChatMessage, peerName: string, senderIsPeer: boolean): ChatReplyRef {
  return {
    messageId: msg.id,
    preview: getMessagePreview(msg),
    senderName: senderIsPeer ? peerName : 'Вы',
  }
}

interface BubbleProps {
  msg: ChatMessage
  isMine: boolean
  peerName: string
  highlight?: boolean
  onOpenImage?: (messageId: string) => void
  onReply?: (draft: ChatReplyRef) => void
  onJumpToQuoted?: (targetMessageId: string, sourceMessageId: string) => void
}

/** Вертикальный «бюджет» альбома: чем больше рядов, тем ниже каждая ячейка, без выхода за пузырёк */
const ALBUM_GAP_PX = 2
const ALBUM_MAX_PX = 200
const ALBUM_SINGLE_ROW_MAX_PX = 208

function messageAlbumMetrics(imageCount: number) {
  const rows = Math.ceil(imageCount / 2)
  const gaps = (rows - 1) * ALBUM_GAP_PX
  const maxH = rows === 1 ? ALBUM_SINGLE_ROW_MAX_PX : ALBUM_MAX_PX
  const raw = (maxH - gaps) / rows
  const rowPx = Math.max(
    36,
    Math.min(rows === 1 ? ALBUM_SINGLE_ROW_MAX_PX : 96, Math.floor(raw)),
  )
  const totalPx = rowPx * rows + gaps
  return { rows, totalPx }
}

function MessageImageAlbum({ urls }: { urls: string[] }) {
  const n = urls.length
  if (n < 1) return null
  if (n === 1) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={urls[0]}
        alt=""
        className="max-h-[min(13rem,45vw)] w-full rounded-lg object-cover"
        draggable={false}
      />
    )
  }

  const { rows, totalPx } = messageAlbumMetrics(n)

  return (
    <div
      className="grid w-full max-w-full grid-cols-2 overflow-hidden rounded-lg"
      style={{
        height: totalPx,
        gap: ALBUM_GAP_PX,
        gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
      }}
    >
      {urls.map((url, i) => (
        <div key={`${url}-${i}`} className="relative min-h-0 min-w-0 overflow-hidden rounded-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />
        </div>
      ))}
    </div>
  )
}

function Bubble({
  msg,
  isMine,
  peerName,
  highlight,
  onOpenImage,
  onReply,
  onJumpToQuoted,
}: BubbleProps) {
  const replyTarget = replyRefFromMessage(msg, peerName, !isMine)

  return (
    <div
      id={`chat-msg-${msg.id}`}
      className={cn('flex w-full scroll-mt-8', isMine ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[min(85%,22rem)] rounded-2xl px-3 py-2 text-sm shadow-sm transition-shadow',
          isMine
            ? 'rounded-br-md bg-primary text-primary-foreground'
            : 'rounded-bl-md border border-border/60 bg-card text-foreground',
          highlight && 'chat-message-highlight-pulse ring-2 ring-primary/55',
        )}
      >
        {msg.replyTo && (
          <button
            type="button"
            className={cn(
              'mb-2 w-full rounded-md border-l-2 pl-2 py-0.5 text-left transition-colors',
              isMine
                ? 'border-primary-foreground/45 hover:bg-primary-foreground/12'
                : 'border-primary/45 hover:bg-muted/70',
            )}
            aria-label="Перейти к цитируемому сообщению"
            onClick={() => onJumpToQuoted?.(msg.replyTo!.messageId, msg.id)}
          >
            <p
              className={cn(
                'text-[10px] font-semibold leading-tight',
                isMine ? 'text-primary-foreground/85' : 'text-muted-foreground',
              )}
            >
              {msg.replyTo.senderName}
            </p>
            <p
              className={cn(
                'truncate text-[11px] leading-snug',
                isMine ? 'text-primary-foreground/80' : 'text-muted-foreground',
              )}
            >
              {msg.replyTo.preview}
            </p>
          </button>
        )}
        {msg.kind === 'text' && <p className="whitespace-pre-wrap break-words leading-snug">{msg.text}</p>}
        {msg.kind === 'voice' && msg.mediaUrl && (
          <ChatVoiceTrack
            src={msg.mediaUrl}
            durationSec={msg.durationSec}
            isMine={isMine}
            messageId={msg.id}
          />
        )}
        {msg.kind === 'image' && (msg.mediaUrls?.length || msg.mediaUrl) && (
          <>
            {msg.caption && (
              <p className="mb-2 whitespace-pre-wrap break-words text-sm leading-snug">{msg.caption}</p>
            )}
            <button
              type="button"
              className="block w-full overflow-hidden rounded-lg outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => onOpenImage?.(msg.id)}
              aria-label="Открыть изображения на весь экран"
            >
              {msg.mediaUrls && msg.mediaUrls.length > 0 ? (
                <MessageImageAlbum urls={msg.mediaUrls} />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={msg.mediaUrl ?? ''}
                  alt=""
                  className="max-h-[min(13rem,45vw)] w-full rounded-lg object-cover"
                  draggable={false}
                />
              )}
            </button>
          </>
        )}
        {msg.kind === 'file' && msg.mediaUrl && (
          <>
            {msg.caption && (
              <p className="mb-2 whitespace-pre-wrap break-words text-sm leading-snug">{msg.caption}</p>
            )}
            <a
              href={msg.mediaUrl}
              download={msg.fileName}
              className={cn(
                'flex items-center gap-2 break-all text-sm underline-offset-2 hover:underline',
                isMine ? 'text-primary-foreground' : 'text-primary',
              )}
            >
              <FileIcon className="h-4 w-4 shrink-0" />
              <span>{msg.fileName ?? 'Файл'}</span>
            </a>
          </>
        )}
        {onReply ? (
          <div
            className={cn(
              'mt-1 flex w-full min-w-0 items-center gap-2',
              isMine ? 'flex-row-reverse justify-start' : 'justify-between',
            )}
          >
            <p
              className={cn(
                'shrink-0 text-[10px] tabular-nums opacity-70',
                isMine ? 'text-primary-foreground/80' : 'text-muted-foreground',
              )}
            >
              {formatDistanceToNow(msg.createdAt)}
            </p>
            <button
              type="button"
              className={cn(
                'inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors',
                isMine
                  ? 'text-primary-foreground/85 hover:bg-primary-foreground/12'
                  : 'text-muted-foreground hover:bg-accent/70 hover:text-foreground',
              )}
              aria-label="Ответить на сообщение"
              onClick={() => onReply(replyTarget)}
            >
              <CornerUpLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            </button>
          </div>
        ) : (
          <p
            className={cn(
              'mt-1 text-[10px] opacity-70',
              isMine ? 'text-right text-primary-foreground/80' : 'text-muted-foreground',
            )}
          >
            {formatDistanceToNow(msg.createdAt)}
          </p>
        )}
      </div>
    </div>
  )
}

export function ChatConversation({ peerId, onBack }: ChatConversationProps) {
  const {
    currentUser,
    chatMessages,
    chatThreads,
    sendChatText,
    sendChatVoice,
    sendChatFiles,
    markChatThreadRead,
  } = useAppStore()

  const bottomRef = useRef<HTMLDivElement>(null)
  const threadRow = chatThreads.find(t => t.peerId === peerId)
  const peer = threadRow?.peer ?? mockUsers.find(u => u.id === peerId)
  const messages = chatMessages[peerId] ?? []

  const galleryImageRefs = useMemo(() => {
    const out: { messageId: string; url: string }[] = []
    for (const m of messages) {
      if (m.kind !== 'image') continue
      if (m.mediaUrls?.length) {
        for (const url of m.mediaUrls) out.push({ messageId: m.id, url })
      } else if (m.mediaUrl) {
        out.push({ messageId: m.id, url: m.mediaUrl })
      }
    }
    return out
  }, [messages])
  const galleryUrls = useMemo(() => galleryImageRefs.map(r => r.url), [galleryImageRefs])

  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [replyDraft, setReplyDraft] = useState<ChatReplyRef | null>(null)
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [anchorReturnStack, setAnchorReturnStack] = useState<string[]>([])
  const highlightClearRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const openGalleryForMessage = useCallback(
    (messageId: string) => {
      const idx = galleryImageRefs.findIndex(r => r.messageId === messageId)
      if (idx < 0) return
      setGalleryIndex(idx)
      setGalleryOpen(true)
    },
    [galleryImageRefs],
  )

  useEffect(() => {
    markChatThreadRead(peerId)
  }, [peerId, markChatThreadRead])

  useEffect(() => {
    setReplyDraft(null)
    setAnchorReturnStack([])
    setHighlightedMessageId(null)
  }, [peerId])

  useEffect(() => {
    return () => {
      if (highlightClearRef.current) clearTimeout(highlightClearRef.current)
    }
  }, [])

  const scrollToMessage = useCallback((messageId: string) => {
    const el = document.getElementById(`chat-msg-${messageId}`)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setHighlightedMessageId(messageId)
    if (highlightClearRef.current) clearTimeout(highlightClearRef.current)
    highlightClearRef.current = setTimeout(() => setHighlightedMessageId(null), 2700)
  }, [])

  const handleJumpToQuoted = useCallback(
    (targetMessageId: string, sourceMessageId: string) => {
      if (!messages.some(m => m.id === targetMessageId)) return
      setAnchorReturnStack(s => [...s, sourceMessageId])
      scrollToMessage(targetMessageId)
    },
    [messages, scrollToMessage],
  )

  const handleBackFromAnchor = useCallback(() => {
    setAnchorReturnStack(s => {
      if (s.length === 0) return s
      const next = [...s]
      const backId = next.pop()!
      requestAnimationFrame(() => scrollToMessage(backId))
      return next
    })
  }, [scrollToMessage])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, peerId])

  if (!currentUser || !peer) return null

  return (
    <div className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-background/30">
      <div
        className={cn(
          'flex shrink-0 items-center border-b border-border/40 bg-background/50 backdrop-blur-md',
          onBack ? 'gap-1.5 px-2 py-1.5' : 'gap-2 px-3 py-2',
        )}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Назад к списку чатов"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-primary hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
        )}
        <Avatar className="h-9 w-9">
          <AvatarImage src={peer.avatar} alt="" />
          <AvatarFallback>{peer.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-foreground">{peer.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">{peer.email}</p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
        <div className="flex flex-col gap-3 p-3 pb-4">
          {messages.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Напишите первое сообщение</p>
          ) : (
            messages.map(m => (
              <Bubble
                key={m.id}
                msg={m}
                isMine={m.senderId === currentUser.id}
                peerName={peer.name}
                highlight={highlightedMessageId === m.id}
                onOpenImage={openGalleryForMessage}
                onReply={setReplyDraft}
                onJumpToQuoted={handleJumpToQuoted}
              />
            ))
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {anchorReturnStack.length > 0 && (
        <div
          className="pointer-events-none absolute left-3 z-20"
          style={{
            bottom: 'max(9rem, calc(env(safe-area-inset-bottom, 0px) + 7.5rem))',
          }}
        >
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="pointer-events-auto h-10 w-10 rounded-full border border-border/70 bg-background/95 shadow-md backdrop-blur-sm"
            aria-label="Вернуться к сообщению, откуда перешли по цитате"
            onClick={handleBackFromAnchor}
          >
            <ChevronDown className="h-5 w-5" aria-hidden />
          </Button>
        </div>
      )}

      <ChatComposer
        peerId={peerId}
        replyDraft={replyDraft}
        onCancelReply={() => setReplyDraft(null)}
        onSendText={t => {
          sendChatText(peerId, t, replyDraft ?? undefined)
          setReplyDraft(null)
        }}
        onSendVoice={(url, sec) => sendChatVoice(peerId, url, sec)}
        onSendFiles={(files, opts) => sendChatFiles(peerId, files, opts)}
      />

      <ChatImageGallery
        open={galleryOpen && galleryUrls.length > 0}
        urls={galleryUrls}
        index={galleryIndex}
        onClose={() => setGalleryOpen(false)}
        onIndexChange={setGalleryIndex}
      />
    </div>
  )
}

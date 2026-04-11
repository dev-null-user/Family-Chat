'use client'

import { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Paperclip, Square, Send, X } from 'lucide-react'
import type { ChatReplyRef } from '@/lib/types'
import { cn } from '@/lib/utils'
import { RecordingWaveform } from './recording-waveform'
import {
  ChatAttachReviewDialog,
  type ChatAttachFileItem,
} from './chat-attach-review-dialog'

const MIN_VOICE_MS = 400
/** Видимая высота поля — до стольких строк, дальше прокрутка внутри */
const TEXTAREA_MAX_LINES = 3
/** Одна строка (text-sm + py-2.5 + border, border-box) — не опираться на scrollHeight пустого поля (даёт ~80px) */
const CHAT_TEXTAREA_MIN_HEIGHT_PX = 42

interface ChatComposerProps {
  peerId: string
  replyDraft?: ChatReplyRef | null
  onCancelReply?: () => void
  onSendText: (text: string) => void
  onSendVoice: (url: string, durationSec: number) => void
  onSendFiles: (
    files: { url: string; fileName: string; mimeType: string; kind: 'image' | 'file' }[],
    options?: { caption?: string; combineAsAlbum?: boolean },
  ) => void
  disabled?: boolean
}

export function ChatComposer({
  peerId,
  replyDraft,
  onCancelReply,
  onSendText,
  onSendVoice,
  onSendFiles,
  disabled,
}: ChatComposerProps) {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordingStream, setRecordingStream] = useState<MediaStream | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const attachInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const recordStartRef = useRef<number>(0)
  const streamRef = useRef<MediaStream | null>(null)
  const capturePointerIdRef = useRef<number | null>(null)
  /** Палец отпущен до старта записи — не начинать отправку после await */
  const micReleasedEarlyRef = useRef(false)
  const [attachDialogOpen, setAttachDialogOpen] = useState(false)
  const [pendingAttachFiles, setPendingAttachFiles] = useState<ChatAttachFileItem[] | null>(null)

  const hasText = text.trim().length > 0

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    const cs = getComputedStyle(el)
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)
    const borderY =
      parseFloat(cs.borderTopWidth || '0') + parseFloat(cs.borderBottomWidth || '0')
    const minH = CHAT_TEXTAREA_MIN_HEIGHT_PX
    const innerLine = Math.max(12, minH - padY - borderY)
    const maxH = innerLine * TEXTAREA_MAX_LINES + padY + borderY

    if (!el.value) {
      el.style.height = `${minH}px`
      el.style.overflowY = 'hidden'
      return
    }

    el.style.height = '0px'
    const scrollH = el.scrollHeight
    const next = Math.min(Math.max(scrollH, minH), maxH)
    el.style.height = `${next}px`
    el.style.overflowY = scrollH > maxH ? 'auto' : 'hidden'
  }, [])

  useLayoutEffect(() => {
    syncTextareaHeight()
  }, [text, syncTextareaHeight, peerId])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [peerId])

  const stopStream = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setRecordingStream(null)
  }, [])

  const submitText = useCallback(() => {
    const body = text.replace(/\r\n/g, '\n').trim()
    if (!body) return
    onSendText(body)
    setText('')
  }, [text, onSendText])

  const startRecording = useCallback(async (): Promise<boolean> => {
    setMicError(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setMicError('Запись недоступна в этом браузере')
      return false
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      setRecordingStream(stream)
      const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const mr = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      mr.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.start(100)
      mediaRecorderRef.current = mr
      recordStartRef.current = performance.now()
      setRecording(true)
      return true
    } catch {
      setMicError('Нет доступа к микрофону')
      stopStream()
      return false
    }
  }, [stopStream])

  const stopRecordingAndSend = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state === 'inactive') {
      setRecording(false)
      stopStream()
      return
    }
    const elapsedMs = performance.now() - recordStartRef.current
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
      chunksRef.current = []
      if (blob.size > 0 && elapsedMs >= MIN_VOICE_MS) {
        const url = URL.createObjectURL(blob)
        const durationSec = Math.max(1, Math.round(elapsedMs / 1000))
        onSendVoice(url, durationSec)
      }
      mediaRecorderRef.current = null
      stopStream()
      setRecording(false)
    }
    mr.stop()
  }, [onSendVoice, stopStream])

  const abortRecordingSilently = useCallback(() => {
    const mr = mediaRecorderRef.current
    if (!mr || mr.state === 'inactive') {
      chunksRef.current = []
      mediaRecorderRef.current = null
      stopStream()
      setRecording(false)
      return
    }
    mr.onstop = () => {
      chunksRef.current = []
      mediaRecorderRef.current = null
      stopStream()
      setRecording(false)
    }
    mr.stop()
  }, [stopStream])

  const releaseCapture = useCallback((el: HTMLElement, pointerId: number) => {
    try {
      if (el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId)
    } catch {
      /* ignore */
    }
    capturePointerIdRef.current = null
  }, [])

  const onMicPointerDown = useCallback(
    async (e: React.PointerEvent<HTMLButtonElement>) => {
      if (hasText || disabled) return
      const mr = mediaRecorderRef.current
      if (mr && mr.state === 'recording') return
      e.preventDefault()
      micReleasedEarlyRef.current = false
      const el = e.currentTarget
      const pid = e.pointerId
      el.setPointerCapture(pid)
      capturePointerIdRef.current = pid
      const ok = await startRecording()
      if (!ok) {
        releaseCapture(el, pid)
        return
      }
      if (micReleasedEarlyRef.current) {
        abortRecordingSilently()
        releaseCapture(el, pid)
      }
    },
    [hasText, disabled, startRecording, releaseCapture, abortRecordingSilently],
  )

  const onMicPointerUp = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const el = e.currentTarget
      const pid = e.pointerId
      if (capturePointerIdRef.current === pid) {
        releaseCapture(el, pid)
      }
      const mr = mediaRecorderRef.current
      if (!mr || mr.state !== 'recording') {
        micReleasedEarlyRef.current = true
        return
      }
      stopRecordingAndSend()
    },
    [stopRecordingAndSend, releaseCapture],
  )

  const onMicPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const el = e.currentTarget
      const pid = e.pointerId
      if (capturePointerIdRef.current === pid) {
        releaseCapture(el, pid)
      }
      const mr = mediaRecorderRef.current
      if (!mr || mr.state !== 'recording') {
        micReleasedEarlyRef.current = true
        return
      }
      stopRecordingAndSend()
    },
    [stopRecordingAndSend, releaseCapture],
  )

  const processFiles = useCallback((list: FileList | null) => {
    if (!list?.length) return
    const out: ChatAttachFileItem[] = []
    for (let i = 0; i < list.length; i++) {
      const file = list[i]!
      const url = URL.createObjectURL(file)
      const kind = file.type.startsWith('image/') ? 'image' : 'file'
      out.push({ url, fileName: file.name, mimeType: file.type || 'application/octet-stream', kind })
    }
    setPendingAttachFiles(out)
    setAttachDialogOpen(true)
  }, [])

  const handleAttachDialogOpenChange = useCallback((open: boolean) => {
    setAttachDialogOpen(open)
    if (!open) {
      setPendingAttachFiles(prev => {
        if (prev) prev.forEach(f => URL.revokeObjectURL(f.url))
        return null
      })
    }
  }, [])

  const handleAttachSend = useCallback(
    (opts: { caption: string; combineAsAlbum: boolean }) => {
      if (!pendingAttachFiles?.length) return
      const files = pendingAttachFiles
      setPendingAttachFiles(null)
      onSendFiles(files, {
        caption: opts.caption || undefined,
        combineAsAlbum: opts.combineAsAlbum,
      })
      setAttachDialogOpen(false)
    },
    [pendingAttachFiles, onSendFiles],
  )

  return (
    <div className="shrink-0 border-t border-border/50 bg-background/80 p-2 backdrop-blur-md sm:p-3">
      {replyDraft && (
        <div className="mb-2 flex items-start gap-1.5 rounded-lg border border-border/60 bg-muted/50 px-2.5 py-1.5 dark:bg-muted/30">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Ответ · {replyDraft.senderName}
            </p>
            <p className="truncate text-xs text-foreground">{replyDraft.preview}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="Отменить ответ"
            onClick={() => onCancelReply?.()}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
      {micError && <p className="mb-2 text-center text-[11px] text-destructive">{micError}</p>}
      {recording && recordingStream && (
        <div className="mb-2 flex flex-col items-center gap-1 px-0">
          <RecordingWaveform stream={recordingStream} active />
          <span className="text-[10px] font-medium text-destructive">Запись… отпустите, чтобы отправить</span>
        </div>
      )}
      <div className="flex items-end gap-1.5 sm:gap-2">
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Сообщение..."
          disabled={disabled || recording}
          rows={1}
          className="min-h-[42px] min-w-0 flex-1 resize-none box-border py-2.5 text-sm [field-sizing:fixed]"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault()
              submitText()
            }
          }}
        />
        <input
          ref={attachInputRef}
          type="file"
          accept="image/*,application/*,.pdf,.doc,.docx,.zip,.txt"
          multiple
          className="hidden"
          onChange={e => {
            processFiles(e.target.files)
            e.target.value = ''
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="mb-0.5 shrink-0"
          disabled={disabled || recording}
          aria-label="Прикрепить фото или файл"
          onClick={() => attachInputRef.current?.click()}
        >
          <Paperclip className="size-4" />
        </Button>
        {hasText ? (
          <Button
            type="button"
            size="icon-sm"
            className="mb-0.5 shrink-0"
            disabled={disabled || recording}
            aria-label="Отправить сообщение"
            onClick={submitText}
          >
            <Send className="size-4" />
          </Button>
        ) : (
          <Button
            type="button"
            variant={recording ? 'destructive' : 'ghost'}
            size="icon-sm"
            className={cn(
              'mb-0.5 shrink-0 touch-none select-none',
              recording && 'animate-pulse',
              !recording && disabled && 'pointer-events-none opacity-50',
            )}
            disabled={disabled && !recording}
            aria-label={
              recording ? 'Отпустите, чтобы отправить голосовое' : 'Удерживайте для записи голосового сообщения'
            }
            onPointerDown={onMicPointerDown}
            onPointerUp={onMicPointerUp}
            onPointerCancel={onMicPointerCancel}
          >
            {recording ? <Square className="size-3.5 fill-current" /> : <Mic className="size-4" />}
          </Button>
        )}
      </div>
      {/* <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
        {hasText
          ? 'Enter — отправить, Shift+Enter — новая строка.'
          : 'Удерживайте микрофон — запись; отпустите — отправка. Скрепка — фото и файлы.'}
      </p> */}
      <ChatAttachReviewDialog
        open={attachDialogOpen && Boolean(pendingAttachFiles?.length)}
        onOpenChange={handleAttachDialogOpenChange}
        files={pendingAttachFiles ?? []}
        onSend={handleAttachSend}
      />
    </div>
  )
}

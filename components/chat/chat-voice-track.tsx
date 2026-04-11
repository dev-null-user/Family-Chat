'use client'

import { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

const BAR_COUNT = 36
/** Фиксированная высота области волны (px); % у flex-детей без явной высоты родителя часто дают 0). */
const WAVE_TRACK_PX = 36

function seededBarHeights(id: string, n: number): number[] {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0
  return Array.from({ length: n }, (_, i) => {
    h = (((h * 1103515245 + 12345) | 0) + i) | 0
    const u = h >>> 0
    return 0.28 + (u % 65) / 100
  })
}

/** Peak envelope per bar, normalized ~0.2–1 for display (sqrt for more natural speech). */
function peaksFromSamples(samples: Float32Array, barCount: number): number[] {
  const len = samples.length
  if (len === 0) return Array.from({ length: barCount }, () => 0.35)
  const peaks: number[] = []
  for (let i = 0; i < barCount; i++) {
    const start = Math.floor((i / barCount) * len)
    const end = Math.min(len, Math.floor(((i + 1) / barCount) * len))
    let max = 0
    for (let j = start; j < end; j++) {
      const a = Math.abs(samples[j]!)
      if (a > max) max = a
    }
    peaks.push(max)
  }
  const maxPeak = Math.max(...peaks, 1e-8)
  return peaks.map(p => {
    const n = Math.min(1, p / maxPeak)
    return 0.2 + Math.sqrt(n) * 0.78
  })
}

function mixToMono(audioBuf: AudioBuffer): Float32Array {
  const nCh = audioBuf.numberOfChannels
  const len = audioBuf.length
  if (nCh === 1) return audioBuf.getChannelData(0)
  const out = new Float32Array(len)
  for (let c = 0; c < nCh; c++) {
    const ch = audioBuf.getChannelData(c)
    for (let i = 0; i < len; i++) out[i] += ch[i]!
  }
  const scale = 1 / nCh
  for (let i = 0; i < len; i++) out[i] *= scale
  return out
}

interface ChatVoiceTrackProps {
  src: string
  durationSec?: number
  isMine: boolean
  messageId: string
}

export function ChatVoiceTrack({ src, durationSec, isMine, messageId }: ChatVoiceTrackProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(durationSec ?? 0)
  const [dragging, setDragging] = useState(false)
  const [realBarHeights, setRealBarHeights] = useState<number[] | null>(null)

  const placeholderBars = useMemo(() => seededBarHeights(messageId, BAR_COUNT), [messageId])
  const bars = realBarHeights ?? placeholderBars

  useEffect(() => {
    let cancelled = false
    setRealBarHeights(null)

    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return

    const ac = new Ctx()
    ;(async () => {
      try {
        const res = await fetch(src)
        if (!res.ok) throw new Error(String(res.status))
        const raw = await res.arrayBuffer()
        const copy = raw.slice(0)
        const audioBuf = await ac.decodeAudioData(copy)
        if (cancelled) return
        const mono = mixToMono(audioBuf)
        setRealBarHeights(peaksFromSamples(mono, BAR_COUNT))
      } catch {
        if (!cancelled) setRealBarHeights(null)
      } finally {
        try {
          await ac.close()
        } catch {
          /* ignore */
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [src])

  const seekToRatio = useCallback(
    (ratio: number) => {
      const el = audioRef.current
      const d = duration
      if (!el || !Number.isFinite(d) || d <= 0) return
      const r = Math.max(0, Math.min(1, ratio))
      el.currentTime = r * d
      setCurrent(r * d)
    },
    [duration],
  )

  const ratioFromClientX = useCallback((clientX: number) => {
    const tr = trackRef.current
    if (!tr) return 0
    const rect = tr.getBoundingClientRect()
    if (rect.width <= 0) return 0
    return (clientX - rect.left) / rect.width
  }, [])

  const onTrackPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.pointerType !== 'touch') return
      e.preventDefault()
      draggingRef.current = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
      seekToRatio(ratioFromClientX(e.clientX))
    },
    [seekToRatio, ratioFromClientX],
  )

  const onTrackPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!draggingRef.current) return
      e.preventDefault()
      seekToRatio(ratioFromClientX(e.clientX))
    },
    [seekToRatio, ratioFromClientX],
  )

  const endDrag = useCallback((e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    setDragging(false)
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId)
      }
    } catch {
      /* ignore */
    }
  }, [])

  const onTrackPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (draggingRef.current) seekToRatio(ratioFromClientX(e.clientX))
      endDrag(e)
    },
    [endDrag, seekToRatio, ratioFromClientX],
  )

  const toggle = useCallback(() => {
    const el = audioRef.current
    if (!el) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      void el.play()
      setPlaying(true)
    }
  }, [playing])

  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => {
      if (!draggingRef.current) setCurrent(el.currentTime)
    }
    const onEnded = () => {
      setPlaying(false)
      setCurrent(0)
    }
    const onMeta = () => {
      if (Number.isFinite(el.duration) && el.duration > 0) setDuration(el.duration)
    }
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('ended', onEnded)
    el.addEventListener('loadedmetadata', onMeta)
    return () => {
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('loadedmetadata', onMeta)
    }
  }, [src])

  const progress = duration > 0 ? Math.min(1, current / duration) : 0
  const thumbLeft =
    duration > 0 ? `clamp(6px, ${progress * 100}%, calc(100% - 6px))` : '0px'

  const barColor = isMine ? 'bg-primary-foreground/45' : 'bg-primary/50'
  const barColorPlayed = isMine ? 'bg-primary-foreground' : 'bg-primary'
  const btnClass = isMine
    ? 'bg-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/35'
    : 'bg-primary/15 text-primary hover:bg-primary/25'

  const trackBg = isMine ? 'bg-primary-foreground/25' : 'bg-muted-foreground/25'
  const thumbRing = isMine ? 'ring-primary-foreground/40 bg-primary-foreground' : 'ring-primary/40 bg-primary'

  return (
    <div className="min-w-0 max-w-[min(100%,280px)]">
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
      <div className="flex min-w-0 items-start gap-2">
        <button
          type="button"
          onClick={toggle}
          className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors', btnClass)}
          aria-label={playing ? 'Пауза' : 'Воспроизвести'}
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 pl-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div
            ref={trackRef}
            className={cn(
              'touch-none select-none rounded-md outline-none',
              'cursor-grab active:cursor-grabbing',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
            )}
            role="slider"
            tabIndex={0}
            aria-label="Позиция воспроизведения"
            aria-valuemin={0}
            aria-valuemax={Math.round(duration)}
            aria-valuenow={Math.round(current)}
            aria-valuetext={`${formatTime(current)} из ${formatTime(duration)}`}
            onPointerDown={onTrackPointerDown}
            onPointerMove={onTrackPointerMove}
            onPointerUp={onTrackPointerUp}
            onPointerCancel={onTrackPointerUp}
            onKeyDown={e => {
              if (!audioRef.current || duration <= 0) return
              const step = Math.max(1, duration * 0.05)
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                e.preventDefault()
                seekToRatio((current - step) / duration)
              }
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                e.preventDefault()
                seekToRatio((current + step) / duration)
              }
              if (e.key === 'Home') {
                e.preventDefault()
                seekToRatio(0)
              }
              if (e.key === 'End') {
                e.preventDefault()
                seekToRatio(1)
              }
            }}
          >
            <div className="flex min-w-0 items-end gap-1.5">
              <div
                className="pointer-events-none flex min-w-0 flex-1 items-end gap-[2px] overflow-hidden"
                style={{ height: WAVE_TRACK_PX }}
              >
                {bars.map((hFrac, i) => {
                  const t = (i + 0.5) / bars.length
                  const played = progress >= t
                  const hPx = Math.max(3, Math.round(hFrac * WAVE_TRACK_PX))
                  return (
                    <div
                      key={i}
                      className={cn(
                        'min-w-[2px] max-w-[5px] flex-1 rounded-sm transition-colors duration-150',
                        played ? barColorPlayed : barColor,
                      )}
                      style={{ height: hPx }}
                    />
                  )
                })}
              </div>
              <span
                className={cn(
                  'shrink-0 self-end pb-0.5 tabular-nums text-[10px] leading-none',
                  isMine ? 'text-primary-foreground/85' : 'text-muted-foreground',
                )}
              >
                {formatTime(current)} / {formatTime(duration)}
              </span>
            </div>
            {/* <div
              className={cn('relative mt-1.5 h-3.5 w-full rounded-full', trackBg)}
              title="Перетащите для перемотки"
            >
              <div
                className={cn(
                  'absolute inset-y-0 left-0 rounded-full',
                  barColorPlayed,
                  !dragging && 'transition-[width] duration-100 ease-linear',
                )}
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className={cn(
                  'absolute top-1/2 h-2.5 w-2.5 rounded-full shadow-sm ring-2 ring-background',
                  thumbRing,
                  !dragging && 'transition-[left] duration-100 ease-linear',
                )}
                style={{ left: thumbLeft, transform: 'translate(-50%, -50%)' }}
                aria-hidden
              />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  )
}

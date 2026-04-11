'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/components/ui/use-mobile'

interface ChatImageGalleryProps {
  open: boolean
  urls: string[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

const MIN_SCALE = 1
const MAX_SCALE = 4
const ZOOM_STEP = 0.35
/** Насколько нужно увести кадр горизонтально, чтобы сменить фото после отпускания */
const SLIDE_COMMIT_PX = 56
/** Сдвиг по горизонтали считаем жестом слайда, а не скроллом страницы */
const SLIDE_LOCK_PX = 10

function touchDistance(a: { clientX: number; clientY: number }, b: { clientX: number; clientY: number }) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
}

export function ChatImageGallery({ open, urls, index, onClose, onIndexChange }: ChatImageGalleryProps) {
  const isMobile = useIsMobile()
  const safeIndex = urls.length ? Math.min(Math.max(0, index), urls.length - 1) : 0
  const current = urls[safeIndex]

  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  /** Смещение текущего кадра за пальцем (только моб., масштаб ≈ 1) */
  const [slideDragX, setSlideDragX] = useState(0)

  const wrapRef = useRef<HTMLDivElement>(null)
  const pinchRef = useRef({ startDist: 0, startScale: 1 })
  /** Одно касание: начало жеста; horizontal — кадр тянем за пальцем по X */
  const slideRef = useRef<{ startX: number; startY: number; horizontal: boolean } | null>(null)
  const panRef = useRef<{ lastX: number; lastY: number } | null>(null)
  const slidingForScrollLockRef = useRef(false)

  const goPrev = useCallback(() => {
    if (urls.length < 2) return
    onIndexChange(safeIndex <= 0 ? urls.length - 1 : safeIndex - 1)
  }, [urls.length, safeIndex, onIndexChange])

  const goNext = useCallback(() => {
    if (urls.length < 2) return
    onIndexChange(safeIndex >= urls.length - 1 ? 0 : safeIndex + 1)
  }, [urls.length, safeIndex, onIndexChange])

  useEffect(() => {
    setScale(1)
    setTx(0)
    setTy(0)
    setSlideDragX(0)
  }, [safeIndex])

  const zoomIn = useCallback(() => {
    setScale(s => Math.min(MAX_SCALE, s + ZOOM_STEP))
  }, [])

  const zoomOut = useCallback(() => {
    setScale(s => {
      const next = Math.max(MIN_SCALE, s - ZOOM_STEP)
      if (next <= MIN_SCALE) {
        setTx(0)
        setTy(0)
      }
      return next
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, goPrev, goNext])

  useEffect(() => {
    const el = wrapRef.current
    if (!open || !isMobile || !el) return

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1 || slidingForScrollLockRef.current) e.preventDefault()
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    return () => el.removeEventListener('touchmove', onTouchMove)
  }, [open, isMobile])

  const onTouchStart = (e: React.TouchEvent) => {
    if (!isMobile) return
    const n = e.touches.length

    if (n === 2) {
      slideRef.current = null
      panRef.current = null
      slidingForScrollLockRef.current = false
      setSlideDragX(0)
      const d = touchDistance(e.touches[0]!, e.touches[1]!)
      pinchRef.current = { startDist: d, startScale: scale }
      return
    }

    if (n === 1) {
      const t = e.touches[0]!
      if (scale > MIN_SCALE + 0.02) {
        slideRef.current = null
        slidingForScrollLockRef.current = false
        setSlideDragX(0)
        panRef.current = { lastX: t.clientX, lastY: t.clientY }
      } else {
        panRef.current = null
        if (urls.length > 1) {
          slideRef.current = { startX: t.clientX, startY: t.clientY, horizontal: false }
        } else {
          slideRef.current = null
        }
      }
    }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isMobile) return

    if (e.touches.length === 2) {
      const d = touchDistance(e.touches[0]!, e.touches[1]!)
      const { startDist, startScale } = pinchRef.current
      if (startDist > 0) {
        const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, (startScale * d) / startDist))
        setScale(next)
      }
      slideRef.current = null
      slidingForScrollLockRef.current = false
      setSlideDragX(0)
      return
    }

    if (e.touches.length === 1 && slideRef.current && scale <= MIN_SCALE + 0.02 && urls.length > 1) {
      const t = e.touches[0]!
      const s = slideRef.current
      const dx = t.clientX - s.startX
      const dy = t.clientY - s.startY
      const adx = Math.abs(dx)
      const ady = Math.abs(dy)
      if (!s.horizontal) {
        if (adx > SLIDE_LOCK_PX && adx > ady * 1.15) {
          s.horizontal = true
          slidingForScrollLockRef.current = true
        }
      }
      if (s.horizontal) {
        setSlideDragX(dx)
      }
      return
    }

    if (e.touches.length === 1 && panRef.current) {
      const t = e.touches[0]!
      const p = panRef.current
      const dx = t.clientX - p.lastX
      const dy = t.clientY - p.lastY
      setTx(prev => prev + dx)
      setTy(prev => prev + dy)
      panRef.current = { lastX: t.clientX, lastY: t.clientY }
    }
  }

  const onTouchEndOrCancel = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return

      if (e.touches.length === 0) {
        const s = slideRef.current
        const end = e.changedTouches[0]
        if (s?.horizontal && end && scale <= MIN_SCALE + 0.02 && urls.length > 1) {
          const dx = end.clientX - s.startX
          if (dx < -SLIDE_COMMIT_PX) goNext()
          else if (dx > SLIDE_COMMIT_PX) goPrev()
        }
        slideRef.current = null
        slidingForScrollLockRef.current = false
        setSlideDragX(0)
        panRef.current = null
        pinchRef.current = { startDist: 0, startScale: scale }
        if (scale <= MIN_SCALE + 0.02) {
          setScale(MIN_SCALE)
          setTx(0)
          setTy(0)
        }
      }
    },
    [isMobile, scale, urls.length, goNext, goPrev],
  )

  const onWheel = (e: React.WheelEvent) => {
    if (isMobile) return
    if (!e.ctrlKey && !e.metaKey) return
    e.preventDefault()
    const delta = e.deltaY > 0 ? -ZOOM_STEP * 0.5 : ZOOM_STEP * 0.5
    setScale(s => {
      const next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta))
      if (next <= MIN_SCALE) {
        setTx(0)
        setTy(0)
      }
      return next
    })
  }

  if (!open || typeof document === 'undefined' || !current) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-black"
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр изображения"
    >
      <div className="relative z-[30] flex shrink-0 items-center justify-between gap-2 border-b border-white/10 px-2 py-2 sm:px-3">
        <p className="min-w-0 truncate text-sm text-white/90">
          {urls.length > 1 ? `${safeIndex + 1} / ${urls.length}` : 'Просмотр'}
        </p>
        <div className="flex shrink-0 items-center gap-1">
          {!isMobile && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                aria-label="Уменьшить"
                onClick={zoomOut}
                disabled={scale <= MIN_SCALE}
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-white hover:bg-white/10"
                aria-label="Увеличить"
                onClick={zoomIn}
                disabled={scale >= MAX_SCALE}
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 shrink-0 text-white hover:bg-white/10"
            aria-label="Закрыть"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      <div
        className="relative flex min-h-0 flex-1 touch-none items-center justify-center md:touch-auto"
        onClick={onClose}
      >
        {urls.length > 1 && (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute left-1 z-20 h-12 w-12 rounded-full text-white hover:bg-white/10 md:left-4"
              aria-label="Предыдущее"
              onClick={e => {
                e.stopPropagation()
                goPrev()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-1 z-20 h-12 w-12 rounded-full text-white hover:bg-white/10 md:right-4"
              aria-label="Следующее"
              onClick={e => {
                e.stopPropagation()
                goNext()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        <div
          ref={wrapRef}
          className={cn(
            'relative z-10 flex max-h-full max-w-full items-center justify-center p-2 md:p-6',
            isMobile && 'touch-none',
          )}
          onClick={e => e.stopPropagation()}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEndOrCancel}
          onTouchCancel={onTouchEndOrCancel}
          onWheel={onWheel}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current}
            alt=""
            className={cn(
              'max-h-[min(100dvh-8rem,100%)] max-w-full object-contain select-none',
              isMobile && 'max-h-[min(100dvh-7rem,100%)]',
            )}
            draggable={false}
            style={{
              transform: `translate(${tx + slideDragX}px, ${ty}px) scale(${scale})`,
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>

    </div>,
    document.body,
  )
}

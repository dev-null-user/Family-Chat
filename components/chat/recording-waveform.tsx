'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface RecordingWaveformProps {
  stream: MediaStream | null
  active: boolean
  className?: string
}

const BAR_COUNT = 28

/** Визуализация уровня звука при записи — полосы по данным AnalyserNode. */
export function RecordingWaveform({ stream, active, className }: RecordingWaveformProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)
  const dataRef = useRef<Uint8Array | null>(null)

  useEffect(() => {
    barsRef.current = barsRef.current.slice(0, BAR_COUNT)
    if (!active || !stream) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      analyserRef.current = null
      if (ctxRef.current) {
        void ctxRef.current.close()
        ctxRef.current = null
      }
      for (let i = 0; i < BAR_COUNT; i++) {
        const el = barsRef.current[i]
        if (el) el.style.height = '18%'
      }
      return
    }

    let cancelled = false
    const setup = async () => {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      const ctx = new AC()
      await ctx.resume()
      if (cancelled) {
        void ctx.close()
        return
      }
      ctxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      analyser.smoothingTimeConstant = 0.7
      source.connect(analyser)
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.frequencyBinCount)

      const step = Math.max(1, Math.floor((dataRef.current.length / BAR_COUNT) | 0))

      const tick = () => {
        if (cancelled || !analyserRef.current || !dataRef.current) return
        analyserRef.current.getByteFrequencyData(dataRef.current)
        const data = dataRef.current
        for (let i = 0; i < BAR_COUNT; i++) {
          let sum = 0
          for (let j = 0; j < step; j++) sum += data[Math.min(i * step + j, data.length - 1)] ?? 0
          const avg = sum / step
          const norm = Math.min(1, Math.pow(avg / 210, 0.85))
          const pct = Math.max(12, Math.round(norm * 100))
          const el = barsRef.current[i]
          if (el) el.style.height = `${pct}%`
        }
        rafRef.current = requestAnimationFrame(tick)
      }

      tick()
    }

    void setup()

    return () => {
      cancelled = true
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      analyserRef.current = null
      if (ctxRef.current) {
        void ctxRef.current.close()
        ctxRef.current = null
      }
    }
  }, [active, stream])

  if (!active) return null

  return (
    <div
      className={cn(
        'flex h-12 w-full max-w-md items-end justify-center gap-0.5 rounded-xl bg-destructive px-2 py-1.5 shadow-inner',
        className,
      )}
      aria-live="polite"
      aria-label="Идёт запись звука"
    >
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div
          key={i}
          ref={el => {
            barsRef.current[i] = el
          }}
          className="min-h-[3px] w-1 shrink-0 rounded-sm bg-white/95 transition-[height] duration-75 ease-out"
          style={{ height: '18%' }}
        />
      ))}
    </div>
  )
}

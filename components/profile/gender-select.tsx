'use client'

import { Mars, Venus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserGender } from '@/lib/types'

const OPTIONS: {
  value: UserGender
  label: string
  hint: string
  Icon: typeof Mars
}[] = [
  {
    value: 'male',
    label: 'Мужской',
    hint: 'Обращения и подсказки в мужском роде',
    Icon: Mars,
  },
  {
    value: 'female',
    label: 'Женский',
    hint: 'Обращения и подсказки в женском роде',
    Icon: Venus,
  },
]

interface GenderSelectProps {
  value: UserGender | undefined
  onChange: (value: UserGender) => void
  id?: string
  /** Подсветка при ошибке валидации */
  showError?: boolean
  disabled?: boolean
}

export function GenderSelect({ value, onChange, id, showError, disabled }: GenderSelectProps) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label="Пол"
      aria-required
      className="grid grid-cols-2 gap-3 sm:gap-4"
    >
      {OPTIONS.map(({ value: v, label, hint, Icon }) => {
        const selected = value === v
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(v)}
            className={cn(
              'group relative flex flex-col items-center gap-2.5 rounded-2xl border-2 p-4 text-center transition-all outline-none sm:p-5',
              'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'disabled:pointer-events-none disabled:opacity-50',
              selected
                ? 'border-primary bg-primary/10 shadow-sm'
                : 'border-border/80 bg-card/40 hover:border-primary/40 hover:bg-accent/30',
              showError && !value && 'border-destructive/40 ring-1 ring-destructive/20'
            )}
          >
            <div
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition-colors sm:h-16 sm:w-16',
                selected
                  ? 'bg-primary text-primary-foreground shadow-inner'
                  : 'bg-muted text-muted-foreground group-hover:bg-muted/80 group-hover:text-foreground'
              )}
            >
              <Icon className="h-7 w-7 sm:h-8 sm:w-8" strokeWidth={1.5} aria-hidden />
            </div>
            <div className="space-y-0.5">
              <span className="block text-sm font-semibold text-foreground">{label}</span>
              <span className="block text-[11px] leading-snug text-muted-foreground sm:text-xs">{hint}</span>
            </div>
            {selected && (
              <span className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

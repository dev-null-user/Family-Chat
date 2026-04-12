'use client'

import { Badge } from '@/components/ui/badge'
import type { Section } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { FolderOpen, ChevronRight, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  section: Section
  onClick: () => void
  onEdit?: () => void
  isSelected?: boolean
  /** lg+: узкая колонка — иконка и мелкое название под ней, без стрелки и редактирования */
  desktopIconOnly?: boolean
}

export function SectionCard({
  section,
  onClick,
  onEdit,
  isSelected,
  desktopIconOnly = false,
}: SectionCardProps) {
  const totalTasks = section.taskLists.reduce((sum, tl) => sum + tl.tasks.length, 0)

  const completedTasks = section.taskLists.reduce(
    (sum, tl) => sum + tl.tasks.filter(t => t.completed).length,
    0,
  )

  return (
    <div
      className={cn(
        'flex w-full items-stretch transition-colors lg:hover:bg-accent/50',
        isSelected && 'bg-accent',
      )}
    >
      <button
        type="button"
        aria-label={section.name}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-2 px-2 py-2.5 text-left lg:gap-2.5 lg:px-2.5 lg:py-3 2xl:gap-3 2xl:px-4',
          desktopIconOnly && 'lg:flex-col lg:justify-center lg:gap-1 lg:px-1 lg:py-2',
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            desktopIconOnly && 'lg:relative lg:h-9 lg:w-9',
            isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground',
          )}
        >
          <FolderOpen className="h-4 w-4" />
          {desktopIconOnly && section.unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 hidden min-h-[1rem] min-w-[1rem] items-center justify-center rounded-full bg-primary px-0.5 text-[9px] font-bold text-primary-foreground shadow ring-2 ring-background lg:flex">
              {section.unreadCount > 9 ? '9+' : section.unreadCount}
            </span>
          )}
        </div>

        {desktopIconOnly && (
          <span
            className="hidden w-full max-w-[6.75rem] px-0.5 text-center text-[9px] font-medium leading-snug text-muted-foreground lg:block lg:text-foreground/90"
            title={section.name}
          >
            <span className="line-clamp-2 break-words">{section.name}</span>
          </span>
        )}

        <div className={cn('min-w-0 flex-1', desktopIconOnly && 'lg:hidden')}>
          <div className="flex min-w-0 items-center gap-2">
            <h3 className="min-w-0 flex-1 truncate text-xs font-medium text-foreground max-lg:leading-snug lg:text-sm">
              {section.name}
            </h3>
            {section.unreadCount > 0 && (
              <Badge className="h-5 min-w-5 shrink-0 px-1.5 text-[10px] font-semibold">
                {section.unreadCount}
              </Badge>
            )}
          </div>

          <p className="mt-0.5 truncate text-[11px] text-muted-foreground max-lg:leading-snug lg:text-xs">
            {section.taskLists.length} списков, {completedTasks}/{totalTasks} задач
          </p>
        </div>
      </button>

      <div
        className={cn(
          'flex shrink-0 items-stretch',
          desktopIconOnly && 'lg:hidden',
        )}
      >
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-auto w-9 shrink-0 self-stretch rounded-none text-muted-foreground hover:text-foreground"
            title="Переименовать раздел"
            aria-label="Переименовать раздел"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        <button
          type="button"
          className="flex shrink-0 items-center px-2 py-2.5 text-muted-foreground/50 hover:text-muted-foreground lg:px-2.5 lg:py-3 2xl:px-3"
          onClick={onClick}
          aria-hidden
          tabIndex={-1}
        >
          <ChevronRight className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </div>
  )
}

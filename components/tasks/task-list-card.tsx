'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import type { TaskList } from '@/lib/types'
import { formatCreatorLine } from '@/lib/task-meta-utils'
import { ListTodo, ChevronRight, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListCardProps {
  taskList: TaskList
  onClick: () => void
  isSelected?: boolean
  /** lg+: только иконка списка */
  desktopIconOnly?: boolean
  onRenameTitle?: () => void
}

export function TaskListCard({
  taskList,
  onClick,
  isSelected,
  desktopIconOnly = false,
  onRenameTitle,
}: TaskListCardProps) {
  const completedCount = taskList.tasks.filter(t => t.completed).length
  const totalCount = taskList.tasks.length
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-stretch border-b border-border transition-colors hover:bg-accent/50',
        isSelected && 'bg-accent',
      )}
    >
      <button
        type="button"
        title={desktopIconOnly ? taskList.title : undefined}
        aria-label={desktopIconOnly ? taskList.title : undefined}
        className={cn(
          'flex min-w-0 flex-1 flex-col gap-1 px-2 py-2.5 text-left lg:px-2.5 lg:py-3 2xl:px-4',
          desktopIconOnly
            ? 'max-lg:flex-col max-lg:gap-1 lg:flex-row lg:items-center lg:justify-center lg:gap-0 lg:py-2'
            : 'lg:gap-2 2xl:gap-2.5',
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            'flex min-w-0 items-center gap-2',
            desktopIconOnly && 'lg:justify-center lg:gap-0',
          )}
        >
          <div
            className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
              isSelected ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground',
            )}
          >
            <ListTodo className="h-4 w-4" />
          </div>

          <div className={cn('min-w-0 flex-1', desktopIconOnly && 'lg:hidden')}>
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-medium text-foreground">{taskList.title}</h3>
              {taskList.unreadCount > 0 && (
                <Badge className="h-5 min-w-5 shrink-0 px-1.5 text-[10px] font-semibold">
                  {taskList.unreadCount}
                </Badge>
              )}
            </div>

            <div className="mt-1 flex items-center gap-2">
              <Progress value={progress} className="h-1 max-w-20 flex-1" />
              <span className="shrink-0 text-[10px] text-muted-foreground">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          <ChevronRight
            className={cn(
              'h-4 w-4 shrink-0 self-center text-muted-foreground/50',
              desktopIconOnly && 'lg:hidden',
            )}
          />
        </div>
        <p
          className={cn(
            'pl-11 pr-6 text-[10px] leading-tight text-muted-foreground',
            desktopIconOnly && 'lg:hidden',
          )}
        >
          {formatCreatorLine(taskList.createdBy, taskList.createdAt)}
        </p>
      </button>
      {onRenameTitle && (
        <div className="flex shrink-0 items-start border-l border-border/40 py-2 pr-1 pt-2.5 sm:pr-2 sm:pt-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            title="Переименовать список"
            aria-label="Переименовать список"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onRenameTitle()
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}

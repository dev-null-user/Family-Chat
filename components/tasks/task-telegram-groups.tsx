'use client'

import type { Task } from '@/lib/types'
import { TaskItem } from './task-item'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { groupTasksByLabel } from '@/lib/task-group-utils'
import { formatCreatorLine } from '@/lib/task-meta-utils'
import { cn } from '@/lib/utils'
import { Pencil, Plus } from 'lucide-react'

interface TaskTelegramGroupsProps {
  tasks: Task[]
  onToggle: (taskId: string) => void
  onEdit: (taskId: string, title: string) => void
  onDelete: (taskId: string, taskTitle: string) => void
  className?: string
  /** Карандаш у каждого блока — открывает редактирование группы (название и задачи) */
  showGroupControls?: boolean
  onEditGroup?: (blockKey: string) => void
  /** Плюс в шапке блока — быстрое добавление задачи в эту группу */
  onQuickAddTask?: (blockKey: string, blockLabel: string) => void
}

export function TaskTelegramGroups({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  className,
  showGroupControls,
  onEditGroup,
  onQuickAddTask,
}: TaskTelegramGroupsProps) {
  const blocks = groupTasksByLabel(tasks)

  return (
    <div className={cn('space-y-3', className)}>
      {blocks.map(block => {
        const active = block.tasks.filter(t => !t.completed)
        const done = block.tasks.filter(t => t.completed)
        const sortedByCreated = [...block.tasks].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
        )
        const groupMeta =
          sortedByCreated.length === 0
            ? null
            : { user: sortedByCreated[0].createdBy, at: sortedByCreated[0].createdAt }

        return (
          <div
            key={block.key}
            className={cn(
              'rounded-2xl border border-border/90 bg-card shadow-sm overflow-hidden',
              'dark:border-border dark:bg-card/60'
            )}
          >
            <div className="flex items-center gap-1.5 border-b border-border/70 bg-muted/60 px-2 py-1.5 dark:bg-muted/25 sm:gap-2 sm:px-3 sm:py-2.5">
              <p className="min-w-0 flex-1 text-xs font-semibold leading-snug text-foreground sm:text-sm">
                {block.label}
              </p>
              {showGroupControls && (onEditGroup || onQuickAddTask) && (
                <div className="flex shrink-0 items-center gap-0.5">
                  {onQuickAddTask && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground sm:h-8 sm:w-8"
                      title="Добавить задачу в группу"
                      aria-label={`Добавить задачу в «${block.label}»`}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        onQuickAddTask(block.key, block.label)
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {onEditGroup && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground sm:h-8 sm:w-8"
                      title="Редактировать группу задач"
                      aria-label={`Редактировать группу «${block.label}»`}
                      onClick={e => {
                        e.preventDefault()
                        e.stopPropagation()
                        onEditGroup(block.key)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="px-1.5 py-2">
              {active.length > 0 && (
                <div className="space-y-0.5">
                  {active.map(task => (
                    <TaskItem
                      key={task.id}
                      multiline
                      task={task}
                      onToggle={() => onToggle(task.id)}
                      onEdit={title => onEdit(task.id, title)}
                      onDelete={() => onDelete(task.id, task.title)}
                    />
                  ))}
                </div>
              )}
              {done.length > 0 && (
                <>
                  {active.length > 0 && <Separator className="my-2" />}
                  <p className="mb-1.5 px-2 text-[9px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[10px]">
                    Выполнено
                  </p>
                  <div className="space-y-0.5">
                    {done.map(task => (
                      <TaskItem
                        key={task.id}
                        multiline
                        task={task}
                        onToggle={() => onToggle(task.id)}
                        onEdit={title => onEdit(task.id, title)}
                        onDelete={() => onDelete(task.id, task.title)}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
            {groupMeta && (
              <div className="px-3 py-2 border-t border-border/70 bg-muted/30 dark:bg-muted/15">
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {formatCreatorLine(groupMeta.user, groupMeta.at)}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

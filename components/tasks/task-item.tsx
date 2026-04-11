'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Task } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/utils'
import { MoreHorizontal, Pencil, Trash2, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskItemProps {
  task: Task
  onToggle: () => void
  onEdit: (title: string) => void
  onDelete: () => void
  /** Многострочный текст: переносы в названии и поле редактирования */
  multiline?: boolean
}

export function TaskItem({ task, onToggle, onEdit, onDelete, multiline = false }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(task.title)

  useEffect(() => {
    setEditValue(task.title)
  }, [task.title])

  const handleSave = () => {
    if (editValue.trim()) {
      onEdit(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(task.title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (multiline) {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
      return
    }
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors sm:gap-3 sm:py-2',
        'hover:bg-accent/50',
        task.completed && 'opacity-60',
        !isEditing && 'cursor-pointer'
      )}
      onClick={() => {
        if (!isEditing) onToggle()
      }}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={onToggle}
        onClick={e => e.stopPropagation()}
        className="mt-0.5 h-4 w-4 shrink-0"
      />

      <div className="min-w-0 flex-1">
        {isEditing ? (
          multiline ? (
            <div className="flex flex-col gap-1.5">
              <Textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-[4rem] max-h-[min(40vh,14rem)] resize-y py-2 text-xs sm:min-h-[4.5rem] sm:text-sm"
                rows={4}
                autoFocus
              />
              <p className="text-[10px] text-muted-foreground">Ctrl+Enter — сохранить</p>
              <div className="flex justify-end gap-1">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleSave}>
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleCancel}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-7 text-xs sm:text-sm"
                autoFocus
              />
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleSave}>
                <Check className="h-3.5 w-3.5" />
              </Button>
              <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={handleCancel}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )
        ) : (
          <>
            <p
              className={cn(
                'text-xs leading-snug text-foreground sm:text-sm sm:leading-tight',
                multiline && 'whitespace-pre-wrap break-words',
                task.completed && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-1 sm:mt-1 sm:gap-1.5">
              <Avatar className="h-4 w-4">
                <AvatarImage
                  src={task.completedBy?.avatar || task.createdBy.avatar}
                  alt={task.completedBy?.name || task.createdBy.name}
                />
                <AvatarFallback className="bg-muted text-[8px]">
                  {(task.completedBy?.name || task.createdBy.name).charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[10px] text-muted-foreground">
                {task.completed
                  ? `${task.completedBy?.name?.split(' ')[0]}`
                  : `${task.createdBy.name.split(' ')[0]}`}
              </span>
              <span className="text-[10px] text-muted-foreground/50">·</span>
              <span className="text-[10px] text-muted-foreground/70">
                {formatDistanceToNow(task.completedAt || task.createdAt)}
              </span>
            </div>
          </>
        )}
      </div>

      {!isEditing && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 max-sm:opacity-100"
              onClick={e => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Pencil className="mr-2 h-3.5 w-3.5" />
              Редактировать
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Удалить
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  )
}

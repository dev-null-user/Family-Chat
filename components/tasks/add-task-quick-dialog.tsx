'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'
import type { Task, Activity } from '@/lib/types'
import { DEFAULT_GROUP_KEY } from '@/lib/task-group-utils'

export interface AddTaskQuickDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskListId: string | null
  blockKey: string | null
  /** Подпись группы для заголовка (как в списке блоков) */
  groupLabel?: string | null
}

export function AddTaskQuickDialog({
  open,
  onOpenChange,
  taskListId,
  blockKey,
  groupLabel,
}: AddTaskQuickDialogProps) {
  const { currentUser, addTask, addActivity } = useAppStore()
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (!open) setTitle('')
  }, [open])

  if (!taskListId) return null

  const label = groupLabel?.trim() || 'эту группу'

  const groupName =
    !blockKey || blockKey === DEFAULT_GROUP_KEY ? undefined : blockKey

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !currentUser || blockKey == null) return

    const task: Task = {
      id: `t${Date.now()}`,
      title: title.trim(),
      completed: false,
      createdAt: new Date(),
      createdBy: currentUser,
      groupName,
    }
    addTask(taskListId, task)

    const activity: Activity = {
      id: `a${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      action: 'added',
      targetName: task.title,
      timestamp: new Date(),
      taskListId,
    }
    addActivity(taskListId, activity)

    setTitle('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-left">Новая задача</DialogTitle>
            <DialogDescription className="text-left text-xs sm:text-sm">
              Группа: «{label}».
            </DialogDescription>
          </DialogHeader>
          <div className="py-3 sm:py-4">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Текст задачи"
              className="h-11 text-sm"
              autoFocus
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="w-full" disabled={!title.trim()}>
              Добавить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

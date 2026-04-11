'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { TaskItem } from './task-item'
import { useAppStore } from '@/lib/store'
import type { Task, Activity } from '@/lib/types'
import { DEFAULT_GROUP_KEY, sortTasksNewestFirst } from '@/lib/task-group-utils'
import { Plus } from 'lucide-react'

export interface ManageTaskGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskListId: string | null
  /** Ключ блока из groupTasksByLabel */
  blockKey: string | null
}

function taskInBlock(t: Task, blockKey: string): boolean {
  return blockKey === DEFAULT_GROUP_KEY
    ? !(t.groupName?.trim())
    : (t.groupName?.trim() || '') === blockKey
}

export function ManageTaskGroupDialog({
  open,
  onOpenChange,
  taskListId,
  blockKey,
}: ManageTaskGroupDialogProps) {
  const {
    groups,
    currentUser,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    renameTaskGroup,
    addActivity,
  } = useAppStore()

  const taskList = useMemo(
    () =>
      taskListId
        ? groups.flatMap(g => g.sections).flatMap(s => s.taskLists).find(tl => tl.id === taskListId)
        : undefined,
    [groups, taskListId]
  )

  const [labelDraft, setLabelDraft] = useState('')
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    if (!open || !blockKey) return
    setLabelDraft(blockKey === DEFAULT_GROUP_KEY ? '' : blockKey)
    setNewTitle('')
  }, [open, blockKey])

  const groupTasks = useMemo(() => {
    if (!taskList || !blockKey) return []
    return sortTasksNewestFirst(taskList.tasks.filter(t => taskInBlock(t, blockKey)))
  }, [taskList, blockKey])

  useEffect(() => {
    if (open && taskListId && blockKey && !taskList) onOpenChange(false)
  }, [open, taskListId, blockKey, taskList, onOpenChange])

  if (!open || !taskListId || !blockKey || !taskList) return null

  const handleSaveLabel = () => {
    renameTaskGroup(taskListId, blockKey, labelDraft)
    onOpenChange(false)
  }

  const log = (action: Activity['action'], targetName: string) => {
    if (!currentUser) return
    const activity: Activity = {
      id: `a${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      action,
      targetName,
      timestamp: new Date(),
      taskListId,
    }
    addActivity(taskListId, activity)
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !currentUser) return
    /** Как в AddTaskQuickDialog: привязка к блоку по ключу, не к черновику подписи — иначе задачи «пропадают» из списка до «Сохранить». */
    const groupName = blockKey === DEFAULT_GROUP_KEY ? undefined : blockKey
    const task: Task = {
      id: `t${Date.now()}`,
      title: newTitle.trim(),
      completed: false,
      createdAt: new Date(),
      createdBy: currentUser,
      groupName,
    }
    addTask(taskListId, task)
    log('added', task.title)
    setNewTitle('')
  }

  const handleEdit = (taskId: string, title: string) => {
    if (!currentUser) return
    updateTask(taskListId, taskId, { title })
    log('edited', title)
  }

  const handleDelete = (taskId: string, taskTitle: string) => {
    if (!currentUser) return
    deleteTask(taskListId, taskId)
    log('deleted', taskTitle)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(92dvh,38rem)] min-h-0 w-[calc(100%-0.75rem)] flex-col gap-0 overflow-hidden rounded-2xl border-border/80 p-0 shadow-xl sm:max-w-md"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border/60 px-3 pb-2 pt-3 text-left sm:px-4 sm:pb-2.5 sm:pt-4">
          <DialogTitle className="pr-7 text-base leading-tight sm:text-lg">Группа задач</DialogTitle>
          <DialogDescription className="text-left text-[11px] leading-snug sm:text-xs">
            Подпись группы — «Сохранить» внизу. Задачи ниже сохраняются сразу. Длинный текст — несколько строк в поле
            описания.
          </DialogDescription>
        </DialogHeader>

        <div className="shrink-0 space-y-1 border-b border-border/50 px-3 py-2 sm:px-4">
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Подпись группы
          </label>
          <Input
            value={labelDraft}
            onChange={e => setLabelDraft(e.target.value)}
            placeholder="Пусто — «Общие задачи»"
            className="h-8 text-xs sm:h-9 sm:text-sm"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1.5 py-2 sm:px-2">
          {groupTasks.length === 0 ? (
            <p className="py-5 text-center text-xs text-muted-foreground">В этой группе пока нет задач</p>
          ) : (
            groupTasks.map(task => (
              <TaskItem
                key={task.id}
                multiline
                task={task}
                onToggle={() => toggleTask(taskListId, task.id)}
                onEdit={title => handleEdit(task.id, title)}
                onDelete={() => handleDelete(task.id, task.title)}
              />
            ))
          )}
        </div>

        <form
          onSubmit={handleAdd}
          className="shrink-0 space-y-2 border-t border-border/60 bg-muted/15 px-3 py-2.5 dark:bg-muted/10 sm:px-4"
        >
          <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Описание задачи
          </label>
          <Textarea
            placeholder="Несколько строк: детали, ссылки, чек-лист…"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="min-h-[5.25rem] max-h-[min(32vh,13rem)] w-full resize-y py-2 text-xs sm:min-h-[6rem] sm:text-sm"
            rows={4}
          />
          <Button
            type="submit"
            className="h-10 w-full gap-1"
            disabled={!newTitle.trim()}
          >
            <Plus className="h-4 w-4" />
            Добавить
          </Button>
        </form>

        <DialogFooter className="shrink-0 flex-col gap-2 border-t border-border/60 px-3 py-2.5 sm:flex-col sm:px-4 sm:py-3">
          <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="button" className="w-full" onClick={handleSaveLabel}>
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

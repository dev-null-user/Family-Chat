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
import { useAppStore } from '@/lib/store'

export interface ManageTasksDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskListId: string
}

export function ManageTasksDialog({ open, onOpenChange, taskListId }: ManageTasksDialogProps) {
  const { groups, updateTaskList } = useAppStore()

  const taskList = useMemo(
    () => groups.flatMap(g => g.sections).flatMap(s => s.taskLists).find(tl => tl.id === taskListId),
    [groups, taskListId]
  )

  const [listTitle, setListTitle] = useState('')

  useEffect(() => {
    if (!open) return
    if (taskList) setListTitle(taskList.title)
  }, [open, taskList?.title, taskListId])

  useEffect(() => {
    if (open && taskListId && !taskList) onOpenChange(false)
  }, [open, taskListId, taskList, onOpenChange])

  if (!open || !taskList) return null

  const handleListTitleBlur = () => {
    const t = listTitle.trim()
    if (t && t !== taskList.title) updateTaskList(taskList.id, { title: t })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">Название списка</DialogTitle>
          <DialogDescription className="text-left text-xs sm:text-sm">
            Новая именованная группа — + в шапке списка. Редактирование группы — карандаш у блока.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <label className="text-xs font-medium text-muted-foreground">Как отображается в колонке</label>
          <Input
            value={listTitle}
            onChange={e => setListTitle(e.target.value)}
            onBlur={handleListTitleBlur}
            placeholder="Например: Продукты на неделю"
            className="h-10 text-sm"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

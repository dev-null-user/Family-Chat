'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface NewTaskListTitleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Вызывается при «Сохранить» с введённым названием списка */
  onContinue: (title: string) => void
}

export function NewTaskListTitleDialog({ open, onOpenChange, onContinue }: NewTaskListTitleDialogProps) {
  const [title, setTitle] = useState('')

  useEffect(() => {
    if (open) setTitle('')
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = title.trim()
    if (!t) return
    onContinue(t)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новый список задач</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Название списка"
              className="h-11"
              autoFocus
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="w-full" disabled={!title.trim()}>
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

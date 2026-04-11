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

interface NewTaskGroupNameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onContinue: (name: string) => void
}

export function NewTaskGroupNameDialog({
  open,
  onOpenChange,
  onContinue,
}: NewTaskGroupNameDialogProps) {
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName('')
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = name.trim()
    if (!t) return
    onContinue(t)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Новая группа задач</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Название группы"
              className="h-11"
              autoFocus
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button type="button" variant="outline" className="w-full" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              Далее
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

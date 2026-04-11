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

interface EditGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string | null
  initialName: string
}

export function EditGroupDialog({ open, onOpenChange, groupId, initialName }: EditGroupDialogProps) {
  const { updateGroup } = useAppStore()
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupId || !name.trim()) return
    updateGroup(groupId, { name: name.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Переименовать группу</DialogTitle>
            <DialogDescription>Только название группы.</DialogDescription>
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

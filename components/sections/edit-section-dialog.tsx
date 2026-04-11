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

interface EditSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string | null
  initialName: string
}

export function EditSectionDialog({
  open,
  onOpenChange,
  sectionId,
  initialName,
}: EditSectionDialogProps) {
  const { updateSection } = useAppStore()
  const [name, setName] = useState('')

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!sectionId || !name.trim()) return
    updateSection(sectionId, { name: name.trim() })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Переименовать раздел</DialogTitle>
            <DialogDescription>Только название раздела, без списков и задач.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Название раздела"
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

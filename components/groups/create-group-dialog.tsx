'use client'

import { useState } from 'react'
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
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useAppStore } from '@/lib/store'
import type { Group } from '@/lib/types'

interface CreateGroupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateGroupDialog({ open, onOpenChange }: CreateGroupDialogProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { addGroup, currentUser } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !currentUser) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: name.trim(),
      members: [currentUser],
      sections: [],
      unreadCount: 0,
    }

    addGroup(newGroup)
    setName('')
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Создать группу</DialogTitle>
            <DialogDescription>
              Создайте новую группу для совместной работы с семьей или командой
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="groupName">Название группы</FieldLabel>
                <Input
                  id="groupName"
                  placeholder="Например: Семья Ивановых"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-11"
                  autoFocus
                />
              </Field>
            </FieldGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

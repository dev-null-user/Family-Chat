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
import type { Section } from '@/lib/types'

interface CreateSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupId: string
}

export function CreateSectionDialog({ open, onOpenChange, groupId }: CreateSectionDialogProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { addSection } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    const newSection: Section = {
      id: `s${Date.now()}`,
      name: name.trim(),
      groupId,
      taskLists: [],
      unreadCount: 0,
    }

    addSection(groupId, newSection)
    setName('')
    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Создать секцию</DialogTitle>
            <DialogDescription>Только название раздела — списки и задачи добавляются отдельно.</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="sectionName">Название секции</FieldLabel>
                <Input
                  id="sectionName"
                  placeholder="Например: Покупки"
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

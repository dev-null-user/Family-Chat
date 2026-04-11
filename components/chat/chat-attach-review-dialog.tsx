'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

export type ChatAttachFileItem = {
  url: string
  fileName: string
  mimeType: string
  kind: 'image' | 'file'
}

export interface ChatAttachReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  files: ChatAttachFileItem[]
  onSend: (opts: { caption: string; combineAsAlbum: boolean }) => void
}

export function ChatAttachReviewDialog({
  open,
  onOpenChange,
  files,
  onSend,
}: ChatAttachReviewDialogProps) {
  const [caption, setCaption] = useState('')
  const [mode, setMode] = useState<'separate' | 'album'>('separate')

  const allImages = files.length > 0 && files.every(f => f.kind === 'image')
  const canAlbum = allImages && files.length > 1

  useEffect(() => {
    if (!open) return
    setCaption('')
    setMode(canAlbum ? 'album' : 'separate')
  }, [open, canAlbum])

  const handleSend = () => {
    onSend({
      caption: caption.trim(),
      combineAsAlbum: canAlbum && mode === 'album',
    })
  }

  const countLabel =
    files.length === 1
      ? files[0]!.kind === 'image'
        ? '1 фото'
        : files[0]!.fileName
      : `${files.length} вложений`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" showCloseButton>
        <DialogHeader>
          <DialogTitle>Отправить {countLabel}</DialogTitle>
          <DialogDescription>
            Добавьте подпись и выберите, как отправить вложения в чат.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label htmlFor="attach-caption">Сообщение к вложению (необязательно)</Label>
            <Textarea
              id="attach-caption"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Текст подписи…"
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          <div className="grid gap-2">
            <Label>Как отправить</Label>
            <RadioGroup
              value={mode}
              onValueChange={v => setMode(v as 'separate' | 'album')}
              className="grid gap-2"
            >
              <label
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 p-3 has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-accent/40"
                htmlFor="mode-separate"
              >
                <RadioGroupItem value="separate" id="mode-separate" className="mt-0.5" />
                <span className="text-sm leading-snug">
                  <span className="font-medium">По отдельности</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    Каждое вложение — отдельное сообщение. Подпись будет у первого.
                  </span>
                </span>
              </label>
              <label
                className={cn(
                  'flex items-start gap-3 rounded-lg border border-border/80 p-3 has-[[data-state=checked]]:border-primary/60 has-[[data-state=checked]]:bg-accent/40',
                  !canAlbum ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                )}
                htmlFor="mode-album"
              >
                <RadioGroupItem
                  value="album"
                  id="mode-album"
                  className="mt-0.5"
                  disabled={!canAlbum}
                />
                <span className="text-sm leading-snug">
                  <span className="font-medium">Одним сообщением</span>
                  <span className="mt-0.5 block text-muted-foreground">
                    {canAlbum
                      ? 'Все фото в одном сообщении (альбом).'
                      : 'Доступно только для нескольких изображений.'}
                  </span>
                </span>
              </label>
            </RadioGroup>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Отмена
          </Button>
          <Button type="button" onClick={handleSend}>
            Отправить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

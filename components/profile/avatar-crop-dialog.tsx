'use client'

import { useState, useCallback, useEffect } from 'react'
import Cropper from 'react-easy-crop'
import 'react-easy-crop/react-easy-crop.css'
import type { Area } from 'react-easy-crop'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { getCircularCroppedImageDataUrl } from '@/lib/avatar-crop-utils'
import { Loader2 } from 'lucide-react'

interface AvatarCropDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  onApply: (dataUrl: string) => void
}

export function AvatarCropDialog({ open, onOpenChange, imageSrc, onApply }: AvatarCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [applying, setApplying] = useState(false)
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null)

  useEffect(() => {
    if (open && imageSrc) {
      setCrop({ x: 0, y: 0 })
      setZoom(1)
      setCroppedPixels(null)
    }
  }, [open, imageSrc])

  const onCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCroppedPixels(areaPixels)
  }, [])

  const handleApply = async () => {
    if (!imageSrc || !croppedPixels) return
    setApplying(true)
    try {
      const dataUrl = await getCircularCroppedImageDataUrl(imageSrc, croppedPixels)
      onApply(dataUrl)
      onOpenChange(false)
    } catch {
      // silent — можно подключить toast
    } finally {
      setApplying(false)
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) setApplying(false)
    onOpenChange(next)
  }

  if (!imageSrc) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton
        className="fixed inset-0 z-50 flex h-[100dvh] max-h-[100dvh] w-full max-w-none translate-x-0 translate-y-0 flex-col gap-0 rounded-none border-0 p-0 shadow-none duration-200 sm:inset-auto sm:top-[50%] sm:left-[50%] sm:h-auto sm:max-h-[min(90vh,720px)] sm:w-full sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border sm:shadow-lg"
      >
        <DialogHeader className="shrink-0 space-y-1 border-b border-border px-4 py-3 pr-12 text-left sm:pr-14">
          <DialogTitle className="text-base">Обрезка аватара</DialogTitle>
          <DialogDescription>
            Перемещайте и масштабируйте фото. Видимая область — круг, как в профиле.
          </DialogDescription>
        </DialogHeader>

        <div className="relative min-h-0 flex-1 touch-none overflow-hidden bg-muted/40 sm:min-h-[280px] sm:flex-none sm:aspect-square sm:max-h-[min(60vh,420px)]">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={0}
            aspect={1}
            cropShape="round"
            roundCropAreaPixels
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            style={{}}
            classes={{
              containerClassName: 'h-full w-full',
            }}
          />
        </div>

        <div className="shrink-0 space-y-2 border-t border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="w-14 shrink-0 text-xs text-muted-foreground">Масштаб</span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.02}
              onValueChange={([v]) => setZoom(v)}
              className="flex-1"
            />
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={applying}>
            Отмена
          </Button>
          <Button type="button" onClick={handleApply} disabled={applying || !croppedPixels}>
            {applying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Сохранение…
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

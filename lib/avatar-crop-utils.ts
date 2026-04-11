import type { Area } from 'react-easy-crop'

const MAX_AVATAR_SIZE = 512

export function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('Не удалось загрузить изображение'))
    if (!url.startsWith('blob:') && !url.startsWith('data:')) {
      img.crossOrigin = 'anonymous'
    }
    img.src = url
  })
}

/** PNG с круглой маской, до MAX_AVATAR_SIZE px (для data URL / localStorage) */
export async function getCircularCroppedImageDataUrl(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas не поддерживается')

  let { x, y, width, height } = pixelCrop
  const size = Math.round(Math.min(width, height))
  x = Math.round(x + (width - size) / 2)
  y = Math.round(y + (height - size) / 2)

  const out = Math.min(size, MAX_AVATAR_SIZE)
  canvas.width = out
  canvas.height = out

  ctx.beginPath()
  ctx.arc(out / 2, out / 2, out / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(image, x, y, size, size, 0, 0, out, out)

  return canvas.toDataURL('image/png', 0.92)
}

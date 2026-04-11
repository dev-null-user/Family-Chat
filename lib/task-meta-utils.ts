import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { User } from '@/lib/types'

export function formatCreatorLine(user: User, at: Date): string {
  const verb =
    user.gender === 'female' ? 'Создала' : user.gender === 'male' ? 'Создал' : 'Создано'
  const when = format(at, 'd MMM yyyy, HH:mm', { locale: ru })
  return `${verb} ${user.name} · ${when}`
}

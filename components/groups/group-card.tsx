'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Group } from '@/lib/types'
import { Users, ChevronRight, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GroupCardProps {
  group: Group
  onClick: () => void
  onEdit?: () => void
  isSelected?: boolean
  /** lg+: только иконка группы (название, бейдж, карандаш скрыты) */
  desktopIconOnly?: boolean
}

export function GroupCard({ group, onClick, onEdit, isSelected, desktopIconOnly = false }: GroupCardProps) {
  const getActivityText = () => {
    if (!group.lastActivity) return 'Нет активности'

    const { user, action, targetName } = group.lastActivity
    const actionText = {
      completed: 'выполнил(а)',
      unchecked: 'снял(а) отметку',
      added: 'добавил(а)',
      deleted: 'удалил(а)',
      edited: 'изменил(а)',
    }[action]

    return `${user.name.split(' ')[0]} ${actionText} "${targetName}"`
  }

  return (
    <div
      className={cn(
        'flex w-full items-stretch touch-manipulation transition-all duration-200',
        /* Mobile: отдельная карточка */
        'max-lg:gap-0 max-lg:overflow-hidden max-lg:rounded-2xl max-lg:border max-lg:border-border/65 max-lg:bg-card max-lg:shadow-[0_4px_20px_-8px_rgba(15,23,42,0.18),0_0_0_1px_rgba(255,255,255,0.06)_inset]',
        'dark:max-lg:border-border/40 dark:max-lg:bg-card/92 dark:max-lg:shadow-[0_6px_28px_-10px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]',
        'max-lg:active:scale-[0.99]',
        isSelected &&
          'max-lg:border-primary/45 max-lg:bg-gradient-to-br max-lg:from-primary/[0.09] max-lg:to-primary/[0.02] max-lg:shadow-md max-lg:shadow-primary/15',
        /* Desktop: строка списка */
        'lg:transition-colors lg:hover:bg-accent/50',
        isSelected && 'lg:bg-accent'
      )}
    >
      <button
        type="button"
        title={desktopIconOnly ? group.name : undefined}
        aria-label={desktopIconOnly ? group.name : undefined}
        className={cn(
          'flex min-w-0 flex-1 items-center gap-3 text-left max-lg:p-3.5 max-lg:pr-2',
          'lg:gap-2.5 lg:px-2.5 lg:py-3 2xl:gap-3 2xl:px-4',
          desktopIconOnly && 'lg:justify-center lg:gap-0 lg:px-1 lg:py-2',
        )}
        onClick={onClick}
      >
        <div
          className={cn(
            'flex shrink-0 items-center justify-center rounded-2xl max-lg:h-12 max-lg:w-12 max-lg:shadow-inner',
            'lg:h-10 lg:w-10 lg:rounded-xl',
            desktopIconOnly && 'lg:h-9 lg:w-9',
            isSelected
              ? 'bg-primary text-primary-foreground max-lg:shadow-md max-lg:shadow-primary/25'
              : 'bg-primary/12 text-primary dark:bg-primary/18'
          )}
        >
          <Users className="max-lg:h-6 max-lg:w-6 h-5 w-5" />
        </div>

        <div className={cn('min-w-0 flex-1', desktopIconOnly && 'lg:hidden')}>
          <div className="flex items-start gap-2">
            <h3 className="min-w-0 flex-1 break-words text-base font-semibold leading-snug tracking-tight text-foreground max-lg:text-[0.9375rem] max-lg:font-semibold lg:text-sm lg:font-medium">
              {group.name}
            </h3>
            {group.unreadCount > 0 && (
              <Badge className="mt-0.5 h-5 min-w-5 shrink-0 px-1.5 text-[10px] font-semibold shadow-sm">
                {group.unreadCount}
              </Badge>
            )}
          </div>

          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground max-lg:mt-1.5 lg:mt-0.5 lg:truncate lg:leading-normal">
            {getActivityText()}
          </p>

          {/* Участники — только на мобильных, под текстом */}
          <div className="mt-2.5 flex items-center gap-2 lg:hidden">
            <div className="flex -space-x-2">
              {group.members.slice(0, 4).map(member => (
                <Avatar key={member.id} className="h-7 w-7 border-2 border-card shadow-sm">
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback className="bg-muted text-[10px] font-medium">{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            {group.members.length > 4 && (
              <span className="text-[11px] font-medium text-muted-foreground">+{group.members.length - 4}</span>
            )}
          </div>
        </div>
      </button>

      <div
        className={cn(
          'flex shrink-0 items-stretch max-lg:flex-col max-lg:justify-center max-lg:border-l max-lg:border-border/50 max-lg:bg-muted/20 dark:max-lg:border-border/35 dark:max-lg:bg-muted/10',
          desktopIconOnly && 'lg:hidden',
        )}
      >
        {onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              'h-auto shrink-0 rounded-none text-muted-foreground hover:bg-transparent hover:text-foreground max-lg:h-11 max-lg:w-11',
              'lg:w-9 lg:self-stretch lg:hover:bg-accent/80'
            )}
            title="Переименовать группу"
            aria-label="Переименовать группу"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              onEdit()
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        )}

        <button
          type="button"
          className={cn(
            'flex shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground max-lg:h-11 max-lg:w-11 max-lg:border-t max-lg:border-border/50 lg:gap-2 lg:px-2 lg:py-2.5 dark:max-lg:border-border/35',
            'lg:border-0 lg:px-2.5 lg:py-3 2xl:px-3'
          )}
          onClick={onClick}
          aria-hidden
          tabIndex={-1}
        >
          <div className="-space-x-1.5 flex max-lg:hidden">
            {group.members.slice(0, 3).map(member => (
              <Avatar key={member.id} className="h-6 w-6 border-2 border-card">
                <AvatarImage src={member.avatar} alt={member.name} />
                <AvatarFallback className="bg-muted text-[10px]">{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
            ))}
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 opacity-60 max-lg:opacity-80 lg:h-4 lg:w-4" />
        </button>
      </div>
    </div>
  )
}

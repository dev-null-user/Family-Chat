'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Activity } from '@/lib/types'
import { formatDate, formatTime } from '@/lib/utils'
import { CheckCircle2, Circle, Plus, Trash2, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActionIcon = (action: Activity['action']) => {
    switch (action) {
      case 'completed':
        return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
      case 'unchecked':
        return <Circle className="h-3.5 w-3.5 text-orange-500" />
      case 'added':
        return <Plus className="h-3.5 w-3.5 text-blue-500" />
      case 'deleted':
        return <Trash2 className="h-3.5 w-3.5 text-red-500" />
      case 'edited':
        return <Pencil className="h-3.5 w-3.5 text-purple-500" />
    }
  }

  const getActionText = (action: Activity['action']) => {
    switch (action) {
      case 'completed':
        return 'выполнил(а)'
      case 'unchecked':
        return 'снял(а) отметку с'
      case 'added':
        return 'добавил(а)'
      case 'deleted':
        return 'удалил(а)'
      case 'edited':
        return 'изменил(а)'
    }
  }

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = formatDate(activity.timestamp)
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(activity)
    return groups
  }, {} as Record<string, Activity[]>)

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
          <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-xs text-muted-foreground sm:text-sm">Нет активности</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground/70 sm:text-xs">
          Действия с задачами появятся здесь
        </p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-3 px-3 pb-3 sm:space-y-4 sm:px-4 sm:pb-4">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date}>
            <div className="sticky top-0 z-10 mb-2 border-b border-border/50 bg-background py-2">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {date}
              </span>
            </div>
            
            <div className="space-y-0.5">
              {dateActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={cn(
                    'relative z-0 flex items-start gap-2.5 px-2 py-2 rounded-lg',
                    'hover:bg-accent/30 transition-colors'
                  )}
                >
                  <Avatar className="h-6 w-6 shrink-0 mt-0.5">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback className="text-[10px] bg-muted">
                      {activity.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-1.5">
                      <span className="mt-0.5 shrink-0">{getActionIcon(activity.action)}</span>
                      <p className="text-[11px] leading-snug text-foreground sm:text-xs sm:leading-relaxed">
                        <span className="font-medium">{activity.user.name.split(' ')[0]}</span>
                        {' '}
                        <span className="text-muted-foreground">
                          {getActionText(activity.action)}
                        </span>
                        {' '}
                        <span className="break-words font-medium">&quot;{activity.targetName}&quot;</span>
                      </p>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-0.5 ml-5">
                      {formatTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

'use client'

import { useState } from 'react'
import { GroupCard } from './group-card'
import { CreateGroupDialog } from './create-group-dialog'
import { EditGroupDialog } from './edit-group-dialog'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { Plus, Users } from 'lucide-react'

interface GroupsListProps {
  onGroupSelect?: (groupId: string) => void
  /** lg+: только иконки групп, заголовок «Группы» + плюс (узкая колонка на главной) */
  desktopIconOnlyRows?: boolean
}

export function GroupsList({ onGroupSelect, desktopIconOnlyRows = false }: GroupsListProps) {
  const { groups, selectedGroupId, selectGroup } = useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const editingGroup = editingGroupId ? groups.find(g => g.id === editingGroupId) : null

  const handleGroupClick = (groupId: string) => {
    selectGroup(groupId)
    onGroupSelect?.(groupId)
  }

  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col max-lg:w-full max-lg:bg-transparent lg:w-full">
      <div
        className={cn(
          'flex w-full min-w-0 shrink-0 max-lg:border-0 max-lg:bg-transparent max-lg:pb-2 lg:border-b lg:border-border',
          desktopIconOnlyRows
            ? 'flex-col items-center gap-2 px-2 py-2.5 max-lg:flex-row max-lg:justify-between max-lg:px-4 max-lg:py-3'
            : 'items-center justify-between px-4 py-3 lg:px-2.5 lg:py-3 2xl:px-4',
        )}
      >
        <div className={cn('min-w-0', desktopIconOnlyRows && 'lg:text-center')}>
          <h2
            className={cn(
              'font-semibold tracking-tight text-foreground max-lg:text-[15px] max-lg:leading-snug lg:text-sm',
              desktopIconOnlyRows ? 'text-center text-[13px] leading-tight lg:block' : 'text-base',
            )}
          >
            Группы
          </h2>
          {!desktopIconOnlyRows && (
            <p className="mt-0.5 text-[11px] text-muted-foreground max-lg:leading-snug lg:text-xs">
              {groups.length} {groups.length === 1 ? 'группа' : 'групп'}
            </p>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'shrink-0 rounded-xl bg-primary/10 text-primary hover:bg-primary/18 hover:text-primary max-lg:h-11 max-lg:w-11 lg:rounded-md lg:bg-transparent lg:hover:bg-accent',
            desktopIconOnlyRows ? 'h-7 w-7 max-lg:h-11 max-lg:w-11' : 'h-10 w-10 lg:h-8 lg:w-8',
          )}
          onClick={() => setShowCreateDialog(true)}
          aria-label="Создать группу"
        >
          <Plus className={cn(desktopIconOnlyRows ? 'h-4 w-4 max-lg:h-5 max-lg:w-5' : 'h-5 w-5 lg:h-4 lg:w-4')} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain max-lg:px-4 max-lg:pb-6">
        {groups.length === 0 ? (
          <div className="p-2 max-lg:pt-2 lg:p-4">
            <div className="max-lg:rounded-2xl max-lg:border max-lg:border-dashed max-lg:border-border/80 max-lg:bg-card/80 max-lg:p-8 max-lg:shadow-sm dark:max-lg:border-border/50 dark:max-lg:bg-card/60">
              <Empty
                className="max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none"
                icon={<Users className="h-10 w-10 max-lg:h-12 max-lg:w-12" />}
                title="Нет групп"
                description="Создайте первую группу — она появится здесь списком карточек"
                action={
                  <Button size="sm" className="max-lg:h-10" onClick={() => setShowCreateDialog(true)}>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Создать
                  </Button>
                }
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col max-lg:gap-3 lg:divide-y lg:divide-border">
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                desktopIconOnly={desktopIconOnlyRows}
                onClick={() => handleGroupClick(group.id)}
                onEdit={() => setEditingGroupId(group.id)}
                isSelected={selectedGroupId === group.id}
              />
            ))}
          </div>
        )}
      </div>

      <CreateGroupDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
      />

      <EditGroupDialog
        open={editingGroupId !== null}
        onOpenChange={open => {
          if (!open) setEditingGroupId(null)
        }}
        groupId={editingGroupId}
        initialName={editingGroup?.name ?? ''}
      />
    </div>
  )
}

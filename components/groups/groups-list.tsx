'use client'

import { useState, useEffect, useMemo } from 'react'
import { GroupCard } from './group-card'
import { CreateGroupDialog } from './create-group-dialog'
import { EditGroupDialog } from './edit-group-dialog'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import {
  loadRecentTaskLists,
  RECENT_TASK_LISTS_EVENT,
  type RecentTaskListEntry,
} from '@/lib/recent-task-lists'
import { Clock, Plus, Users } from 'lucide-react'
import { useSidebarColumnWideEnoughForFullRow } from '@/lib/sidebar-column-layout'

interface GroupsListProps {
  onGroupSelect?: (groupId: string) => void
  /** lg+: узкая колонка — иконка и название под ней, заголовок «Группы» + плюс */
  desktopIconOnlyRows?: boolean
}

export function GroupsList({ onGroupSelect, desktopIconOnlyRows = false }: GroupsListProps) {
  const { groups, selectedGroupId, selectGroup, setNavigationContext } = useAppStore()
  const { rootRef, wideEnoughForFullDesktopRow } = useSidebarColumnWideEnoughForFullRow()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [recentRaw, setRecentRaw] = useState<RecentTaskListEntry[]>(() => loadRecentTaskLists())
  const editingGroup = editingGroupId ? groups.find(g => g.id === editingGroupId) : null

  /** Полное имя группы, стрелка, редактирование и «Недавние» — только при раскрытой колонке и без узкого режима от shell. */
  const useFullDesktopGroupRow = !desktopIconOnlyRows && wideEnoughForFullDesktopRow
  const useCompactDesktopGroupRow = !useFullDesktopGroupRow

  useEffect(() => {
    const sync = () => setRecentRaw(loadRecentTaskLists())
    window.addEventListener(RECENT_TASK_LISTS_EVENT, sync)
    return () => window.removeEventListener(RECENT_TASK_LISTS_EVENT, sync)
  }, [])

  const recentValid = useMemo(() => {
    return recentRaw.filter(r => {
      const g = groups.find(x => x.id === r.groupId)
      const s = g?.sections.find(se => se.id === r.sectionId)
      return !!s?.taskLists.some(t => t.id === r.taskListId)
    })
  }, [recentRaw, groups])

  const handleGroupClick = (groupId: string) => {
    selectGroup(groupId)
    onGroupSelect?.(groupId)
  }

  const openRecent = (r: RecentTaskListEntry) => {
    setNavigationContext({
      groupId: r.groupId,
      sectionId: r.sectionId,
      taskListId: r.taskListId,
    })
  }

  return (
    <div
      ref={rootRef}
      className="flex h-full min-h-0 w-full min-w-0 flex-col max-lg:w-full max-lg:bg-transparent lg:w-full"
    >
      <div
        className={cn(
          'flex w-full min-w-0 shrink-0 max-lg:border-0 max-lg:bg-transparent max-lg:pb-2 lg:border-b lg:border-border',
          useCompactDesktopGroupRow
            ? 'flex-col items-center gap-2 px-2 py-2.5 max-lg:flex-row max-lg:justify-between max-lg:px-4 max-lg:py-3'
            : 'items-center justify-between px-4 py-3 lg:px-2.5 lg:py-3 2xl:px-4',
        )}
      >
        <div className={cn('min-w-0', useCompactDesktopGroupRow && 'lg:text-center')}>
          <h2
            className={cn(
              'font-semibold tracking-tight text-foreground max-lg:text-[15px] max-lg:leading-snug lg:text-sm',
              useCompactDesktopGroupRow ? 'text-center text-[13px] leading-tight lg:block' : 'text-base',
            )}
          >
            Группы
          </h2>
          {useFullDesktopGroupRow && (
            <>
              <p className="mt-0.5 text-[11px] text-muted-foreground max-lg:leading-snug lg:text-xs">
                {groups.length} {groups.length === 1 ? 'группа' : 'групп'}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground/90 lg:hidden">
                Дальше: раздел → список → задачи
              </p>
            </>
          )}
        </div>
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            'shrink-0 rounded-xl bg-primary/10 text-primary hover:bg-primary/18 hover:text-primary max-lg:h-11 max-lg:w-11 lg:rounded-md lg:bg-transparent lg:hover:bg-accent',
            useCompactDesktopGroupRow ? 'h-7 w-7 max-lg:h-11 max-lg:w-11' : 'h-10 w-10 lg:h-8 lg:w-8',
          )}
          onClick={() => setShowCreateDialog(true)}
          aria-label="Создать группу"
        >
          <Plus className={cn(useCompactDesktopGroupRow ? 'h-4 w-4 max-lg:h-5 max-lg:w-5' : 'h-5 w-5 lg:h-4 lg:w-4')} />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain max-lg:px-4 max-lg:pb-6">
        {groups.length === 0 ? (
          <div className="p-2 max-lg:pt-2 lg:p-4">
            <div className="max-lg:rounded-2xl max-lg:border max-lg:border-dashed max-lg:border-border/80 max-lg:bg-card/80 max-lg:p-8 max-lg:shadow-sm dark:max-lg:border-border/50 dark:max-lg:bg-card/60">
              <Empty
                className="max-lg:border-0 max-lg:bg-transparent max-lg:p-0 max-lg:shadow-none"
                icon={<Users className="h-10 w-10 max-lg:h-12 max-lg:w-12" />}
                title="Начните с группы"
                description="Группа объединяет семью или проект. Нажмите «Создать», задайте название — затем добавьте разделы и списки задач."
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
            {recentValid.length > 0 && useFullDesktopGroupRow && (
              <div className="max-lg:px-0 lg:border-b lg:border-border lg:px-2.5 lg:py-2.5 2xl:px-4">
                <p className="mb-1.5 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden />
                  Недавние списки
                </p>
                <div className="flex flex-col gap-1 max-lg:px-0">
                  {recentValid.map(r => (
                    <button
                      key={r.taskListId}
                      type="button"
                      onClick={() => openRecent(r)}
                      className="w-full rounded-lg border border-border/50 bg-muted/30 px-2.5 py-2 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted/55 hover:border-border dark:border-border/40 dark:bg-muted/20 dark:hover:bg-muted/35"
                    >
                      <span className="line-clamp-2">{r.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                desktopIconOnly={useCompactDesktopGroupRow}
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

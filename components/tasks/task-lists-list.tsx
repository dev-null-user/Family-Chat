'use client'

import { useState, useEffect } from 'react'
import { TaskListCard } from './task-list-card'
import { ManageTasksDialog } from './manage-tasks-dialog'
import { NewTaskListTitleDialog } from './new-task-list-title-dialog'
import { EditSectionDialog } from '@/components/sections/edit-section-dialog'
import { Button } from '@/components/ui/button'
import { Empty } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import { Plus, ListTodo, ChevronLeft, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskListsListProps {
  onTaskListSelect?: (taskListId: string) => void
  onBack?: () => void
  /** lg+: заголовок «Списки» + плюс, строки — только иконка */
  desktopIconOnlyRows?: boolean
}

export function TaskListsList({
  onTaskListSelect,
  onBack,
  desktopIconOnlyRows = false,
}: TaskListsListProps) {
  const {
    selectedSectionId,
    selectedTaskListId,
    selectTaskList,
    getSelectedSection,
    getSelectedGroup,
    addTaskList,
    currentUser,
  } = useAppStore()
  const [renameListId, setRenameListId] = useState<string | null>(null)
  const [titleDialogOpen, setTitleDialogOpen] = useState(false)
  const [editSectionOpen, setEditSectionOpen] = useState(false)

  useEffect(() => {
    if (!selectedTaskListId) setRenameListId(null)
  }, [selectedTaskListId])

  const section = getSelectedSection()
  const group = getSelectedGroup()
  const taskLists = section?.taskLists || []
  const selectedList = selectedTaskListId ? taskLists.find(t => t.id === selectedTaskListId) : undefined

  const handleTaskListClick = (taskListId: string) => {
    selectTaskList(taskListId)
    onTaskListSelect?.(taskListId)
  }

  const openCreateTitleDialog = () => {
    setTitleDialogOpen(true)
  }

  const handleTitleContinue = (title: string) => {
    if (!currentUser || !selectedSectionId) return
    const trimmed = title.trim()
    if (!trimmed) return
    const newList = {
      id: `tl${Date.now()}`,
      title: trimmed,
      sectionId: selectedSectionId,
      tasks: [],
      activities: [],
      unreadCount: 0,
      createdAt: new Date(),
      createdBy: currentUser,
    }
    addTaskList(selectedSectionId, newList)
    selectTaskList(newList.id)
  }

  const handlePlusClick = () => {
    openCreateTitleDialog()
  }

  const openRenameList = (taskListId: string) => {
    selectTaskList(taskListId)
    setRenameListId(taskListId)
  }

  if (!section) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Empty
          icon={<ListTodo className="h-10 w-10" />}
          title="Выберите секцию"
          description="Выберите секцию для просмотра списков"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col max-lg:bg-transparent lg:bg-card">
      <div
        className={cn(
          'flex shrink-0 border-b border-border/40 bg-background/35 backdrop-blur-md max-lg:border-border/30 lg:border-border lg:bg-transparent lg:backdrop-blur-none',
          desktopIconOnlyRows
            ? 'flex-col items-center gap-2 px-2 py-2.5 max-lg:flex-row max-lg:items-center max-lg:gap-2 max-lg:px-2 max-lg:py-2.5 lg:gap-2 2xl:gap-3'
            : 'items-center gap-2 px-2 py-2.5 lg:gap-2.5 lg:px-2.5 lg:py-3 2xl:gap-3 2xl:px-4',
        )}
      >
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0 lg:hidden">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className={cn('min-w-0 flex-1', desktopIconOnlyRows && 'lg:hidden')}>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{group?.name}</p>
          <div className="flex min-w-0 items-center gap-1">
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{section.name}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              title="Переименовать раздел"
              aria-label="Переименовать раздел"
              onClick={() => setEditSectionOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          {selectedTaskListId && selectedList && (
            <div className="mt-1.5 flex min-w-0 items-center gap-1 border-t border-border/50 pt-1.5">
              <ListTodo className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">{selectedList.title}</span>
            </div>
          )}
        </div>
        {desktopIconOnlyRows && (
          <h2 className="hidden text-center text-[13px] font-semibold leading-tight tracking-tight text-foreground lg:block">
            Списки
          </h2>
        )}
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className={cn(
            'shrink-0',
            desktopIconOnlyRows ? 'h-7 w-7 max-lg:h-9 max-lg:w-9' : 'h-9 w-9',
          )}
          title="Новый список задач"
          aria-label="Новый список задач"
          onClick={handlePlusClick}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
        {taskLists.length === 0 ? (
          <div className="p-4">
            <Empty
              icon={<ListTodo className="h-10 w-10" />}
              title="Нет списков"
              description="Нажмите + и введите только название списка. Группы и задачи добавляйте внутри открытого списка."
              action={
                <Button size="sm" onClick={openCreateTitleDialog}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  Создать
                </Button>
              }
            />
          </div>
        ) : (
          <div className="divide-y divide-border">
            {taskLists.map(taskList => (
              <TaskListCard
                key={taskList.id}
                taskList={taskList}
                desktopIconOnly={desktopIconOnlyRows}
                onClick={() => handleTaskListClick(taskList.id)}
                isSelected={selectedTaskListId === taskList.id}
                onRenameTitle={() => openRenameList(taskList.id)}
              />
            ))}
          </div>
        )}
      </div>

      <NewTaskListTitleDialog
        open={titleDialogOpen}
        onOpenChange={setTitleDialogOpen}
        onContinue={handleTitleContinue}
      />

      {renameListId && taskLists.some(t => t.id === renameListId) && (
        <ManageTasksDialog
          open
          onOpenChange={open => {
            if (!open) setRenameListId(null)
          }}
          taskListId={renameListId}
        />
      )}

      <EditSectionDialog
        open={editSectionOpen}
        onOpenChange={setEditSectionOpen}
        sectionId={selectedSectionId}
        initialName={section.name}
      />
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { TaskTelegramGroups } from './task-telegram-groups'
import { ActivityFeed } from './activity-feed'
import { ManageTasksDialog } from './manage-tasks-dialog'
import { ManageTaskGroupDialog } from './manage-task-group-dialog'
import { AddTaskQuickDialog } from './add-task-quick-dialog'
import { NewTaskGroupNameDialog } from './new-task-group-name-dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Empty } from '@/components/ui/empty'
import { useAppStore } from '@/lib/store'
import type { Activity } from '@/lib/types'
import { formatCreatorLine } from '@/lib/task-meta-utils'
import { DEFAULT_GROUP_KEY } from '@/lib/task-group-utils'
import { Plus, Pencil, ListTodo, ChevronLeft, MessageSquare, CheckSquare } from 'lucide-react'

interface TaskListDetailProps {
  onBack?: () => void
}

export function TaskListDetail({ onBack }: TaskListDetailProps) {
  const {
    getSelectedTaskList,
    getSelectedSection,
    getSelectedGroup,
    currentUser,
    updateTask,
    deleteTask,
    toggleTask,
    addActivity,
    markAsRead,
    selectedTaskListId,
  } = useAppStore()

  const [activeTab, setActiveTab] = useState('tasks')
  const [manageOpen, setManageOpen] = useState(false)
  const [editGroupKey, setEditGroupKey] = useState<string | null>(null)
  const [newGroupNameOpen, setNewGroupNameOpen] = useState(false)
  const [quickAddTarget, setQuickAddTarget] = useState<{ key: string; label: string } | null>(null)

  const taskList = getSelectedTaskList()
  const section = getSelectedSection()
  const group = getSelectedGroup()

  useEffect(() => {
    if (selectedTaskListId) {
      markAsRead(selectedTaskListId)
    }
  }, [selectedTaskListId, markAsRead])

  const handleToggleTask = (taskId: string) => {
    if (!taskList) return
    toggleTask(taskList.id, taskId)
  }

  const handleEditTask = (taskId: string, title: string) => {
    if (!taskList || !currentUser) return
    updateTask(taskList.id, taskId, { title })

    const activity: Activity = {
      id: `a${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      action: 'edited',
      targetName: title,
      timestamp: new Date(),
      taskListId: taskList.id,
    }
    addActivity(taskList.id, activity)
  }

  const handleDeleteTask = (taskId: string, taskTitle: string) => {
    if (!taskList || !currentUser) return
    deleteTask(taskList.id, taskId)

    const activity: Activity = {
      id: `a${Date.now()}`,
      userId: currentUser.id,
      user: currentUser,
      action: 'deleted',
      targetName: taskTitle,
      timestamp: new Date(),
      taskListId: taskList.id,
    }
    addActivity(taskList.id, activity)
  }

  if (!taskList) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <Empty
          icon={<ListTodo className="h-10 w-10" />}
          title="Выберите список"
          description="Выберите список задач для просмотра"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col max-lg:bg-transparent lg:bg-background">
      <div className="flex shrink-0 items-center gap-2 border-b border-border/40 bg-background/45 px-3 py-2 backdrop-blur-md max-lg:border-border/30 sm:gap-3 sm:px-4 sm:py-3 lg:border-border lg:bg-card lg:backdrop-blur-none">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8 shrink-0">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {group?.name} / {section?.name}
          </p>
          <div className="mt-0.5 flex min-w-0 items-center gap-1">
            <h2 className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground sm:text-sm">{taskList.title}</h2>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
              title="Переименовать список"
              aria-label="Переименовать список"
              onClick={() => setManageOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
            {formatCreatorLine(taskList.createdBy, taskList.createdAt)}
          </p>
        </div>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="h-9 w-9 shrink-0"
          title="Новая группа задач"
          aria-label="Новая группа задач"
          onClick={() => setNewGroupNameOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ManageTasksDialog open={manageOpen} onOpenChange={setManageOpen} taskListId={taskList.id} />

      <NewTaskGroupNameDialog
        open={newGroupNameOpen}
        onOpenChange={setNewGroupNameOpen}
        onContinue={groupName => setEditGroupKey(groupName)}
      />

      <ManageTaskGroupDialog
        open={editGroupKey !== null}
        onOpenChange={open => {
          if (!open) setEditGroupKey(null)
        }}
        taskListId={taskList.id}
        blockKey={editGroupKey}
      />

      <AddTaskQuickDialog
        open={quickAddTarget !== null}
        onOpenChange={open => {
          if (!open) setQuickAddTarget(null)
        }}
        taskListId={taskList.id}
        blockKey={quickAddTarget?.key ?? null}
        groupLabel={quickAddTarget?.label ?? null}
      />

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <TabsList className="mx-3 mt-2 grid w-full max-w-[calc(100%-1.5rem)] shrink-0 grid-cols-2 sm:mx-4 sm:mt-3 sm:max-w-[calc(100%-2rem)]">
          <TabsTrigger value="tasks" className="gap-1 text-[11px] sm:gap-1.5 sm:text-xs">
            <CheckSquare className="h-3.5 w-3.5" />
            Задачи ({taskList.tasks.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1 text-[11px] sm:gap-1.5 sm:text-xs">
            <MessageSquare className="h-3.5 w-3.5" />
            Лента ({taskList.activities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="m-0 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
            {taskList.tasks.length === 0 ? (
              <Empty
                icon={<CheckSquare className="h-10 w-10" />}
                title="Нет задач"
                description="Новая группа — + у заголовка списка. Задачу в группу — + в шапке блока (когда есть задачи) или карандаш «Общие задачи». Название списка — карандаш у заголовка."
                className="py-8"
                action={
                  <Button className="w-full max-w-xs" onClick={() => setEditGroupKey(DEFAULT_GROUP_KEY)}>
                    Открыть группу «Общие задачи»
                  </Button>
                }
              />
            ) : (
              <div className="px-3 pb-3 pt-1.5 sm:px-4 sm:pb-4 sm:pt-2">
                <TaskTelegramGroups
                  tasks={taskList.tasks}
                  onToggle={handleToggleTask}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                  showGroupControls
                  onEditGroup={key => setEditGroupKey(key)}
                  onQuickAddTask={(key, label) => setQuickAddTarget({ key, label })}
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="m-0 mt-3 flex min-h-0 flex-1 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-hidden">
            <ActivityFeed activities={taskList.activities} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

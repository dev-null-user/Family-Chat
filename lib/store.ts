'use client'

import { createContext, useContext } from 'react'
import type {
  Group,
  Section,
  TaskList,
  Task,
  Activity,
  User,
  Theme,
  InboxNotification,
  PendingSupportNav,
  ChatMessage,
  ChatReplyRef,
  ChatThreadSummary,
} from './types'

export interface AppStore {
  // State
  currentUser: User | null
  groups: Group[]
  selectedGroupId: string | null
  selectedSectionId: string | null
  selectedTaskListId: string | null
  theme: Theme
  isAuthenticated: boolean
  inboxNotifications: InboxNotification[]
  /** Открыть новость по id при переходе на вкладку «Новости» */
  pendingNewsId: string | null
  /** Открыть вкладку/статью поддержки при переходе на «Поддержка» */
  pendingSupportNav: PendingSupportNav | null

  chatThreads: ChatThreadSummary[]
  chatMessages: Record<string, ChatMessage[]>
  selectedChatPeerId: string | null

  // Actions
  setCurrentUser: (user: User | null) => void
  setGroups: (groups: Group[]) => void
  selectGroup: (groupId: string | null) => void
  selectSection: (sectionId: string | null) => void
  selectTaskList: (taskListId: string | null) => void
  /** Установить выбор группы/секции/списка одним вызовом (для навигации из уведомлений) */
  setNavigationContext: (ctx: {
    groupId: string | null
    sectionId: string | null
    taskListId: string | null
  }) => void
  setTheme: (theme: Theme) => void
  markInboxNotificationRead: (id: string) => void
  markAllInboxNotificationsRead: () => void
  setPendingNewsId: (id: string | null) => void
  setPendingSupportNav: (nav: PendingSupportNav | null) => void

  setSelectedChatPeerId: (peerId: string | null) => void
  ensureChatThread: (peer: User) => void
  sendChatText: (peerId: string, text: string, replyTo?: ChatReplyRef) => void
  sendChatVoice: (peerId: string, mediaUrl: string, durationSec: number) => void
  sendChatFiles: (
    peerId: string,
    files: { url: string; fileName: string; mimeType: string; kind: 'image' | 'file' }[],
    options?: { caption?: string; combineAsAlbum?: boolean },
  ) => void
  markChatThreadRead: (peerId: string) => void
  
  // Group actions
  addGroup: (group: Group) => void
  updateGroup: (groupId: string, updates: Partial<Group>) => void
  deleteGroup: (groupId: string) => void
  
  // Section actions
  addSection: (groupId: string, section: Section) => void
  updateSection: (sectionId: string, updates: Partial<Section>) => void
  deleteSection: (sectionId: string) => void
  
  // TaskList actions
  addTaskList: (sectionId: string, taskList: TaskList) => void
  updateTaskList: (taskListId: string, updates: Partial<TaskList>) => void
  deleteTaskList: (taskListId: string) => void
  
  // Task actions
  addTask: (taskListId: string, task: Task) => void
  updateTask: (taskListId: string, taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskListId: string, taskId: string) => void
  toggleTask: (taskListId: string, taskId: string) => void
  /** Переименовать подпись группы у всех задач блока (blockKey — как в groupTasksByLabel) */
  renameTaskGroup: (taskListId: string, blockKey: string, newLabel: string) => void
  
  // Activity actions
  addActivity: (taskListId: string, activity: Activity) => void
  
  // Utility
  getSelectedGroup: () => Group | null
  getSelectedSection: () => Section | null
  getSelectedTaskList: () => TaskList | null
  markAsRead: (taskListId: string) => void
}

export const AppStoreContext = createContext<AppStore | null>(null)

export function useAppStore() {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used within AppStoreProvider')
  }
  return context
}

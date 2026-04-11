export type UserGender = 'male' | 'female'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  phone?: string
  birthYear?: number
  gender?: UserGender
}

export interface Activity {
  id: string
  userId: string
  user: User
  action: 'completed' | 'unchecked' | 'added' | 'deleted' | 'edited'
  targetName: string
  timestamp: Date
  taskListId: string
}

export interface Task {
  id: string
  title: string
  /** Подпись группы внутри списка (как «тема» в Telegram): задачи с одним названием — в одном блоке */
  groupName?: string
  completed: boolean
  createdAt: Date
  completedAt?: Date
  createdBy: User
  completedBy?: User
}

export interface TaskList {
  id: string
  title: string
  tasks: Task[]
  activities: Activity[]
  unreadCount: number
  sectionId: string
  createdAt: Date
  createdBy: User
}

export interface Section {
  id: string
  name: string
  taskLists: TaskList[]
  unreadCount: number
  groupId: string
  lastActivity?: Activity
}

export interface Group {
  id: string
  name: string
  sections: Section[]
  members: User[]
  unreadCount: number
  lastActivity?: Activity
}

export type Theme = 'light' | 'dark' | 'system'

export interface AppState {
  currentUser: User | null
  groups: Group[]
  selectedGroupId: string | null
  selectedSectionId: string | null
  selectedTaskListId: string | null
  theme: Theme
}

/** Куда вести пользователя по нажатию на уведомление */
export type InboxNotificationTarget =
  | { kind: 'task_list'; groupId: string; sectionId: string; taskListId: string }
  | { kind: 'section'; groupId: string; sectionId: string }
  | { kind: 'group'; groupId: string }
  | { kind: 'news'; newsId: string }
  | { kind: 'support'; tab: 'chat' | 'knowledge'; articleId?: string }
  | { kind: 'profile' }

export interface InboxNotification {
  id: string
  title: string
  body: string
  createdAt: Date
  read: boolean
  target: InboxNotificationTarget
}

export type PendingSupportNav = {
  tab: 'chat' | 'knowledge'
  articleId?: string
}

/** Подсказка оболочке приложения после перехода по уведомлению */
export type InboxNavUiHint =
  | 'home_task_detail'
  | 'home_task_lists'
  | 'home_sections'
  | 'news'
  | 'support'
  | 'profile'

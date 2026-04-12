'use client'

import { useState, useCallback, useEffect, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { AppStoreContext, type AppStore } from '@/lib/store'
import { TooltipProvider } from '@/components/ui/tooltip'
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
} from '@/lib/types'
import { mockGroups, mockUsers } from '@/lib/mock-data'
import { createInitialChatState } from '@/lib/chat-seed'
import { DEFAULT_GROUP_KEY } from '@/lib/task-group-utils'
import { seedInboxNotifications } from '@/lib/inbox-notifications'
import { restoreSession } from '@/lib/auth-api'
import { clearTokens, getRefreshToken } from '@/lib/auth-tokens'

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [groups, setGroupsState] = useState<Group[]>([])
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedTaskListId, setSelectedTaskListId] = useState<string | null>(null)
  const [theme, setThemeState] = useState<Theme>('system')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [inboxNotifications, setInboxNotifications] = useState<InboxNotification[]>([])
  const [pendingNewsId, setPendingNewsIdState] = useState<string | null>(null)
  const [pendingSupportNav, setPendingSupportNavState] = useState<PendingSupportNav | null>(null)
  const [chatThreads, setChatThreads] = useState<ChatThreadSummary[]>([])
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
  const [selectedChatPeerId, setSelectedChatPeerId] = useState<string | null>(null)

  const applyThemeToDocument = useCallback((t: Theme) => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = t === 'dark' || (t === 'system' && systemDark)
    root.classList.toggle('dark', isDark)
    localStorage.setItem('theme', t)
  }, [])

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setThemeState(savedTheme)
    }
  }, [])

  // Синхронизация класса на <html> (первый проход, смена темы из setTheme дублирует — безопасно)
  useEffect(() => {
    applyThemeToDocument(theme)
  }, [theme, applyThemeToDocument])

  // Системная тема: плавно реагировать на смену ОС
  useEffect(() => {
    if (theme !== 'system' || typeof window === 'undefined') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
      const run = () => applyThemeToDocument('system')
      if (!reduce && typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(run)
      } else {
        run()
      }
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [theme, applyThemeToDocument])

  // Восстановление сессии по JWT (или очистка устаревшего `user` без токенов)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const me = await restoreSession()
        if (cancelled) return
        if (!me) {
          if (!getRefreshToken()) {
            const saved = localStorage.getItem('user')
            if (saved) localStorage.removeItem('user')
          }
          return
        }
        const saved = localStorage.getItem('user')
        let prev: User | null = null
        try {
          prev = saved ? (JSON.parse(saved) as User) : null
        } catch {
          prev = null
        }
        const merged: User = {
          id: me.id,
          email: me.email,
          name: me.name,
          phone: me.phone ?? (prev?.id === me.id ? prev.phone : undefined),
          gender: me.gender ?? (prev?.id === me.id ? prev.gender : undefined),
          birthYear: me.birthYear ?? (prev?.id === me.id ? prev.birthYear : undefined),
          avatar: me.avatar ?? (prev?.id === me.id ? prev.avatar : undefined),
        }
        setUser(merged)
        localStorage.setItem('user', JSON.stringify(merged))
        setGroupsState(mockGroups)
        setInboxNotifications(seedInboxNotifications())
        const chat = createInitialChatState(merged)
        setChatThreads(chat.threads)
        setChatMessages(chat.messages)
        setIsAuthenticated(true)
      } catch {
        if (!cancelled) {
          clearTokens()
          localStorage.removeItem('user')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const setCurrentUser = useCallback((newUser: User | null) => {
    setUser(newUser)
    if (newUser) {
      localStorage.setItem('user', JSON.stringify(newUser))
      setGroupsState(mockGroups)
      setInboxNotifications(seedInboxNotifications())
      setPendingNewsIdState(null)
      setPendingSupportNavState(null)
      const chat = createInitialChatState(newUser)
      setChatThreads(chat.threads)
      setChatMessages(chat.messages)
      setSelectedChatPeerId(null)
      setIsAuthenticated(true)
    } else {
      clearTokens()
      localStorage.removeItem('user')
      setGroupsState([])
      setInboxNotifications([])
      setPendingNewsIdState(null)
      setPendingSupportNavState(null)
      setChatThreads([])
      setChatMessages({})
      setSelectedChatPeerId(null)
      setIsAuthenticated(false)
      setSelectedGroupId(null)
      setSelectedSectionId(null)
      setSelectedTaskListId(null)
    }
  }, [])

  const setGroups = useCallback((newGroups: Group[]) => {
    setGroupsState(newGroups)
  }, [])

  const selectGroup = useCallback((groupId: string | null) => {
    setSelectedGroupId(groupId)
    setSelectedSectionId(null)
    setSelectedTaskListId(null)
  }, [])

  const selectSection = useCallback((sectionId: string | null) => {
    setSelectedSectionId(sectionId)
    setSelectedTaskListId(null)
  }, [])

  const selectTaskList = useCallback((taskListId: string | null) => {
    setSelectedTaskListId(taskListId)
  }, [])

  const setNavigationContext = useCallback(
    (ctx: { groupId: string | null; sectionId: string | null; taskListId: string | null }) => {
      setSelectedGroupId(ctx.groupId)
      setSelectedSectionId(ctx.sectionId)
      setSelectedTaskListId(ctx.taskListId)
    },
    []
  )

  const markInboxNotificationRead = useCallback((id: string) => {
    setInboxNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllInboxNotificationsRead = useCallback(() => {
    setInboxNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const setPendingNewsId = useCallback((id: string | null) => {
    setPendingNewsIdState(id)
  }, [])

  const setPendingSupportNav = useCallback((nav: PendingSupportNav | null) => {
    setPendingSupportNavState(nav)
  }, [])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      if (typeof document === 'undefined') {
        setThemeState(newTheme)
        return
      }
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const doc = document as Document & { startViewTransition?: (cb: () => void) => void }
      const run = () => {
        applyThemeToDocument(newTheme)
        flushSync(() => setThemeState(newTheme))
      }
      if (!reduce && typeof doc.startViewTransition === 'function') {
        doc.startViewTransition(run)
      } else {
        run()
      }
    },
    [applyThemeToDocument]
  )

  // Group actions
  const addGroup = useCallback((group: Group) => {
    setGroupsState(prev => [...prev, group])
  }, [])

  const updateGroup = useCallback((groupId: string, updates: Partial<Group>) => {
    setGroupsState(prev =>
      prev.map(g => (g.id === groupId ? { ...g, ...updates } : g))
    )
  }, [])

  const deleteGroup = useCallback((groupId: string) => {
    setGroupsState(prev => prev.filter(g => g.id !== groupId))
    if (selectedGroupId === groupId) {
      setSelectedGroupId(null)
      setSelectedSectionId(null)
      setSelectedTaskListId(null)
    }
  }, [selectedGroupId])

  // Section actions
  const addSection = useCallback((groupId: string, section: Section) => {
    setGroupsState(prev =>
      prev.map(g =>
        g.id === groupId ? { ...g, sections: [...g.sections, section] } : g
      )
    )
  }, [])

  const updateSection = useCallback((sectionId: string, updates: Partial<Section>) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s =>
          s.id === sectionId ? { ...s, ...updates } : s
        ),
      }))
    )
  }, [])

  const deleteSection = useCallback((sectionId: string) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.filter(s => s.id !== sectionId),
      }))
    )
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null)
      setSelectedTaskListId(null)
    }
  }, [selectedSectionId])

  // TaskList actions
  const addTaskList = useCallback((sectionId: string, taskList: TaskList) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s =>
          s.id === sectionId
            ? { ...s, taskLists: [...s.taskLists, taskList] }
            : s
        ),
      }))
    )
  }, [])

  const updateTaskList = useCallback((taskListId: string, updates: Partial<TaskList>) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.map(tl =>
            tl.id === taskListId ? { ...tl, ...updates } : tl
          ),
        })),
      }))
    )
  }, [])

  const deleteTaskList = useCallback((taskListId: string) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.filter(tl => tl.id !== taskListId),
        })),
      }))
    )
    if (selectedTaskListId === taskListId) {
      setSelectedTaskListId(null)
    }
  }, [selectedTaskListId])

  // Task actions
  const addTask = useCallback((taskListId: string, task: Task) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.map(tl =>
            tl.id === taskListId
              ? { ...tl, tasks: [task, ...tl.tasks] }
              : tl
          ),
        })),
      }))
    )
  }, [])

  const updateTask = useCallback(
    (taskListId: string, taskId: string, updates: Partial<Task>) => {
      setGroupsState(prev =>
        prev.map(g => ({
          ...g,
          sections: g.sections.map(s => ({
            ...s,
            taskLists: s.taskLists.map(tl =>
              tl.id === taskListId
                ? {
                    ...tl,
                    tasks: tl.tasks.map(t =>
                      t.id === taskId ? { ...t, ...updates } : t
                    ),
                  }
                : tl
            ),
          })),
        }))
      )
    },
    []
  )

  const deleteTask = useCallback((taskListId: string, taskId: string) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.map(tl =>
            tl.id === taskListId
              ? { ...tl, tasks: tl.tasks.filter(t => t.id !== taskId) }
              : tl
          ),
        })),
      }))
    )
  }, [])

  const renameTaskGroup = useCallback((taskListId: string, blockKey: string, newLabel: string) => {
    const trimmed = newLabel.trim()
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.map(tl => {
            if (tl.id !== taskListId) return tl
            const inBlock = (t: Task) =>
              blockKey === DEFAULT_GROUP_KEY
                ? !(t.groupName?.trim())
                : (t.groupName?.trim() || '') === blockKey
            return {
              ...tl,
              tasks: tl.tasks.map(t =>
                inBlock(t)
                  ? { ...t, groupName: trimmed ? trimmed : undefined }
                  : t
              ),
            }
          }),
        })),
      }))
    )
  }, [])

  const toggleTask = useCallback(
    (taskListId: string, taskId: string) => {
      setGroupsState(prev =>
        prev.map(g => ({
          ...g,
          sections: g.sections.map(s => ({
            ...s,
            taskLists: s.taskLists.map(tl =>
              tl.id === taskListId
                ? {
                    ...tl,
                    tasks: tl.tasks.map(t =>
                      t.id === taskId
                        ? {
                            ...t,
                            completed: !t.completed,
                            completedAt: !t.completed ? new Date() : undefined,
                            completedBy: !t.completed ? user! : undefined,
                          }
                        : t
                    ),
                  }
                : tl
            ),
          })),
        }))
      )

      // Add activity
      const task = groups
        .flatMap(g => g.sections)
        .flatMap(s => s.taskLists)
        .find(tl => tl.id === taskListId)
        ?.tasks.find(t => t.id === taskId)

      if (task && user) {
        const activity: Activity = {
          id: `a${Date.now()}`,
          userId: user.id,
          user: user,
          action: task.completed ? 'unchecked' : 'completed',
          targetName: task.title,
          timestamp: new Date(),
          taskListId,
        }
        addActivity(taskListId, activity)
      }
    },
    [groups, user]
  )

  const addActivity = useCallback((taskListId: string, activity: Activity) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.map(tl =>
            tl.id === taskListId
              ? { ...tl, activities: [activity, ...tl.activities] }
              : tl
          ),
        })),
      }))
    )
  }, [])

  const getSelectedGroup = useCallback(() => {
    return groups.find(g => g.id === selectedGroupId) || null
  }, [groups, selectedGroupId])

  const getSelectedSection = useCallback(() => {
    const group = getSelectedGroup()
    return group?.sections.find(s => s.id === selectedSectionId) || null
  }, [getSelectedGroup, selectedSectionId])

  const getSelectedTaskList = useCallback(() => {
    const section = getSelectedSection()
    return section?.taskLists.find(tl => tl.id === selectedTaskListId) || null
  }, [getSelectedSection, selectedTaskListId])

  const markAsRead = useCallback((taskListId: string) => {
    setGroupsState(prev =>
      prev.map(g => ({
        ...g,
        sections: g.sections.map(s => ({
          ...s,
          taskLists: s.taskLists.map(tl =>
            tl.id === taskListId ? { ...tl, unreadCount: 0 } : tl
          ),
        })),
      }))
    )
  }, [])

  const ensureChatThread = useCallback(
    (peer: User) => {
      if (!user || peer.id === user.id) return
      setChatMessages(prev => (prev[peer.id] ? prev : { ...prev, [peer.id]: [] }))
      setChatThreads(prev => {
        if (prev.some(t => t.peerId === peer.id)) return prev
        const row: ChatThreadSummary = {
          peerId: peer.id,
          peer,
          lastMessageAt: new Date(0),
          lastPreview: '',
          unreadCount: 0,
        }
        return [...prev, row].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      })
    },
    [user],
  )

  const sendChatText = useCallback(
    (peerId: string, text: string, replyTo?: ChatReplyRef) => {
      if (!user) return
      const trimmed = text.trim()
      if (!trimmed) return
      const msg: ChatMessage = {
        id: `cm${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        threadPeerId: peerId,
        senderId: user.id,
        createdAt: new Date(),
        kind: 'text',
        text: trimmed,
        replyTo,
      }
      setChatMessages(prev => ({
        ...prev,
        [peerId]: [...(prev[peerId] ?? []), msg],
      }))
      setChatThreads(prev => {
        const peer = mockUsers.find(u => u.id === peerId) ?? prev.find(t => t.peerId === peerId)?.peer
        if (!peer) return prev
        const others = prev.filter(t => t.peerId !== peerId)
        const row: ChatThreadSummary = {
          peerId,
          peer,
          lastMessageAt: msg.createdAt,
          lastPreview: trimmed,
          unreadCount: 0,
        }
        return [row, ...others].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      })
    },
    [user],
  )

  const sendChatVoice = useCallback(
    (peerId: string, mediaUrl: string, durationSec: number) => {
      if (!user) return
      const preview = 'Голосовое сообщение'
      const msg: ChatMessage = {
        id: `cm${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        threadPeerId: peerId,
        senderId: user.id,
        createdAt: new Date(),
        kind: 'voice',
        mediaUrl,
        durationSec,
        text: preview,
      }
      setChatMessages(prev => ({
        ...prev,
        [peerId]: [...(prev[peerId] ?? []), msg],
      }))
      setChatThreads(prev => {
        const peer = mockUsers.find(u => u.id === peerId) ?? prev.find(t => t.peerId === peerId)?.peer
        if (!peer) return prev
        const others = prev.filter(t => t.peerId !== peerId)
        const row: ChatThreadSummary = {
          peerId,
          peer,
          lastMessageAt: msg.createdAt,
          lastPreview: preview,
          unreadCount: 0,
        }
        return [row, ...others].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      })
    },
    [user],
  )

  const sendChatFiles = useCallback(
    (
      peerId: string,
      files: { url: string; fileName: string; mimeType: string; kind: 'image' | 'file' }[],
      options?: { caption?: string; combineAsAlbum?: boolean },
    ) => {
      if (!user || files.length === 0) return
      const now = Date.now()
      const caption = options?.caption?.trim() || undefined
      const allImages = files.every(f => f.kind === 'image')
      const combine =
        Boolean(options?.combineAsAlbum && allImages && files.length > 1)

      const previewFor = (msg: ChatMessage): string => {
        if (msg.caption) return msg.caption
        if (msg.kind === 'image') {
          const n = msg.mediaUrls?.length ?? (msg.mediaUrl ? 1 : 0)
          return n > 1 ? `${n} фото` : 'Фото'
        }
        return msg.fileName ?? 'Файл'
      }

      let newMessages: ChatMessage[]

      if (combine) {
        const urls = files.map(f => f.url)
        const msg: ChatMessage = {
          id: `cm${now}-alb-${Math.random().toString(36).slice(2, 7)}`,
          threadPeerId: peerId,
          senderId: user.id,
          createdAt: new Date(now),
          kind: 'image',
          mediaUrl: urls[0],
          mediaUrls: urls,
          caption,
        }
        newMessages = [msg]
      } else {
        newMessages = files.map((f, i) => ({
          id: `cm${now}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          threadPeerId: peerId,
          senderId: user.id,
          createdAt: new Date(now + i),
          kind: f.kind,
          mediaUrl: f.url,
          fileName: f.fileName,
          mimeType: f.mimeType,
          caption: i === 0 ? caption : undefined,
        }))
      }

      setChatMessages(prev => ({
        ...prev,
        [peerId]: [...(prev[peerId] ?? []), ...newMessages],
      }))
      const last = newMessages[newMessages.length - 1]!
      const lastPreview = previewFor(last)
      setChatThreads(prev => {
        const peer = mockUsers.find(u => u.id === peerId) ?? prev.find(t => t.peerId === peerId)?.peer
        if (!peer) return prev
        const others = prev.filter(t => t.peerId !== peerId)
        const row: ChatThreadSummary = {
          peerId,
          peer,
          lastMessageAt: last.createdAt,
          lastPreview,
          unreadCount: 0,
        }
        return [row, ...others].sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())
      })
    },
    [user],
  )

  const markChatThreadRead = useCallback((peerId: string) => {
    setChatThreads(prev =>
      prev.map(t => (t.peerId === peerId ? { ...t, unreadCount: 0 } : t)),
    )
  }, [])

  const store: AppStore = {
    currentUser: user,
    groups,
    selectedGroupId,
    selectedSectionId,
    selectedTaskListId,
    theme,
    isAuthenticated,
    inboxNotifications,
    pendingNewsId,
    pendingSupportNav,
    chatThreads,
    chatMessages,
    selectedChatPeerId,
    setCurrentUser,
    setGroups,
    selectGroup,
    selectSection,
    selectTaskList,
    setNavigationContext,
    setTheme,
    markInboxNotificationRead,
    markAllInboxNotificationsRead,
    setPendingNewsId,
    setPendingSupportNav,
    setSelectedChatPeerId,
    ensureChatThread,
    sendChatText,
    sendChatVoice,
    sendChatFiles,
    markChatThreadRead,
    addGroup,
    updateGroup,
    deleteGroup,
    addSection,
    updateSection,
    deleteSection,
    addTaskList,
    updateTaskList,
    deleteTaskList,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    renameTaskGroup,
    addActivity,
    getSelectedGroup,
    getSelectedSection,
    getSelectedTaskList,
    markAsRead,
  }

  return (
    <TooltipProvider delayDuration={400}>
      <AppStoreContext.Provider value={store}>
        {children}
      </AppStoreContext.Provider>
    </TooltipProvider>
  )
}

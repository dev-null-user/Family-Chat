'use client'

import { useState, useEffect, useId, useMemo } from 'react'
import { MobileNav, type MobileTab } from './mobile-nav'
import { GroupsList } from './groups/groups-list'
import { SectionsList } from './sections/sections-list'
import { TaskListsList } from './tasks/task-lists-list'
import { TaskListDetail } from './tasks/task-list-detail'
import { LoginForm } from './auth/login-form'
import { ProfilePage } from './profile/profile-page'
import { NewsPage } from './news/news-page'
import { SupportPage } from './support/support-page'
import { ChatPage } from './chat/chat-page'
import { ThemeToggle } from './theme-toggle'
import { NotificationsBell } from './notifications/notifications-bell'
import { useAppStore } from '@/lib/store'
import { logoutFromServer } from '@/lib/auth-api'
import { useGroupsColumnWidthPx } from '@/hooks/use-groups-column-width'
import { useViewportWidthHysteresis } from '@/hooks/use-media-max-width'
import { useIsMobile } from '@/components/ui/use-mobile'
import { useSectionsColumnWidthPx } from '@/hooks/use-sections-column-width'
import { useTaskListsColumnWidthPx } from '@/hooks/use-task-lists-column-width'
import type { InboxNavUiHint } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Home, Newspaper, HeadphonesIcon, User, LogOut, MessageCircle } from 'lucide-react'

type DesktopTab = 'home' | 'news' | 'chat' | 'support' | 'profile'
type HomeView = 'groups' | 'sections' | 'taskLists' | 'taskDetail'

const shellNavItems = [
  { id: 'home' as const, label: 'Главная', icon: Home },
  { id: 'news' as const, label: 'Новости', icon: Newspaper },
  { id: 'chat' as const, label: 'Чат', icon: MessageCircle },
  { id: 'support' as const, label: 'Поддержка', icon: HeadphonesIcon },
  { id: 'profile' as const, label: 'Профиль', icon: User },
]

const homePaneClass =
  'relative flex min-h-0 flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-border/75 lg:bg-card lg:shadow-[0_2px_24px_-10px_rgba(15,23,42,0.16),inset_0_1px_0_rgba(255,255,255,0.58)] lg:ring-1 lg:ring-black/[0.045] dark:lg:border-border/55 dark:lg:bg-card dark:lg:shadow-[0_2px_32px_-12px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.07)] dark:lg:ring-white/[0.07]'

const homePaneMutedClass =
  'relative flex min-h-0 flex-col overflow-hidden lg:rounded-2xl lg:border lg:border-border/75 lg:bg-background lg:shadow-[0_2px_24px_-10px_rgba(15,23,42,0.13),inset_0_1px_0_rgba(255,255,255,0.42)] lg:ring-1 lg:ring-black/[0.04] dark:lg:border-border/50 dark:lg:shadow-[0_2px_32px_-12px_rgba(0,0,0,0.58),inset_0_1px_0_rgba(255,255,255,0.05)] dark:lg:ring-white/[0.06]'

/** Ширина колонки «Разделы» (и запасная, если нет замера групп) */
const groupsColumnWidthClass =
  'min-w-[13rem] w-52 max-w-[15rem] 2xl:min-w-[14rem] 2xl:w-60'

const compactGroupsColumnClass =
  'min-w-[9rem] w-[10rem] max-w-[11rem] shrink-0 2xl:min-w-[9.5rem] 2xl:w-44'

/** Только «Группы» + плюс; строки групп — одна иконка (lg+, выбрана группа и узкий экран или открыт раздел) */
const groupsListIconOnlyColumnClass =
  'min-w-[6.75rem] w-[7rem] max-w-[7.5rem] shrink-0 2xl:min-w-[7rem] 2xl:max-w-[7.5rem]'

/** Волнистая «рельса» между колонками главной (только lg+): визуально отдельные блоки, не одна прямая черта */
function DesktopHomeColumnDivider({ className }: { className?: string }) {
  const rawId = useId()
  const pid = rawId.replace(/:/g, '')
  return (
    <div
      className={cn(
        'hidden h-full min-h-0 w-[14px] shrink-0 flex-col justify-stretch bg-gradient-to-b from-transparent via-muted/45 to-transparent px-0.5 lg:flex pointer-events-none select-none',
        className,
      )}
      aria-hidden
    >
      <svg className="h-full w-full min-h-[120px] text-primary/40 dark:text-primary/50" role="presentation">
        <defs>
          <pattern id={`hw-${pid}`} width="12" height="52" patternUnits="userSpaceOnUse">
            <path
              d="M6 0 Q8.5 13 6 26 Q3.5 39 6 52"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </pattern>
          <linearGradient id={`hf-${pid}`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#000" stopOpacity="1" />
            <stop offset="12%" stopColor="#fff" stopOpacity="1" />
            <stop offset="88%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#000" stopOpacity="1" />
          </linearGradient>
          <mask id={`hm-${pid}`}>
            <rect width="100%" height="100%" fill={`url(#hf-${pid})`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={`url(#hw-${pid})`} mask={`url(#hm-${pid})`} />
      </svg>
    </div>
  )
}

export function AppShell() {
  const {
    isAuthenticated,
    currentUser,
    groups,
    selectedGroupId,
    selectedSectionId,
    selectedTaskListId,
    selectGroup,
    selectSection,
    selectTaskList,
    setCurrentUser,
    inboxNotifications,
    chatThreads,
    selectedChatPeerId,
  } = useAppStore()
  const [mobileTab, setMobileTab] = useState<MobileTab>('home')
  const [desktopTab, setDesktopTab] = useState<DesktopTab>('home')
  const [homeView, setHomeView] = useState<HomeView>('groups')
  const [logoutOpen, setLogoutOpen] = useState(false)
  const isMobile = useIsMobile()

  const totalUnread = groups.reduce((sum, g) => sum + g.unreadCount, 0)

  const desktopNavBadges = useMemo(() => {
    const news = inboxNotifications.filter(n => !n.read && n.target.kind === 'news').length
    const support = inboxNotifications.filter(n => !n.read && n.target.kind === 'support').length
    const profile = inboxNotifications.filter(n => !n.read && n.target.kind === 'profile').length
    const chat = chatThreads.reduce((sum, t) => sum + t.unreadCount, 0)
    return {
      home: totalUnread,
      news,
      chat,
      support,
      profile,
    } as Record<DesktopTab, number>
  }, [inboxNotifications, totalUnread, chatThreads])

  /** Узкая колонка групп, когда открыт раздел со списками задач */
  const compactGroupsColumn = !!selectedSectionId
  /** Сужение ≤1279px — только иконки; полный вид снова только при ≥1536px (гистерезис) */
  const homeViewportNarrowHysteresis = useViewportWidthHysteresis(1279, 1536)
  /** Узкая колонка: выбрана группа + (узкий viewport или открыт раздел) */
  const groupsColumnCompact =
    !!selectedGroupId && !isMobile && (compactGroupsColumn || homeViewportNarrowHysteresis)
  const groupsColumnWidthPx = useGroupsColumnWidthPx(
    groups,
    !compactGroupsColumn && !isMobile && !groupsColumnCompact,
  )

  const selectedGroupForHome = useMemo(
    () => (selectedGroupId ? groups.find(g => g.id === selectedGroupId) : undefined),
    [groups, selectedGroupId],
  )
  const homeSections = selectedGroupForHome?.sections ?? []
  const selectedSectionForHome = useMemo(
    () => homeSections.find(s => s.id === selectedSectionId),
    [homeSections, selectedSectionId],
  )
  const homeTaskLists = selectedSectionForHome?.taskLists ?? []

  /** Цепочка: как группы при открытом разделе — разделы сжимаются при открытом списке задач или узком окне */
  const sectionsColumnCompact =
    !!selectedGroupId &&
    !!selectedSectionId &&
    !isMobile &&
    (!!selectedTaskListId || homeViewportNarrowHysteresis)
  /** Третья колонка: только при узком окне (глубже выбора в store нет) */
  const taskListsColumnCompact =
    !!selectedSectionId && !!selectedTaskListId && !isMobile && homeViewportNarrowHysteresis

  const sectionsColumnWidthPx = useSectionsColumnWidthPx(
    homeSections,
    !!selectedGroupId && !isMobile && !sectionsColumnCompact,
  )
  const taskListsColumnWidthPx = useTaskListsColumnWidthPx(
    homeTaskLists,
    !!selectedSectionId && !isMobile && !taskListsColumnCompact,
  )

  /** Узкая колонка «Группы»: иконка + мелкое название под ней, без стрелки/редактирования/длинной строки. */
  const groupsListIconOnlyRows =
    !isMobile && (homeViewportNarrowHysteresis || groupsColumnCompact)
  const sectionsListIconOnlyRows = false
  const taskListsListIconOnlyRows = false

  useEffect(() => {
    if (isMobile && mobileTab === 'home') {
      if (selectedTaskListId) {
        setHomeView('taskDetail')
      } else if (selectedSectionId) {
        setHomeView('taskLists')
      } else if (selectedGroupId) {
        setHomeView('sections')
      } else {
        setHomeView('groups')
      }
    }
  }, [selectedGroupId, selectedSectionId, selectedTaskListId, isMobile, mobileTab])

  if (!isAuthenticated) {
    return (
      <div className="app-shell-bg relative flex min-h-dvh items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl dark:bg-primary/20" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/8 blur-3xl dark:bg-primary/15" />
        </div>
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
    )
  }

  const handleGroupSelect = () => {
    if (isMobile) setHomeView('sections')
  }

  const handleSectionSelect = () => {
    if (isMobile) setHomeView('taskLists')
  }

  const handleTaskListSelect = () => {
    if (isMobile) setHomeView('taskDetail')
  }

  const handleBackToGroups = () => {
    selectGroup(null)
    if (isMobile) setHomeView('groups')
  }

  const handleBackToSections = () => {
    selectSection(null)
    if (isMobile) setHomeView('sections')
  }

  const handleBackToTaskLists = () => {
    selectTaskList(null)
    if (isMobile) setHomeView('taskLists')
  }

  const handleInboxNavigate = (hint: InboxNavUiHint) => {
    switch (hint) {
      case 'home_task_detail':
        setDesktopTab('home')
        setMobileTab('home')
        setHomeView('taskDetail')
        break
      case 'home_task_lists':
        setDesktopTab('home')
        setMobileTab('home')
        setHomeView('taskLists')
        break
      case 'home_sections':
        setDesktopTab('home')
        setMobileTab('home')
        setHomeView('sections')
        break
      case 'news':
        setDesktopTab('news')
        setMobileTab('news')
        break
      case 'support':
        setDesktopTab('support')
        setMobileTab('support')
        break
      case 'chat':
        setDesktopTab('chat')
        setMobileTab('chat')
        break
      case 'profile':
        setDesktopTab('profile')
        setMobileTab('profile')
        break
    }
  }

  /** На мобилке в открытом диалоге чата шапку с названием раздела не показываем — остаётся шапка переписки с «Назад». */
  const showMobileShellHeader =
    mobileTab !== 'home' && !(mobileTab === 'chat' && selectedChatPeerId)

  // Mobile layout
  if (isMobile) {
    return (
      <div className="app-shell-bg mobile-ui-compact flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden">
        {showMobileShellHeader && (
          <div className="flex shrink-0 items-center gap-3 border-b border-border/35 bg-background/45 px-4 py-3 backdrop-blur-md">
            <h1 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground">
              {shellNavItems.find(i => i.id === mobileTab)?.label}
            </h1>
            <NotificationsBell onInboxNavigate={handleInboxNavigate} />
          </div>
        )}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-transparent">
          {mobileTab === 'home' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              {homeView === 'groups' && (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <div className="flex shrink-0 items-center gap-3 border-b border-border/35 bg-background/45 px-4 py-3 backdrop-blur-md">
                    <h1 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-foreground md:text-lg">
                      FamilyHub
                    </h1>
                    <NotificationsBell onInboxNavigate={handleInboxNavigate} />
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <GroupsList onGroupSelect={handleGroupSelect} />
                  </div>
                </div>
              )}
              {homeView === 'sections' && (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <SectionsList
                    onSectionSelect={handleSectionSelect}
                    onBack={handleBackToGroups}
                  />
                </div>
              )}
              {homeView === 'taskLists' && (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <TaskListsList
                    onTaskListSelect={handleTaskListSelect}
                    onBack={handleBackToSections}
                  />
                </div>
              )}
              {homeView === 'taskDetail' && (
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                  <TaskListDetail onBack={handleBackToTaskLists} />
                </div>
              )}
            </div>
          )}
          {mobileTab === 'news' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <NewsPage />
            </div>
          )}
          {mobileTab === 'chat' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ChatPage />
            </div>
          )}
          {mobileTab === 'support' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <SupportPage />
            </div>
          )}
          {mobileTab === 'profile' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ProfilePage />
            </div>
          )}
        </main>

        <MobileNav currentTab={mobileTab} onTabChange={setMobileTab} />
      </div>
    )
  }

  // Desktop layout
  return (
    <>
    <div className="app-shell-bg flex h-dvh max-h-dvh min-h-0 gap-3 overflow-hidden p-3 md:gap-4 md:p-4">
      {/* Desktop Sidebar — отдельный блок с скруглением, не «липнет» к краю */}
      <aside className="app-chrome-panel flex h-full min-h-0 w-[13.5rem] shrink-0 flex-col overflow-hidden 2xl:w-[15.5rem]">
        {/* Logo */}
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-border/65 px-3 2xl:gap-3 2xl:px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-semibold text-foreground text-sm">FamilyHub</h1>
            <p className="text-[10px] text-muted-foreground truncate max-xl:hidden">Семейное пространство</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain p-1.5 2xl:p-2">
          {shellNavItems.map((item) => {
            const badge = desktopNavBadges[item.id]
            return (
            <Button
              key={item.id}
              variant={desktopTab === item.id ? 'secondary' : 'ghost'}
              className={cn(
                'h-9 w-full justify-start gap-2 px-2 2xl:h-10 2xl:gap-3 2xl:px-3',
                desktopTab === item.id && 'bg-primary/10 text-primary hover:bg-primary/15'
              )}
              onClick={() => setDesktopTab(item.id)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="min-w-0 truncate text-left text-sm">{item.label}</span>
              {badge > 0 && (
                <span className="ml-auto h-5 min-w-5 px-1.5 text-[10px] font-medium bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </Button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-border/65 p-1.5 2xl:p-2">
          <div className="flex items-center gap-2 rounded-xl border border-border/40 bg-muted/45 p-1.5 shadow-sm dark:border-border/30 dark:bg-muted/35 2xl:gap-3 2xl:p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                {currentUser?.name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{currentUser?.name}</p>
              <p className="truncate text-[10px] text-muted-foreground">{currentUser?.email}</p>
            </div>
            <div className="flex items-center">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                aria-label="Выйти из аккаунта"
                onClick={() => setLogoutOpen(true)}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content — второй крупный блок */}
      <div className="app-chrome-panel-glass flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/60 bg-card/85 px-4 backdrop-blur-md dark:bg-card/70">
          <h2 className="font-semibold text-foreground">
            {desktopTab === 'home' && 'Главная'}
            {desktopTab === 'news' && 'Новости'}
            {desktopTab === 'chat' && 'Чат'}
            {desktopTab === 'support' && 'Техподдержка'}
            {desktopTab === 'profile' && 'Профиль'}
          </h2>
          <div className="flex items-center gap-1">
            <NotificationsBell onInboxNavigate={handleInboxNavigate} />
          </div>
        </header>

        {desktopTab === 'home' && homeViewportNarrowHysteresis && (
          <div
            className="hidden shrink-0 border-b border-border/50 bg-muted/20 px-4 py-1.5 text-center text-[11px] leading-snug text-muted-foreground lg:block"
            role="note"
          >
            Узкое окно: наведите на иконку — появится полное название группы, раздела или списка.
          </div>
        )}

        {/* Content Area */}
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {desktopTab === 'home' && (
            <div className="flex h-full min-h-0 min-w-0 flex-1 lg:bg-muted/25 lg:p-2.5 dark:lg:bg-muted/15">
              <aside
                className={cn(
                  homePaneClass,
                  'hidden h-full transition-[width,min-width,max-width] duration-300 ease-out lg:block',
                  groupsColumnCompact
                    ? groupsListIconOnlyColumnClass
                    : compactGroupsColumn
                      ? compactGroupsColumnClass
                      : 'min-w-[13rem] max-w-[min(560px,42vw)] shrink-0',
                  !groupsColumnCompact && !compactGroupsColumn && groupsColumnWidthPx == null && 'w-52 2xl:w-60',
                )}
                style={
                  !groupsColumnCompact && !compactGroupsColumn && groupsColumnWidthPx != null
                    ? { width: groupsColumnWidthPx }
                    : undefined
                }
              >
                <GroupsList
                  desktopIconOnlyRows={groupsListIconOnlyRows}
                  onGroupSelect={handleGroupSelect}
                />
              </aside>

              <DesktopHomeColumnDivider />

              <aside
                className={cn(
                  homePaneMutedClass,
                  'h-full shrink-0 transition-[min-width,width,max-width] duration-300 ease-out',
                  selectedGroupId ? 'block' : 'lg:block hidden',
                  sectionsColumnCompact
                    ? groupsListIconOnlyColumnClass
                    : 'min-w-[13rem] max-w-[min(560px,42vw)] 2xl:min-w-[14rem]',
                  !sectionsColumnCompact && sectionsColumnWidthPx == null && selectedGroupId && 'w-52 2xl:w-60',
                )}
                style={
                  !sectionsColumnCompact && sectionsColumnWidthPx != null
                    ? { width: sectionsColumnWidthPx }
                    : undefined
                }
              >
                <SectionsList
                  desktopIconOnlyRows={sectionsListIconOnlyRows}
                  onSectionSelect={handleSectionSelect}
                />
              </aside>

              {selectedSectionId ? (
                <>
                  <DesktopHomeColumnDivider className="hidden xl:flex" />
                  <aside
                    className={cn(
                      homePaneClass,
                      'h-full shrink-0 transition-[min-width,width,max-width] duration-300 ease-out hidden xl:block',
                      taskListsColumnCompact
                        ? groupsListIconOnlyColumnClass
                        : 'min-w-[13rem] max-w-[min(560px,42vw)] 2xl:min-w-[14rem]',
                      !taskListsColumnCompact && taskListsColumnWidthPx == null && 'w-56 2xl:w-64',
                    )}
                    style={
                      !taskListsColumnCompact && taskListsColumnWidthPx != null
                        ? { width: taskListsColumnWidthPx }
                        : undefined
                    }
                  >
                    <TaskListsList
                      desktopIconOnlyRows={taskListsListIconOnlyRows}
                      onTaskListSelect={handleTaskListSelect}
                    />
                  </aside>
                  <DesktopHomeColumnDivider className="hidden xl:flex" />
                </>
              ) : null}

              <DesktopHomeColumnDivider
                className={cn(selectedSectionId ? 'flex xl:hidden' : 'flex')}
              />

              <div className={cn(homePaneMutedClass, 'min-w-0 flex-1')}>
                <TaskListDetail />
              </div>
            </div>
          )}

          {desktopTab === 'news' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <NewsPage />
            </div>
          )}

          {desktopTab === 'chat' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ChatPage />
            </div>
          )}

          {desktopTab === 'support' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <SupportPage />
            </div>
          )}

          {desktopTab === 'profile' && (
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <ProfilePage />
            </div>
          )}
        </main>
      </div>
    </div>

    <AlertDialog open={logoutOpen} onOpenChange={setLogoutOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Выйти из аккаунта?</AlertDialogTitle>
          <AlertDialogDescription>
            Сессия на этом устройстве будет завершена. Войти снова можно по email и паролю.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={() => {
              void (async () => {
                await logoutFromServer()
                setCurrentUser(null)
                setLogoutOpen(false)
              })()
            }}
          >
            Выйти
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

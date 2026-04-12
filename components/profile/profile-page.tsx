'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppStore } from '@/lib/store'
import type { UserGender } from '@/lib/types'
import {
  loadNotificationPreferences,
  saveNotificationPreferences,
  type NotificationPreferences,
  type NotificationPreferenceKey,
} from '@/lib/notification-preferences'
import { AvatarCropDialog } from './avatar-crop-dialog'
import { GenderSelect } from './gender-select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  User,
  Mail,
  Phone,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Check,
  Eye,
  EyeOff,
  Camera,
  Bell,
  Newspaper,
  MessageCircle,
  Gift,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/** gap-0 py-0: у базового Card стоят gap-6 py-6 — без этого внутри блоков огромные вертикальные поля */
const glass =
  'gap-0 py-0 rounded-xl border border-border/45 bg-card/50 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-card/35'

export function ProfilePage() {
  const { currentUser, setCurrentUser, theme, setTheme } = useAppStore()

  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [phone, setPhone] = useState(currentUser?.phone || '')
  const [gender, setGender] = useState<UserGender | undefined>(currentUser?.gender)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cropOpen, setCropOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [cropSrc, setCropSrc] = useState<string | null>(null)
  const [notify, setNotify] = useState<NotificationPreferences>(() => loadNotificationPreferences())
  const [settingsTab, setSettingsTab] = useState('profile')
  const avatarFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!currentUser) return
    setName(currentUser.name)
    setEmail(currentUser.email)
    setPhone(currentUser.phone ?? '')
    setGender(currentUser.gender)
  }, [currentUser])

  useEffect(() => {
    setNotify(loadNotificationPreferences())
  }, [])

  const setNotifyKey = useCallback((key: NotificationPreferenceKey, value: boolean) => {
    setNotify(prev => {
      const next = { ...prev, [key]: value }
      saveNotificationPreferences(next)
      return next
    })
  }, [])

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file?.type.startsWith('image/')) return
    const url = URL.createObjectURL(file)
    setCropSrc(url)
    setCropOpen(true)
  }

  const handleCropOpenChange = (open: boolean) => {
    setCropOpen(open)
    if (!open && cropSrc) {
      URL.revokeObjectURL(cropSrc)
      setCropSrc(null)
    }
  }

  const handleAvatarCropped = (dataUrl: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, avatar: dataUrl })
    }
    if (cropSrc) {
      URL.revokeObjectURL(cropSrc)
      setCropSrc(null)
    }
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      if (currentUser) {
        setCurrentUser({
          ...currentUser,
          name,
          email,
          phone,
          gender,
        })
      }
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 500)
  }

  const themeOptions = [
    { value: 'light' as const, label: 'Светлая', icon: Sun },
    { value: 'dark' as const, label: 'Темная', icon: Moon },
    { value: 'system' as const, label: 'Системная', icon: Monitor },
  ]

  const notifyRows: {
    key: NotificationPreferenceKey
    label: string
    hint: string
    icon: typeof Bell
  }[] = [
    {
      key: 'tasks',
      label: 'Задачи и группы',
      hint: 'Новые задачи, отметки, активность в ваших группах',
      icon: Bell,
    },
    {
      key: 'news',
      label: 'Новости',
      hint: 'Обновления приложения и новые функции',
      icon: Newspaper,
    },
    {
      key: 'support',
      label: 'Поддержка',
      hint: 'Ответы специалистов и статусы обращений',
      icon: MessageCircle,
    },
    {
      key: 'promo',
      label: 'Акции и предложения',
      hint: 'Промо, бонусы и персональные предложения',
      icon: Gift,
    },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <Tabs
        value={settingsTab}
        onValueChange={setSettingsTab}
        className="flex min-h-0 flex-1 flex-col gap-0"
      >
        <div className="shrink-0 border-b border-border/40 bg-background/55 px-2 py-2 backdrop-blur-sm md:px-3">
          <TabsList className="grid h-auto min-h-9 w-full grid-cols-2 gap-1 rounded-xl bg-muted/40 p-1 sm:grid-cols-3 dark:bg-muted/25">
            <TabsTrigger value="profile" className="px-1 py-2 text-[10px] font-medium sm:text-xs">
              Профиль
            </TabsTrigger>
            <TabsTrigger value="security" className="px-1 py-2 text-[10px] font-medium sm:text-xs">
              Безопасность
            </TabsTrigger>
            <TabsTrigger value="notifications" className="px-1 py-2 text-[10px] font-medium sm:text-xs">
              Уведомления
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto max-w-lg space-y-2 px-2.5 py-2 pb-2 md:max-w-xl md:space-y-2.5 md:px-3 md:py-2.5">
            <TabsContent value="profile" className="m-0 mt-0 space-y-2 focus-visible:outline-none">
              <Card className={cn('border-0 shadow-none', glass)}>
                <CardContent className="px-2.5 pb-2 pt-2 md:px-3 md:pb-2.5 md:pt-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <input
                        ref={avatarFileRef}
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        tabIndex={-1}
                        onChange={handleAvatarFileChange}
                      />
                      <Avatar className="h-16 w-16 border border-border/40 md:h-[4.5rem] md:w-[4.5rem]">
                        <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                        <AvatarFallback className="bg-primary/10 text-base text-primary sm:text-lg">
                          {currentUser?.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <button
                        type="button"
                        title="Фото"
                        aria-label="Загрузить фото"
                        className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md ring-2 ring-background"
                        onClick={() => avatarFileRef.current?.click()}
                      >
                        <Camera className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-foreground">{currentUser?.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{currentUser?.email}</p>
                      {currentUser?.gender && (
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          {currentUser.gender === 'male' ? 'Мужской пол' : 'Женский пол'}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className={cn('border-0 shadow-none', glass)}>
                <CardHeader className="gap-0 space-y-0 px-2.5 pb-0 pt-2 md:px-3">
                  <CardTitle className="text-sm font-semibold">Личные данные</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5 px-2.5 pb-2 pt-0 md:px-3">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] text-muted-foreground">Пол</Label>
                    <GenderSelect value={gender} onChange={setGender} />
                  </div>
                  <div className="grid gap-1.5 sm:grid-cols-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="name" className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        ФИО
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="ФИО"
                        className="h-9 text-sm"
                      />
                    </div>
                    <div className="space-y-0.5">
                      <Label htmlFor="phone" className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        Телефон
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+7 …"
                        className="h-9 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="email" className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="email@…"
                      className="h-9 text-sm"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className={cn('border-0 shadow-none', glass)}>
                <CardHeader className="gap-0 space-y-0 px-2.5 pb-0 pt-2 md:px-3">
                  <CardTitle className="text-sm font-semibold">Внешний вид</CardTitle>
                </CardHeader>
                <CardContent className="px-2.5 pb-2 pt-0 md:px-3">
                  <p className="mb-2 text-[10px] text-muted-foreground">Тема оформления</p>
                  <div className="grid grid-cols-3 gap-1">
                    {themeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          'flex flex-col items-center gap-0.5 rounded-lg border py-2 text-[10px] font-medium transition-colors',
                          theme === option.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border/50 bg-background/30 text-muted-foreground hover:border-primary/40'
                        )}
                      >
                        <option.icon className="h-4 w-4" />
                        {option.label}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="m-0 mt-0 space-y-2 focus-visible:outline-none">
              <Card className={cn('border-0 shadow-none', glass)}>
                <CardHeader className="gap-0 space-y-0 px-2.5 pb-0 pt-2 md:px-3">
                  <CardTitle className="text-sm font-semibold">Пароль</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-1.5 px-2.5 pb-2 pt-0 sm:grid-cols-2 md:px-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="currentPassword" className="text-[10px] text-muted-foreground">
                      Текущий
                    </Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        className="h-9 pr-9 text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="newPassword" className="text-[10px] text-muted-foreground">
                      Новый
                    </Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        className="h-9 pr-9 text-sm"
                      />
                      <button
                        type="button"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="m-0 mt-0 space-y-2 focus-visible:outline-none">
              <Card className={cn('border-0 shadow-none', glass)}>
                <CardHeader className="gap-1 space-y-0 px-2.5 pb-0 pt-2 md:px-3">
                  <CardTitle className="text-sm font-semibold">Уведомления</CardTitle>
                  <p className="text-[10px] leading-snug text-muted-foreground">
                    Выберите типы push и писем, которые хотите получать
                  </p>
                </CardHeader>
                <CardContent className="divide-y divide-border/40 px-2.5 pb-1.5 pt-0 md:px-3">
                  {notifyRows.map(row => (
                    <div key={row.key} className="flex items-start gap-2 py-1 first:pt-0 last:pb-0">
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground sm:h-8 sm:w-8 sm:rounded-lg">
                        <row.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium leading-tight text-foreground sm:text-sm">{row.label}</p>
                        <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{row.hint}</p>
                      </div>
                      <Switch
                        checked={notify[row.key]}
                        onCheckedChange={v => setNotifyKey(row.key, v)}
                        className="mt-0.5 shrink-0"
                        aria-label={row.label}
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </div>

        <div className="shrink-0 space-y-1.5 border-t border-border/50 bg-background/90 px-2.5 py-2 backdrop-blur-md md:px-3">
          <Button onClick={handleSave} disabled={saving} className="h-9 w-full text-sm">
            {saving ? (
              'Сохранение…'
            ) : saved ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Сохранено
              </>
            ) : (
              'Сохранить'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => setLogoutOpen(true)}
            className="h-9 w-full border-destructive/30 text-sm text-destructive hover:bg-destructive/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Выйти
          </Button>
        </div>
      </Tabs>

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
              onClick={() => setCurrentUser(null)}
            >
              Выйти
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AvatarCropDialog
        open={cropOpen}
        onOpenChange={handleCropOpenChange}
        imageSrc={cropSrc}
        onApply={handleAvatarCropped}
      />
    </div>
  )
}

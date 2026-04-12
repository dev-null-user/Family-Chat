'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, Calendar } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { authRegister, AuthApiError } from '@/lib/auth-api'
import { saveTokens } from '@/lib/auth-tokens'
import type { User, UserGender } from '@/lib/types'
import { GenderSelect } from '@/components/profile/gender-select'

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    birthYear: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: undefined as UserGender | undefined,
  })
  const [acceptPolicy, setAcceptPolicy] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [highlightGender, setHighlightGender] = useState(false)
  const { setCurrentUser } = useAppStore()

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setHighlightGender(false)

    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError('Пожалуйста, заполните все обязательные поля')
      return
    }

    if (!formData.gender) {
      setHighlightGender(true)
      setError('Укажите пол')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (formData.password.length < 8) {
      setError('Пароль должен быть не короче 8 символов')
      return
    }

    if (!acceptPolicy) {
      setError('Необходимо принять политику конфиденциальности')
      return
    }

    setIsLoading(true)
    try {
      const data = await authRegister({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
        gender: formData.gender,
        birthYear: formData.birthYear ? parseInt(formData.birthYear, 10) : undefined,
      })
      saveTokens(data.accessToken, data.refreshToken)
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        phone: data.user.phone ?? formData.phone.trim(),
        gender: data.user.gender ?? formData.gender,
        birthYear: data.user.birthYear ?? (formData.birthYear ? parseInt(formData.birthYear, 10) : undefined),
      }
      setCurrentUser(user)
      router.push('/')
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message)
      } else {
        setError('Не удалось связаться с сервером. Проверьте, что API запущен.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl bg-card">
      <CardHeader className="space-y-2 text-center pb-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-primary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="22" y1="11" x2="16" y2="11" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-semibold text-card-foreground">
          Создать аккаунт
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Присоединяйтесь к семейному пространству
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Полное имя *</FieldLabel>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Анна Иванова"
                  value={formData.name}
                  onChange={e => handleChange('name', e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
            </Field>
            
            <Field>
              <FieldLabel>Пол *</FieldLabel>
              <GenderSelect
                value={formData.gender}
                onChange={g => {
                  setHighlightGender(false)
                  setFormData(prev => ({ ...prev, gender: g }))
                }}
                showError={highlightGender}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="birthYear">Год рождения</FieldLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="birthYear"
                  type="number"
                  placeholder="1990"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.birthYear}
                  onChange={e => handleChange('birthYear', e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
            </Field>
            
            <Field>
              <FieldLabel htmlFor="phone">Номер телефона *</FieldLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  value={formData.phone}
                  onChange={e => handleChange('phone', e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
            </Field>
            
            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@example.com"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
            </Field>
            
            <Field>
              <FieldLabel htmlFor="password">Пароль *</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Минимум 8 символов"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  className="pl-10 pr-10 h-11 bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </Field>
            
            <Field>
              <FieldLabel htmlFor="confirmPassword">Подтвердите пароль *</FieldLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Повторите пароль"
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
            </Field>
          </FieldGroup>

          <div className="flex items-start gap-3 pt-2">
            <Checkbox
              id="policy"
              checked={acceptPolicy}
              onCheckedChange={(checked) => setAcceptPolicy(checked as boolean)}
              className="mt-0.5"
            />
            <label
              htmlFor="policy"
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              Я согласен с{' '}
              <Link href="/privacy" className="text-primary hover:text-primary/80">
                Политикой конфиденциальности
              </Link>
            </label>
          </div>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium mt-4"
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="mr-2" /> : null}
            {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
          </Button>

          <p className="text-center text-sm text-muted-foreground pt-2">
            Уже есть аккаунт?{' '}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Войти
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

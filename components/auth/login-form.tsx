'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff, Mail, Lock, Users } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { authLogin, AuthApiError } from '@/lib/auth-api'
import { saveTokens } from '@/lib/auth-tokens'
import type { User } from '@/lib/types'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { setCurrentUser } = useAppStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) {
      setError('Пожалуйста, заполните все поля')
      return
    }

    setIsLoading(true)
    try {
      const data = await authLogin(email.trim(), password)
      saveTokens(data.accessToken, data.refreshToken)
      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
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
    <Card className="w-full max-w-sm border-0 shadow-2xl bg-card">
      <CardHeader className="space-y-1 text-center pb-2 pt-6">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Users className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl font-semibold text-card-foreground">
          FamilyHub
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Войдите в семейный аккаунт
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-9 h-10 bg-background"
                  autoComplete="email"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-muted-foreground">Пароль</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Введите пароль"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-9 pr-9 h-10 bg-background"
                  autoComplete="current-password"
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
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}

          <div className="flex justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs text-primary hover:text-primary/80 transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full h-10"
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : null}
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            Нет аккаунта?{' '}
            <Link
              href="/auth/register"
              className="text-primary hover:text-primary/80 font-medium transition-colors"
            >
              Зарегистрироваться
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}

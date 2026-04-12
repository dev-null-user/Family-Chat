'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { authForgotPassword, AuthApiError } from '@/lib/auth-api'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Пожалуйста, введите email')
      return
    }

    setIsLoading(true)
    try {
      await authForgotPassword(email.trim())
      setIsSuccess(true)
    } catch (err) {
      if (err instanceof AuthApiError) {
        setError(err.message)
      } else {
        setError('Не удалось отправить запрос. Проверьте подключение к API.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md border-0 shadow-xl bg-card">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 dark:bg-green-900/30">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-semibold text-card-foreground">
            Проверьте почту
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Мы отправили инструкции по восстановлению пароля на {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/auth/login">
            <Button variant="outline" className="w-full h-11">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к входу
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-xl bg-card">
      <CardHeader className="space-y-2 text-center pb-4">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl font-semibold text-card-foreground">
          Забыли пароль?
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Введите email для восстановления доступа
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="anna@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-background"
                />
              </div>
            </Field>
          </FieldGroup>

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium"
            disabled={isLoading}
          >
            {isLoading ? <Spinner className="mr-2" /> : null}
            {isLoading ? 'Отправка...' : 'Отправить инструкции'}
          </Button>

          <Link href="/auth/login">
            <Button variant="ghost" className="w-full h-11 mt-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к входу
            </Button>
          </Link>
        </form>
      </CardContent>
    </Card>
  )
}

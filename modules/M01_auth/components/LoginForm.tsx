'use client'
import React, { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@core/components/ui/button'
import { Input } from '@core/components/ui/input'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Email o contraseña incorrectos. Verifica tus datos.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        id="login-email"
        placeholder="correo@empresa.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail className="h-4 w-4" />}
        required
        autoComplete="email"
        autoFocus
      />

      <Input
        label="Contraseña"
        type={showPassword ? 'text' : 'password'}
        id="login-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="pointer-events-auto text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        }
        required
        autoComplete="current-password"
      />

      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={loading}
        className="w-full mt-1"
        size="lg"
        id="login-submit"
      >
        Iniciar sesión
      </Button>

      <div className="text-center">
        <a
          href="/recuperar"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          ¿Olvidaste tu contraseña?
        </a>
      </div>
    </form>
  )
}

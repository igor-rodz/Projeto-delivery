'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/lib/auth-context'
import { toast } from 'sonner'

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'signup'>(searchParams.get('mode') === 'signup' ? 'signup' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn, signUp, user, business } = useAuth()

  useEffect(() => {
    if (user) {
      if (business) {
        router.push('/dashboard')
      } else {
        router.push('/onboarding')
      }
    }
  }, [user, business, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          toast.error('As senhas não coincidem')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          toast.error('A senha deve ter pelo menos 6 caracteres')
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password)
        if (error) {
          toast.error(error.message || 'Erro ao criar conta')
        } else {
          // Tenta fazer login automaticamente
          const loginResult = await signIn(email, password)
          if (!loginResult.error) {
            toast.success('Conta criada com sucesso!')
            router.push('/onboarding')
          } else {
            // Se não conseguiu logar, provavelmente precisa confirmar email
            toast.success('Conta criada! Verifique seu email para confirmar ou faça login.')
            setMode('login')
          }
        }
      } else {
        const { error } = await signIn(email, password)
        if (error) {
          toast.error('Email ou senha incorretos')
        } else {
          toast.success('Login realizado com sucesso!')
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="p-4">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Voltar
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center space-x-2">
              <img src="https://customer-assets.emergentagent.com/job_3cd58408-f2cd-4a5a-a11d-13da45360bc0/artifacts/t645xvxe_file_00000000209871f484e2bfad8a0b3268.png" alt="Delivio" className="h-12 w-auto" />
              <span className="text-2xl font-bold text-gray-900">Deliv<span className="text-orange-500">io</span></span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {mode === 'login' ? 'Entrar na sua conta' : 'Criar nova conta'}
            </h1>
            <p className="text-gray-600 text-center mb-8">
              {mode === 'login' 
                ? 'Acesse seu painel de gestão' 
                : 'Comece a vender online em minutos'
              }
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="h-12 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Senha</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 mt-1"
                  />
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <a href="#" className="text-sm text-red-500 hover:text-red-600">
                    Esqueceu a senha?
                  </a>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-red-500 hover:bg-red-600 text-white rounded-full text-lg"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : mode === 'login' ? (
                  'Entrar'
                ) : (
                  'Criar Conta'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              {mode === 'login' ? (
                <p className="text-gray-600">
                  Não tem uma conta?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-red-500 font-semibold hover:text-red-600"
                  >
                    Cadastre-se
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-red-500 font-semibold hover:text-red-600"
                  >
                    Entrar
                  </button>
                </p>
              )}
            </div>
          </div>

          <p className="text-center text-gray-500 text-sm mt-6">
            Ao continuar, você concorda com nossos{' '}
            <a href="#" className="text-red-500 hover:underline">Termos de Uso</a>
            {' '}e{' '}
            <a href="#" className="text-red-500 hover:underline">Política de Privacidade</a>
          </p>
        </div>
      </div>
    </div>
  )
}

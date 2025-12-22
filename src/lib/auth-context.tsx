'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Business } from '@/types/database'

interface AuthContextType {
  user: User | null
  session: Session | null
  business: Business | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  refreshBusiness: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [business, setBusiness] = useState<Business | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchBusiness = async (userId: string) => {
    const { data } = await supabase
      .from('businesses')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    setBusiness(data)
    return data
  }

  const refreshBusiness = async () => {
    if (user) {
      await fetchBusiness(user.id)
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchBusiness(session.user.id).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await fetchBusiness(session.user.id)
        } else {
          setBusiness(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/onboarding`
      }
    })
    
    // Se o usuário foi criado e não precisa confirmar email, faz login automático
    if (!error && data.user && !data.user.identities?.length) {
      // Usuário já existe
      return { error: new Error('Este email já está cadastrado') as Error }
    }
    
    return { error: error as Error | null, user: data.user }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error as Error | null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setBusiness(null)
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      business,
      loading,
      signUp,
      signIn,
      signOut,
      refreshBusiness
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

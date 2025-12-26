import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Debug: verificar se as variáveis estão definidas
if (typeof window !== 'undefined') {
  console.log('[Supabase Debug] URL defined:', !!supabaseUrl)
  console.log('[Supabase Debug] Key defined:', !!supabaseAnonKey)
  console.log('[Supabase Debug] Key starts with:', supabaseAnonKey?.substring(0, 10))
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase Error] Missing environment variables!')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'SET' : 'MISSING')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'SET' : 'MISSING')
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Helper to get public URL for storage
export function getPublicUrl(bucket: string, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

// Upload file to storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    })

  if (error) throw error
  return getPublicUrl(bucket, data.path)
}

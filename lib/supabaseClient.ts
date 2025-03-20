import { createClient } from '@supabase/supabase-js'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Types for your database
export type User = {
  id: string
  email: string
  stripe_customer_id?: string
  has_paid: boolean
  created_at: string
  updated_at?: string
}

export type Report = {
  id: string
  user_id: string
  title: string
  content: JSON
  status: 'draft' | 'submitted'
  created_at: string
  updated_at: string
}

export type Subscription = {
  id: string
  user_id: string
  stripe_customer_id: string
  stripe_subscription_id: string
  status: 'active' | 'inactive'
  plan_type: 'free' | 'premium'
  created_at: string
  updated_at: string
}

// Regular client for client-side operations (with RLS)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Admin client for server-side operations (bypasses RLS)
// This should only be used in server-side code (API routes, etc.)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : supabase; // Fallback to regular client if no service role key

// Helper functions with type safety
export async function getUserById(userId: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function getQuestionnaires() {
  const { data, error } = await supabase
    .from('questionnaires')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getUserResponses(userId: string, questionnaireId: string) {
  const { data, error } = await supabase
    .from('responses')
    .select('*, questionnaires(*)')
    .eq('user_id', userId)
    .eq('questionnaire_id', questionnaireId)
    .single()
  
  if (error) throw error
  return data
} 
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database'

type QuestSession = Database['public']['Tables']['quest_sessions']['Row']
type QuestSessionInsert = Database['public']['Tables']['quest_sessions']['Insert']
type QuestSessionUpdate = Database['public']['Tables']['quest_sessions']['Update']

export async function createQuestSession(data: QuestSessionInsert) {
  const supabase = createClient()
  
  const { data: session, error } = await supabase
    .from('quest_sessions')
    .insert(data)
    .select()
    .single()
  
  if (error) throw error
  return session
}

export async function getActiveQuestSession(userId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('quest_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateQuestSession(id: string, data: QuestSessionUpdate) {
  const supabase = createClient()
  
  const { data: session, error } = await supabase
    .from('quest_sessions')
    .update(data)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return session
}

export async function getQuestSessionStats(sessionId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('quest_session_stats')
    .select('*')
    .eq('id', sessionId)
    .single()
  
  if (error) throw error
  return data
}
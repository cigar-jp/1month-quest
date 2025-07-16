import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createQuestSession, getActiveQuestSession } from '@/lib/api/quest-sessions'
import { generateQuestTasks } from '@/lib/api/tasks'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const activeSession = await getActiveQuestSession(user.id)
    return NextResponse.json(activeSession)
  } catch (error) {
    console.error('Error fetching quest session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { title, description, start_date, end_date } = body
    
    if (!title || !start_date || !end_date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Check if user already has an active quest session
    const existingSession = await getActiveQuestSession(user.id)
    if (existingSession) {
      return NextResponse.json({ error: 'User already has an active quest session' }, { status: 400 })
    }
    
    // Create quest session
    const questSession = await createQuestSession({
      user_id: user.id,
      title,
      description,
      start_date,
      end_date,
      status: 'active'
    })
    
    // Generate tasks for the quest period
    const tasks = await generateQuestTasks(
      user.id,
      questSession.id,
      start_date,
      end_date
    )
    
    return NextResponse.json({ questSession, tasks })
  } catch (error) {
    console.error('Error creating quest session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
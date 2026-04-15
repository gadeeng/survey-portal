import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// GET - Ambil semua entitas
export async function GET() {
  const supabase = await createClient()

  const { data: entities, error } = await supabase
    .from('entities')
    .select('*')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entities })
}

// POST - Tambah entitas baru
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const session = JSON.parse(sessionCookie.value)
  if (session.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { name, parent_id, level } = await request.json()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entities')
    .insert({ name, parent_id: parent_id || null, level })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ entity: data })
}
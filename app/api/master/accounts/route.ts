import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

// GET - Ambil semua akun master
export async function GET() {
  const supabase = await createClient()

  const { data: users, error } = await supabase
    .from('users')
    .select('id, username, role, is_active, created_at')
    .eq('role', 'master')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ users })
}

// POST - Tambah akun master baru
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

  const { username, password } = await request.json()
  const supabase = await createClient()

  // Cek apakah username sudah ada
  const { data: existing } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username sudah digunakan' }, { status: 400 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const { error } = await supabase
    .from('users')
    .insert({ username, password: hashedPassword, role: 'master' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
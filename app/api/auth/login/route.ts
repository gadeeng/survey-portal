import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { encrypt } from '@/lib/session'

export async function POST(request: NextRequest) {
  const { username, password } = await request.json()

  const supabase = await createClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single()

  if (error || !user) {
    return NextResponse.json(
      { error: 'Username atau password salah' },
      { status: 401 }
    )
  }

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Username atau password salah' },
      { status: 401 }
    )
  }

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role }
  })

  const sessionData = await encrypt({
    id: user.id,
    username: user.username,
    role: user.role
  })

  response.cookies.set('user_session', sessionData, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 8,
    path: '/'
  })

  return response
}
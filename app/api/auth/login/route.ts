import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import bcrypt from 'bcryptjs'
import { createSession } from '@/lib/session'
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting: maks 5 percobaan per menit per IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || '127.0.0.1'
  const limitResult = await rateLimit(ip, 5, 60 * 1000)

  if (!limitResult.success) {
    return NextResponse.json(
      { error: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 1 menit.' },
      { status: 429 }
    )
  }

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

  // Simpan sesi menggunakan utilitas terpusat
  await createSession({
    id: user.id,
    username: user.username,
    role: user.role
  })

  return NextResponse.json({
    success: true,
    user: { id: user.id, username: user.username, role: user.role }
  })
}
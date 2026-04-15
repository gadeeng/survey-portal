import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = JSON.parse(sessionCookie.value)
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}
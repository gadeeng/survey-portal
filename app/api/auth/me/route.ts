import { NextResponse } from 'next/server'
import { verifySession } from '@/lib/session'

export async function GET() {
  try {
    const user = await verifySession()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    return NextResponse.json({ user })
  } catch {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }
}
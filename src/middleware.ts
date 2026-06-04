import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('user_session')

  if (!sessionCookie || !sessionCookie.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const user = await decrypt(sessionCookie.value)
    
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (request.nextUrl.pathname.startsWith('/admin') && user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/master', request.url))
    }

    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/master/:path*', '/admin/:path*'],
}
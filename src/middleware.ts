import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('user_session')
  const { pathname } = request.nextUrl

  let user = null
  if (sessionCookie?.value) {
    try {
      user = await decrypt(sessionCookie.value)
    } catch {
      // Ignore decryption errors
    }
  }

  // 1. Proteksi rute yang membutuhkan login (/master, /admin)
  const isAuthRoute = pathname.startsWith('/master') || pathname.startsWith('/admin')
  if (isAuthRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    if (pathname.startsWith('/admin') && user.role !== 'super_admin') {
      return NextResponse.redirect(new URL('/master', request.url))
    }
  }

  // 2. Jika sudah login dan mengakses halaman tamu (/login atau /), arahkan ke /master
  const isGuestRoute = pathname === '/login' || pathname === '/'
  if (isGuestRoute && user) {
    return NextResponse.redirect(new URL('/master', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/master/:path*', '/admin/:path*'],
}
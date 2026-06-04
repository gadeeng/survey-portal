import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const secretKey = process.env.JWT_SECRET_KEY || 'pelindo-survey-super-secret-key-change-me'
if (
  process.env.NODE_ENV === 'production' &&
  (!process.env.JWT_SECRET_KEY || process.env.JWT_SECRET_KEY === 'pelindo-survey-super-secret-key-change-me')
) {
  throw new Error('JWT_SECRET_KEY must be set to a secure unique key in production environment!')
}
const key = new TextEncoder().encode(secretKey)

export interface SessionPayload {
  id: string
  username: string
  role: string
  [key: string]: any
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(key)
}

export async function decrypt(input: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    })
    return payload as SessionPayload
  } catch (error) {
    return null
  }
}

export async function verifySession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('user_session')?.value
  
  if (!sessionCookie) return null
  
  return await decrypt(sessionCookie)
}

export async function createSession(payload: SessionPayload) {
  const expires = new Date(Date.now() + 8 * 60 * 60 * 1000)
  const session = await encrypt(payload)
  
  const cookieStore = await cookies()
  cookieStore.set('user_session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expires,
    path: '/',
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_session')
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  username: string
  role: string
}

const IconDashboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
)

const IconPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
  </svg>
)

const IconChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
  </svg>
)

const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me')
        if (!res.ok) {
          router.push('/login')
          return
        }
        const data = await res.json()
        setUser(data.user)
      } catch {
        router.push('/login')
      } finally {
        setChecking(false)
      }
    }
    fetchUser()
  }, [router])

  const handleLogout = () => setShowLogoutModal(true)

  const confirmLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const menuItems = [
    { href: '/master', label: 'Dashboard', icon: <IconDashboard /> },
    { href: '/master/survey/new', label: 'Buat Survey', icon: <IconPlus /> },
    { href: '/master/results', label: 'Hasil Survey', icon: <IconChart /> },
  ]

  if (user?.role === 'super_admin') {
    menuItems.push({ href: '/master/accounts', label: 'Kelola Akun', icon: <IconUsers /> })
    menuItems.push({ href: '/master/entities', label: 'Kelola Entitas', icon: <IconBuilding /> })
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#A9D6E5] border-t-[#1B6FA8] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Memuat...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen flex font-[family-name:var(--font-jakarta)] bg-[#f0f4f8]">
        {/* Sidebar */}
        <aside className="w-[260px] min-h-screen bg-gradient-to-b from-[#0d1f3c] to-[#1B6FA8] flex flex-col fixed top-0 left-0 bottom-0 z-50 shadow-[4px_0_20px_rgba(13,31,60,0.15)]">
          {/* Sidebar Header */}
          <div className="px-6 pt-7 pb-6 border-b border-white/8">
            <div className="flex items-center gap-3">
              <img
                src="/logo-pds.png"
                alt="PT Pelindo Daya Sejahtera"
                className="h-[50px] w-auto object-contain brightness-0 invert opacity-90"
              />
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-white/30 px-3 mb-2 mt-4">
              Menu Utama
            </div>
            {menuItems.slice(0, 3).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] mb-0.5 text-sm font-medium no-underline transition-all duration-200 cursor-pointer
                  ${pathname === item.href
                    ? 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                    : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                  }`}
              >
                <span className={`flex items-center shrink-0 transition-colors duration-200 ${pathname === item.href ? 'text-[#A9D6E5]' : ''}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}

            {user?.role === 'super_admin' && (
              <>
                <div className="text-[10px] font-semibold tracking-[1.5px] uppercase text-white/30 px-3 mb-2 mt-4">
                  Administrasi
                </div>
                {menuItems.slice(3).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-[11px] rounded-[10px] mb-0.5 text-sm font-medium no-underline transition-all duration-200 cursor-pointer
                      ${pathname === item.href
                        ? 'bg-white/15 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
                        : 'text-white/60 hover:bg-white/8 hover:text-white/90'
                      }`}
                  >
                    <span className={`flex items-center shrink-0 transition-colors duration-200 ${pathname === item.href ? 'text-[#A9D6E5]' : ''}`}>
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="px-3 py-4 border-t border-white/8">
            <div className="flex items-center gap-3 p-3 rounded-[10px] bg-white/6 mb-2">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2C8FC3] to-[#A9D6E5] flex items-center justify-center text-sm font-semibold text-white shrink-0">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-white truncate">
                  {user?.username}
                </div>
                <div className="text-[11px] text-white/40 capitalize">
                  {user?.role?.replace('_', ' ')}
                </div>
              </div>
            </div>
            <button
              className="flex items-center gap-2.5 w-full py-2.5 px-3.5 rounded-lg border-none bg-transparent text-white/40 text-[13px] font-[family-name:var(--font-jakarta)] font-medium cursor-pointer transition-all duration-200 text-left hover:bg-red-500/15 hover:text-red-300"
              onClick={handleLogout}
            >
              <IconLogout />
              Keluar dari Portal
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 ml-[260px] min-h-screen flex flex-col">
          {/* Top Bar */}
          <div className="bg-white border-b border-[#e5e9f0] px-8 h-16 flex items-center justify-between sticky top-0 z-40 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <span className="text-lg font-bold text-[#0d1f3c]">
              {menuItems.find(m => m.href === pathname)?.label ?? 'Portal Survey'}
            </span>
            <div className="flex items-center gap-2 bg-[#f0f7ff] border border-blue-200 rounded-[20px] px-3.5 py-1.5 text-xs font-medium text-[#1B6FA8]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
              Portal Aktif
            </div>
          </div>
          {/* Page Content */}
          <div className="flex-1 p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-[200] animate-[fadeIn_0.15s_ease]"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 w-[360px] text-center shadow-[0_20px_60px_rgba(0,0,0,0.2)] animate-[slideUp_0.2s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-[52px] h-[52px] rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-red-600">
              <IconLogout />
            </div>
            <p className="text-base font-semibold text-[#0d1f3c] mb-2">
              Keluar dari Portal?
            </p>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
              Sesi Anda akan diakhiri dan Anda akan diarahkan ke halaman login.
            </p>
            <div className="flex gap-2.5">
              <button
                className="flex-1 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm font-[family-name:var(--font-jakarta)] font-medium cursor-pointer transition-colors duration-150 hover:bg-gray-100"
                onClick={() => setShowLogoutModal(false)}
              >
                Batal
              </button>
              <button
                className="flex-1 py-2.5 rounded-lg border-none bg-red-600 text-white text-sm font-[family-name:var(--font-jakarta)] font-semibold cursor-pointer transition-colors duration-150 hover:bg-red-700"
                onClick={confirmLogout}
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
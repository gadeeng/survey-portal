'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface MasterUser {
  id: string
  username: string
  role: string
  is_active: boolean
  created_at: string
}

export default function AccountsPage() {
  const router = useRouter()
  const [users, setUsers] = useState<MasterUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; username: string } | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/login'); return }
      const data = await res.json()
      if (data.user.role !== 'super_admin') { router.push('/master'); return }
      fetchUsers()
    }
    checkAuth()
  }, [router])

  const fetchUsers = async () => {
    const res = await fetch('/api/master/accounts')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!username || !password) { setError('Username dan password wajib diisi'); return }
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/master/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(data.error); return }
    setUsername('')
    setPassword('')
    setShowForm(false)
    fetchUsers()
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    await fetch(`/api/master/accounts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !currentStatus }),
    })
    fetchUsers()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    const res = await fetch(`/api/master/accounts/${deleteTarget.id}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      setError(data.error)
    } else {
      fetchUsers()
    }
    setDeleteTarget(null)
  }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0d1f3c]">Kelola Akun Admin</h2>
        <button
          className="flex items-center gap-1.5 bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-[18px] py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap"
          onClick={() => { setShowForm(!showForm); setError('') }}
        >
          {showForm ? '✕ Tutup Form' : '+ Tambah Akun'}
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari username..."
          className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg pl-9 pr-9 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#374151] text-lg leading-none"
          >×</button>
        )}
      </div>

      {/* ── Add Account Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e5e9f0] p-4 sm:p-6 mb-5">
          <p className="text-[14px] sm:text-[15px] font-bold text-[#0d1f3c] mb-4">Tambah Akun Admin Baru</p>
          <div className="w-full max-w-[420px]">
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg px-3.5 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans"
              />
            </div>
            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg px-3.5 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans"
              />
            </div>
            {error && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3.5 py-2.5 text-[13px] text-[#dc2626] font-medium mb-4">
                {error}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-5 py-2 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="bg-white border border-[#dde3ec] text-[#374151] text-[13px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:bg-[#f0f4f8] hover:border-[#b8d4e8] font-sans"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <p className="text-sm text-[#6b7280] py-4">Memuat data...</p>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e9f0] py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">👤</div>
          <p className="text-sm text-[#6b7280]">Belum ada akun master yang terdaftar</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e9f0] py-12 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">🔍</div>
          <p className="text-sm text-[#6b7280]">Tidak ada akun yang cocok dengan "<strong>{search}</strong>"</p>
        </div>
      ) : (
        <>
          {/* ── DESKTOP: Table (sm and up) ── */}
          <div className="hidden sm:block bg-white rounded-xl border border-[#e5e9f0] overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-[#f8fafc] border-b border-[#e5e9f0]">
                <tr>
                  {['Username', 'Dibuat', 'Status', 'Aksi'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold tracking-widest uppercase text-[#8fa0b4]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-[#f3f4f6] last:border-b-0 transition-colors hover:bg-[#fafbfc]">
                    {/* Username */}
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C8FC3] to-[#A9D6E5] inline-flex items-center justify-center text-[13px] font-bold text-white shrink-0">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                        <span className="font-semibold text-[#0d1f3c]">{user.username}</span>
                      </div>
                    </td>
                    {/* Tanggal */}
                    <td className="px-5 py-3.5 align-middle text-[13px] text-[#8fa0b4]">
                      {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </td>
                    {/* Status */}
                    <td className="px-5 py-3.5 align-middle">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${user.is_active ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${user.is_active ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    {/* Aksi */}
                    <td className="px-5 py-3.5 align-middle">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleActive(user.id, user.is_active)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer font-sans transition-all ${user.is_active
                            ? 'border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]'
                            : 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7]'}`}
                        >
                          {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: user.id, username: user.username })}
                          className="text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer font-sans transition-all border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE: Card List (below sm) ── */}
          <div className="flex flex-col gap-2.5 sm:hidden">
            {filtered.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl border border-[#e5e9f0] px-4 py-3.5"
              >
                {/* Top row: avatar + name + status badge */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2C8FC3] to-[#A9D6E5] inline-flex items-center justify-center text-[14px] font-bold text-white shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#0d1f3c] text-[14px] truncate">{user.username}</p>
                      <p className="text-[11px] text-[#a0aec0] mt-0.5">
                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  {/* Status badge */}
                  <span className={`inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${user.is_active ? 'bg-[#dcfce7] text-[#15803d]' : 'bg-[#fee2e2] text-[#b91c1c]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${user.is_active ? 'bg-[#22c55e]' : 'bg-[#ef4444]'}`} />
                    {user.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>

                {/* Action buttons — full width row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className={`flex-1 text-[12px] font-semibold py-2 rounded-lg cursor-pointer font-sans transition-all ${user.is_active
                      ? 'border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]'
                      : 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7]'}`}
                  >
                    {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                  <button
                    onClick={() => setDeleteTarget({ id: user.id, username: user.username })}
                    className="flex-1 text-[12px] font-semibold py-2 rounded-lg cursor-pointer font-sans transition-all border border-[#fecaca] bg-white text-[#dc2626] hover:bg-[#fef2f2]"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white w-full sm:w-[360px] sm:rounded-xl rounded-t-2xl border border-[#e5e9f0] px-5 pt-2 pb-8 sm:py-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar — mobile only */}
            <div className="w-10 h-1 bg-[#e5e7eb] rounded-full mx-auto mb-5 sm:hidden" />

            <div className="w-10 h-10 rounded-full bg-[#fef2f2] flex items-center justify-center mb-3">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path d="M8.5 3.5h3a1 1 0 0 1 1 1v1h3a.75.75 0 0 1 0 1.5h-.5l-.8 9.2A1.5 1.5 0 0 1 13.7 17H6.3a1.5 1.5 0 0 1-1.5-1.8L4 7h-.5a.75.75 0 0 1 0-1.5h3V4.5a1 1 0 0 1 1-1Zm1 1.5v1h1.5V5h-1.5ZM8 9a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 8 9Zm4 0a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 12 9Z" fill="#dc2626" />
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#0d1f3c] mb-1.5">Hapus akun ini?</p>
            <p className="text-[13px] text-[#6b7280] mb-5 leading-relaxed">
              Akun <span className="font-semibold text-[#0d1f3c]">{deleteTarget.username}</span> akan dihapus permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 text-[13px] font-semibold py-2.5 rounded-lg border border-[#dde3ec] bg-white text-[#374151] hover:bg-[#f0f4f8] cursor-pointer font-sans transition-all"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 text-[13px] font-semibold py-2.5 rounded-lg border-none bg-[#dc2626] text-white hover:bg-[#b91c1c] cursor-pointer font-sans transition-all"
              >
                Ya, hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
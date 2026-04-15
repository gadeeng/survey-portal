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

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-bold text-[#0d1f3c]">Kelola Akun Admin</h2>
        <button
          className="flex items-center gap-1.5 bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-[18px] py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90"
          onClick={() => { setShowForm(!showForm); setError('') }}
        >
          {showForm ? '✕ Tutup Form' : '+ Tambah Akun'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e5e9f0] p-6 mb-6">
          <p className="text-[15px] font-bold text-[#0d1f3c] mb-5">Tambah Akun Admin Baru</p>
          <div className="max-w-[420px]">
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
                className="bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-5 py-2 rounded-lg border-none cursor-pointer transition-opacity hover:not-disabled:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {submitting ? 'Menyimpan...' : 'Simpan Akun'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError('') }}
                className="bg-white border border-[#dde3ec] text-[#374151] text-[13px] font-semibold px-[18px] py-2 rounded-lg cursor-pointer transition-all hover:bg-[#f0f4f8] hover:border-[#b8d4e8] font-sans"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <p className="text-sm text-[#6b7280] py-4">Memuat data...</p>
      ) : users.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e9f0] py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">
            👤
          </div>
          <p className="text-sm text-[#6b7280]">Belum ada akun master yang terdaftar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e9f0] overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#f8fafc] border-b border-[#e5e9f0]">
              <tr>
                {['Username', 'Dibuat', 'Status', 'Aksi'].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-[11px] font-bold tracking-widest uppercase text-[#8fa0b4]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-[#f3f4f6] last:border-b-0 transition-colors hover:bg-[#fafbfc]"
                >
                  {/* Username */}
                  <td className="px-5 py-3.5 align-middle">
                    <div className="flex items-center">
                      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2C8FC3] to-[#A9D6E5] inline-flex items-center justify-center text-[13px] font-bold text-white mr-2.5 shrink-0">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                      <span className="font-semibold text-[#0d1f3c]">{user.username}</span>
                    </div>
                  </td>

                  {/* Tanggal */}
                  <td className="px-5 py-3.5 align-middle text-[13px] text-[#8fa0b4]">
                    {new Date(user.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-3.5 align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${user.is_active
                          ? 'bg-[#dcfce7] text-[#15803d]'
                          : 'bg-[#fee2e2] text-[#b91c1c]'
                        }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${user.is_active ? 'bg-[#22c55e]' : 'bg-[#ef4444]'
                          }`}
                      />
                      {user.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>

                  {/* Aksi */}
                  <td className="px-5 py-3.5 align-middle">
                    <button
                      onClick={() => handleToggleActive(user.id, user.is_active)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md cursor-pointer font-sans transition-all ${user.is_active
                          ? 'border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2] hover:border-[#fca5a5]'
                          : 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7] hover:border-[#86efac]'
                        }`}
                    >
                      {user.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
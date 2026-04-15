'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Entity {
  id: string
  name: string
  parent_id: string | null
  level: number
  is_active: boolean
}

const LEVEL_LABEL: Record<number, string> = {
  1: 'Entitas',
  2: 'Anak Perusahaan',
  3: 'Cabang/Unit',
}

const LEVEL_BADGE: Record<number, string> = {
  1: 'bg-[#e8f3fb] text-[#1B6FA8]',
  2: 'bg-[#ede9fe] text-[#6d28d9]',
  3: 'bg-[#fff7ed] text-[#c2410c]',
}

export default function EntitiesPage() {
  const router = useRouter()
  const [entities, setEntities] = useState<Entity[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null)
  const [name, setName] = useState('')
  const [parentId, setParentId] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const res = await fetch('/api/auth/me')
      if (!res.ok) { router.push('/login'); return }
      const data = await res.json()
      if (data.user.role !== 'super_admin') { router.push('/master'); return }
      fetchEntities()
    }
    checkAuth()
  }, [router])

  const fetchEntities = async () => {
    const res = await fetch('/api/master/entities')
    const data = await res.json()
    setEntities(data.entities || [])
    setLoading(false)
  }

  const getLevel = (pid: string) => {
    if (!pid) return 1
    const parent = entities.find((e) => e.id === pid)
    return parent ? parent.level + 1 : 1
  }

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Nama entitas wajib diisi'); return }
    setSubmitting(true)
    setError('')

    if (editingEntity) {
      const res = await fetch(`/api/master/entities/${editingEntity.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        setSubmitting(false)
        return
      }
    } else {
      const level = getLevel(parentId)
      if (level > 3) { setError('Maksimal 3 level hierarki'); setSubmitting(false); return }
      const res = await fetch('/api/master/entities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, parent_id: parentId || null, level }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error)
        setSubmitting(false)
        return
      }
    }

    setName(''); setParentId(''); setShowForm(false); setEditingEntity(null)
    fetchEntities()
    setSubmitting(false)
  }

  const handleToggleActive = async (entity: Entity) => {
    await fetch(`/api/master/entities/${entity.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !entity.is_active }),
    })
    fetchEntities()
  }

  const handleEdit = (entity: Entity) => {
    setEditingEntity(entity)
    setName(entity.name)
    setParentId(entity.parent_id || '')
    setShowForm(true)
    setError('')
  }

  const openAddSub = (entity: Entity) => {
    setParentId(entity.id)
    setName('')
    setEditingEntity(null)
    setShowForm(true)
    setError('')
  }

  const openAddRoot = () => {
    setShowForm(true)
    setEditingEntity(null)
    setName('')
    setParentId('')
    setError('')
  }

  const renderEntities = (pid: string | null, depth: number = 0): React.ReactNode => {
    return entities
      .filter((e) => e.parent_id === pid)
      .map((entity) => (
        <div key={entity.id}>
          <div
            className={`flex items-center justify-between py-3 border-b border-[#f3f4f6] last:border-b-0 transition-colors hover:bg-[#fafbfc] ${!entity.is_active ? 'opacity-50' : ''}`}
            style={{ paddingLeft: `${depth * 24 + 20}px`, paddingRight: '20px' }}
          >
            {/* Left */}
            <div className="flex items-center gap-2.5">
              {depth > 0 && (
                <span className="text-[#c4cdd8] text-sm shrink-0">└</span>
              )}
              <span className="text-sm font-semibold text-[#0d1f3c]">{entity.name}</span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${LEVEL_BADGE[entity.level]}`}>
                {LEVEL_LABEL[entity.level]}
              </span>
              {!entity.is_active && (
                <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] shrink-0">
                  Nonaktif
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              {entity.level < 3 && entity.is_active && (
                <button
                  onClick={() => openAddSub(entity)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#bfdbfe] bg-[#e8f3fb] text-[#1B6FA8] cursor-pointer transition-all hover:bg-[#d0e8f7] hover:border-[#93c5fd] font-sans"
                >
                  + Sub
                </button>
              )}
              <button
                onClick={() => handleEdit(entity)}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#e5e9f0] bg-white text-[#374151] cursor-pointer transition-all hover:bg-[#f0f4f8] hover:border-[#b8d4e8] font-sans"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(entity)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer transition-all font-sans ${entity.is_active
                    ? 'border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]'
                    : 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7]'
                  }`}
              >
                {entity.is_active ? 'Nonaktifkan' : 'Aktifkan'}
              </button>
            </div>
          </div>
          {renderEntities(entity.id, depth + 1)}
        </div>
      ))
  }

  // Shared input classes
  const inputCls = "w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg px-3.5 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans"

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-bold text-[#0d1f3c]">Kelola Entitas</h2>
        <button
          onClick={openAddRoot}
          className="flex items-center gap-1.5 bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-[18px] py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90"
        >
          + Tambah Entitas
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e5e9f0] p-6 mb-6">
          <p className="text-[15px] font-bold text-[#0d1f3c] mb-5">
            {editingEntity ? `Edit: ${editingEntity.name}` : 'Tambah Entitas Baru'}
          </p>
          <div className="max-w-[420px]">
            {!editingEntity && (
              <div className="mb-4">
                <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                  Induk Entitas{' '}
                  <span className="font-normal text-[#9ca3af]">(kosongkan jika Level 1)</span>
                </label>
                <div className="relative">
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    <option value="">-- Level 1 (Entitas Utama) --</option>
                    {entities
                      .filter((e) => e.level < 3 && e.is_active)
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {'  '.repeat(e.level - 1)}{LEVEL_LABEL[e.level]}: {e.name}
                        </option>
                      ))}
                  </select>
                  {/* Custom chevron */}
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa0b4]"
                    width="10" height="6" viewBox="0 0 10 6"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0l5 6 5-6z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Nama Entitas
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama entitas"
                className={inputCls}
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
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(''); setEditingEntity(null) }}
                className="bg-white border border-[#dde3ec] text-[#374151] text-[13px] font-semibold px-[18px] py-2 rounded-lg cursor-pointer transition-all hover:bg-[#f0f4f8] hover:border-[#b8d4e8] font-sans"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-[#6b7280] py-4">Memuat data...</p>
      ) : entities.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e9f0] py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">
            🏢
          </div>
          <p className="text-sm text-[#6b7280]">Belum ada entitas yang terdaftar</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#e5e9f0] overflow-hidden">
          {renderEntities(null)}
        </div>
      )}
    </div>
  )
}
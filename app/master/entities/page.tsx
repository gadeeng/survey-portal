'use client'

import { useEffect, useRef, useState } from 'react'
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

// ── Dropdown menu for mobile actions ──────────────────────────────────────────
function ActionMenu({
  entity,
  onEdit,
  onAddSub,
  onToggle,
}: {
  entity: Entity
  onEdit: () => void
  onAddSub: () => void
  onToggle: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#e5e9f0] bg-white text-[#6b7280] hover:bg-[#f0f4f8] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-9 z-50 bg-white border border-[#e5e9f0] rounded-xl shadow-[0_8px_24px_rgba(13,31,60,0.12)] w-44 py-1 overflow-hidden">
          {entity.level < 3 && entity.is_active && (
            <button
              onClick={() => { onAddSub(); setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#1B6FA8] hover:bg-[#f0f7ff] transition-colors flex items-center gap-2"
            >
              <span className="text-base">＋</span> Tambah Sub
            </button>
          )}
          <button
            onClick={() => { onEdit(); setOpen(false) }}
            className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#374151] hover:bg-[#f8fafc] transition-colors flex items-center gap-2"
          >
            <span>✏️</span> Edit Nama
          </button>
          <div className="border-t border-[#f3f4f6] my-1" />
          <button
            onClick={() => { onToggle(); setOpen(false) }}
            className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors flex items-center gap-2 ${entity.is_active
              ? 'text-[#dc2626] hover:bg-[#fef2f2]'
              : 'text-[#15803d] hover:bg-[#f0fdf4]'}`}
          >
            <span>{entity.is_active ? '⏸' : '▶'}</span>
            {entity.is_active ? 'Nonaktifkan' : 'Aktifkan'}
          </button>
        </div>
      )}
    </div>
  )
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
  const [search, setSearch] = useState('')
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set())

  const toggleCollapse = (id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const hasChildren = (id: string) => entities.some((e) => e.parent_id === id)

  const getMatchingIds = (query: string): Set<string> => {
    if (!query.trim()) return new Set()
    const lower = query.toLowerCase()
    const matched = new Set<string>()
    entities.forEach((e) => {
      if (e.name.toLowerCase().includes(lower)) {
        matched.add(e.id)
        let current = e
        while (current.parent_id) {
          matched.add(current.parent_id)
          current = entities.find((x) => x.id === current.parent_id) || current
          if (!current.parent_id) break
        }
      }
    })
    return matched
  }

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
    // Scroll form into view on mobile
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const openAddSub = (entity: Entity) => {
    setParentId(entity.id)
    setName('')
    setEditingEntity(null)
    setShowForm(true)
    setError('')
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50)
  }

  const openAddRoot = () => {
    setShowForm(true)
    setEditingEntity(null)
    setName('')
    setParentId('')
    setError('')
  }

  const inputCls = "w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg px-3.5 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans"

  const renderEntities = (pid: string | null, depth: number = 0): React.ReactNode => {
    const matchingIds = getMatchingIds(search)
    const isSearching = search.trim().length > 0

    return entities
      .filter((e) => {
        if (e.parent_id !== pid) return false
        if (isSearching) return matchingIds.has(e.id)
        return true
      })
      .map((entity) => {
        const collapsed = collapsedIds.has(entity.id) && !isSearching
        const entityHasChildren = hasChildren(entity.id)

        // Clamp indentation on mobile to avoid overflow
        // desktop: depth * 24 + 20px | mobile: depth * 14 + 12px
        const desktopPL = depth * 24 + 20
        const mobilePL = depth * 14 + 12

        return (
          <div key={entity.id}>
            <div
              className={`
                flex items-center justify-between py-3 border-b border-[#f3f4f6] last:border-b-0
                transition-colors hover:bg-[#fafbfc] gap-2
                ${!entity.is_active ? 'opacity-50' : ''}
              `}
              style={{
                // CSS custom property trick for responsive padding via inline style
                paddingLeft: `clamp(${mobilePL}px, ${desktopPL}px, ${desktopPL}px)`,
                paddingRight: '12px',
              }}
            >
              {/* ── Left: collapse + tree icon + name + badges ── */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                {entityHasChildren && !isSearching ? (
                  <button
                    onClick={() => toggleCollapse(entity.id)}
                    className="text-[#94a3b8] hover:text-[#1B6FA8] transition-colors w-4 shrink-0 text-center font-mono text-xs"
                  >
                    {collapsed ? '▶' : '▼'}
                  </button>
                ) : (
                  <span className="w-4 shrink-0" />
                )}

                {depth > 0 && (
                  <span className="text-[#c4cdd8] text-sm shrink-0">└</span>
                )}

                <span className="text-[13px] sm:text-sm font-semibold text-[#0d1f3c] truncate">
                  {entity.name}
                </span>

                <span className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ${LEVEL_BADGE[entity.level]}`}>
                  {/* Show short label on mobile */}
                  <span className="sm:hidden">{entity.level === 1 ? 'L1' : entity.level === 2 ? 'L2' : 'L3'}</span>
                  <span className="hidden sm:inline">{LEVEL_LABEL[entity.level]}</span>
                </span>

                {!entity.is_active && (
                  <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] shrink-0">
                    Nonaktif
                  </span>
                )}
              </div>

              {/* ── Right: desktop buttons | mobile kebab menu ── */}
              <div className="shrink-0 flex items-center gap-1.5">
                {/* Desktop buttons */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {entity.level < 3 && entity.is_active && (
                    <button
                      onClick={() => openAddSub(entity)}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#bfdbfe] bg-[#e8f3fb] text-[#1B6FA8] cursor-pointer transition-all hover:bg-[#d0e8f7] font-sans"
                    >
                      + Sub
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(entity)}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md border border-[#e5e9f0] bg-white text-[#374151] cursor-pointer transition-all hover:bg-[#f0f4f8] font-sans"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(entity)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-md cursor-pointer transition-all font-sans ${entity.is_active
                      ? 'border border-[#fecaca] bg-[#fef2f2] text-[#dc2626] hover:bg-[#fee2e2]'
                      : 'border border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d] hover:bg-[#dcfce7]'}`}
                  >
                    {entity.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </div>

                {/* Mobile kebab menu */}
                <div className="sm:hidden">
                  <ActionMenu
                    entity={entity}
                    onEdit={() => handleEdit(entity)}
                    onAddSub={() => openAddSub(entity)}
                    onToggle={() => handleToggleActive(entity)}
                  />
                </div>
              </div>
            </div>

            {!collapsed && renderEntities(entity.id, depth + 1)}
          </div>
        )
      })
  }

  return (
    <div className="font-sans">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0d1f3c]">Kelola Entitas</h2>
        <button
          onClick={openAddRoot}
          className="flex items-center gap-1.5 bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-[18px] py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 whitespace-nowrap"
        >
          + Tambah Entitas
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
          placeholder="Cari entitas..."
          className={`${inputCls} pl-9`}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#374151] text-lg leading-none"
          >×</button>
        )}
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e5e9f0] p-4 sm:p-6 mb-5">
          <p className="text-[14px] sm:text-[15px] font-bold text-[#0d1f3c] mb-4">
            {editingEntity ? `Edit: ${editingEntity.name}` : 'Tambah Entitas Baru'}
          </p>
          <div className="w-full max-w-[420px]">
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
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8fa0b4]" width="10" height="6" viewBox="0 0 10 6">
                    <path d="M0 0l5 6 5-6z" fill="currentColor" />
                  </svg>
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">Nama Entitas</label>
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
                className="bg-white border border-[#dde3ec] text-[#374151] text-[13px] font-semibold px-4 py-2 rounded-lg cursor-pointer transition-all hover:bg-[#f0f4f8] hover:border-[#b8d4e8] font-sans"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── List ── */}
      {loading ? (
        <p className="text-sm text-[#6b7280] py-4">Memuat data...</p>
      ) : entities.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e5e9f0] py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">🏢</div>
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
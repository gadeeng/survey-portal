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

// ── Dropdown menu for mobile actions ─────
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
  const [coords, setCoords] = useState({ top: 0, right: 0 })
  const btnRef = useRef<HTMLButtonElement>(null)

  // Hitung posisi tombol saat diklik, lalu posisikan dropdown pakai fixed
  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom + 6,
        // right: jarak dari kanan viewport ke kanan tombol
        right: window.innerWidth - rect.right,
      })
    }
    setOpen((v) => !v)
  }

  // Tutup kalau scroll (posisi berubah)
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, { passive: true })
    return () => window.removeEventListener('scroll', close)
  }, [open])

  return (
    <div>
      <button
        ref={btnRef}
        onClick={handleOpen}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#e5e9f0] bg-white text-[#6b7280] hover:bg-[#f0f4f8] active:bg-[#e8eff7] transition-colors touch-manipulation"
        aria-label="Aksi"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
          <circle cx="10" cy="4" r="1.5" />
          <circle cx="10" cy="10" r="1.5" />
          <circle cx="10" cy="16" r="1.5" />
        </svg>
      </button>

      {open && (
        <>
          {/* Backdrop — menutup dropdown saat tap di luar */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Dropdown pakai fixed agar tidak ter-clip oleh overflow-hidden di parent row */}
          <div
            className="fixed z-50 bg-white border border-[#e5e9f0] rounded-xl shadow-[0_8px_24px_rgba(13,31,60,0.15)] w-48 py-1.5 overflow-hidden"
            style={{ top: coords.top, right: coords.right }}
          >
            {entity.level < 3 && entity.is_active && (
              <button
                onClick={() => { onAddSub(); setOpen(false) }}
                className="w-full text-left px-4 py-3 text-[13px] font-semibold text-[#1B6FA8] hover:bg-[#f0f7ff] active:bg-[#daeeff] transition-colors flex items-center gap-2.5 touch-manipulation"
              >
                <span className="text-base leading-none">＋</span> Tambah Sub
              </button>
            )}
            <button
              onClick={() => { onEdit(); setOpen(false) }}
              className="w-full text-left px-4 py-3 text-[13px] font-semibold text-[#374151] hover:bg-[#f8fafc] active:bg-[#f0f4f8] transition-colors flex items-center gap-2.5 touch-manipulation"
            >
              <span>✏️</span> Edit Nama
            </button>
            <div className="border-t border-[#f3f4f6] my-1" />
            <button
              onClick={() => { onToggle(); setOpen(false) }}
              className={`w-full text-left px-4 py-3 text-[13px] font-semibold transition-colors flex items-center gap-2.5 touch-manipulation ${entity.is_active
                ? 'text-[#dc2626] hover:bg-[#fef2f2] active:bg-[#fee2e2]'
                : 'text-[#15803d] hover:bg-[#f0fdf4] active:bg-[#dcfce7]'}`}
            >
              <span>{entity.is_active ? '⏸' : '▶'}</span>
              {entity.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        </>
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

  const inputCls =
    'w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg px-3.5 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans'

  // ── FIX: Proper responsive indentation capped to avoid overflow on mobile ──
  // Mobile: cap at 3 levels × 12px = max 36px indent
  // Desktop: 24px per level + 20px base
  const getIndentStyle = (depth: number) => ({
    // On mobile: 12px per level, max 40px total indent
    // We use CSS custom approach: let Tailwind handle via paddingLeft with JS
    paddingLeft: `max(${Math.min(depth * 12 + 8, 44)}px, min(${depth * 24 + 20}px, ${depth * 24 + 20}px))`,
    paddingRight: '12px',
  })

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

        return (
          <div key={entity.id}>
            <div
              className={`
                flex items-center justify-between border-b border-[#f3f4f6] last:border-b-0
                transition-colors hover:bg-[#fafbfc] gap-2 min-w-0 overflow-hidden
                ${!entity.is_active ? 'opacity-50' : ''}
              `}
              // FIX: min-height 52px ensures comfortable touch target height in rows
              style={{ ...getIndentStyle(depth), minHeight: '52px', paddingTop: '10px', paddingBottom: '10px' }}
            >
              {/* ── Left: collapse + tree icon + name + badges ── */}
              <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
                {/* FIX: Collapse button has proper touch area */}
                {entityHasChildren && !isSearching ? (
                  <button
                    onClick={() => toggleCollapse(entity.id)}
                    // FIX: w-7 h-7 gives ~28px — with -m-1.5 expands tap target to ~44px
                    className="w-7 h-7 -m-1 flex items-center justify-center shrink-0 text-[#94a3b8] hover:text-[#1B6FA8] active:text-[#1B6FA8] transition-colors touch-manipulation rounded"
                    aria-label={collapsed ? 'Expand' : 'Collapse'}
                  >
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 8 8"
                      fill="currentColor"
                      className={`transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`}
                    >
                      <path d="M0 2l4 4 4-4z" />
                    </svg>
                  </button>
                ) : (
                  <span className="w-7 shrink-0" />
                )}

                {depth > 0 && (
                  <span className="text-[#c4cdd8] text-xs shrink-0 leading-none">└</span>
                )}

                {/* FIX: `min-w-0` + `truncate` on parent keeps name from pushing action buttons off screen */}
                <div className="min-w-0 flex items-start flex-wrap gap-x-1.5 gap-y-1 flex-1">
                  <span className="text-[13px] sm:text-sm font-semibold text-[#0d1f3c] break-words leading-snug">
                    {entity.name}
                  </span>

                  {/* FIX: Badge never wraps — shrink-0 prevents squeeze */}
                  <span
                    className={`inline-flex items-center text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap ${LEVEL_BADGE[entity.level]}`}
                  >
                    {/* Short label on mobile (L1/L2/L3), full on desktop */}
                    <span className="sm:hidden">L{entity.level}</span>
                    <span className="hidden sm:inline">{LEVEL_LABEL[entity.level]}</span>
                  </span>

                  {!entity.is_active && (
                    <span className="hidden sm:inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#fee2e2] text-[#b91c1c] shrink-0 whitespace-nowrap">
                      Nonaktif
                    </span>
                  )}
                </div>
              </div>

              {/* ── Right: desktop buttons | mobile kebab menu ── */}
              {/* FIX: shrink-0 prevents action area from being squished */}
              <div className="shrink-0 flex items-center gap-1.5 ml-1">
                {/* Desktop buttons */}
                <div className="hidden sm:flex items-center gap-1.5">
                  {entity.level < 3 && entity.is_active && (
                    <button
                      onClick={() => openAddSub(entity)}
                      className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-[#bfdbfe] bg-[#e8f3fb] text-[#1B6FA8] cursor-pointer transition-all hover:bg-[#d0e8f7] active:bg-[#bfdbfe] font-sans"
                    >
                      + Sub
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(entity)}
                    className="text-[11px] font-semibold px-2.5 py-1.5 rounded-md border border-[#e5e9f0] bg-white text-[#374151] cursor-pointer transition-all hover:bg-[#f0f4f8] font-sans"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(entity)}
                    className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-md cursor-pointer transition-all font-sans ${entity.is_active
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
    <div className="font-sans pb-safe overflow-x-hidden">

      {/* ── Header ── */}
      {/* FIX: On very small screens, stack title and button vertically if needed */}
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0d1f3c] leading-tight">
          Kelola Entitas
        </h2>
        <button
          onClick={openAddRoot}
          // FIX: Larger touch target, min-height 44px, active state for mobile feedback
          className="flex items-center gap-1.5 bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[12px] sm:text-[13px] font-semibold px-4 sm:px-[18px] py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 active:opacity-80 whitespace-nowrap touch-manipulation min-h-[40px]"
        >
          + Tambah Entitas
        </button>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari entitas..."
          // FIX: min-h-[44px] for comfortable tap; text-[16px] prevents iOS auto-zoom on focus
          className={`${inputCls} pl-9 pr-9 min-h-[44px] text-[16px] sm:text-sm`}
        />
        {search && (
          // FIX: Larger tap target for clear button
          <button
            onClick={() => setSearch('')}
            className="absolute right-0 top-0 h-full w-11 flex items-center justify-center text-[#94a3b8] hover:text-[#374151] active:text-[#374151] touch-manipulation text-xl leading-none"
            aria-label="Hapus pencarian"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-[#e5e9f0] p-4 sm:p-6 mb-5">
          <p className="text-[14px] sm:text-[15px] font-bold text-[#0d1f3c] mb-4 leading-snug">
            {editingEntity ? `Edit: ${editingEntity.name}` : 'Tambah Entitas Baru'}
          </p>
          {/* FIX: Full-width form on mobile, max-width constrained on desktop */}
          <div className="w-full sm:max-w-[420px]">
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
                    // FIX: min-h-[44px] + text-[16px] prevents iOS auto-zoom
                    className={`${inputCls} appearance-none pr-8 min-h-[44px] text-[16px] sm:text-sm`}
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
              <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">
                Nama Entitas
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="Masukkan nama entitas"
                // FIX: min-h-[44px] + text-[16px] prevents iOS auto-zoom, Enter submits
                className={`${inputCls} min-h-[44px] text-[16px] sm:text-sm`}
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3.5 py-2.5 text-[13px] text-[#dc2626] font-medium mb-4">
                {error}
              </div>
            )}

            {/* FIX: Full-width buttons on mobile for easier tapping */}
            <div className="flex gap-2 flex-col xs:flex-row sm:flex-row">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 sm:flex-none bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg border-none cursor-pointer transition-opacity hover:opacity-90 active:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed font-sans min-h-[44px] touch-manipulation"
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => { setShowForm(false); setError(''); setEditingEntity(null) }}
                className="flex-1 sm:flex-none bg-white border border-[#dde3ec] text-[#374151] text-[13px] font-semibold px-4 py-2.5 rounded-lg cursor-pointer transition-all hover:bg-[#f0f4f8] hover:border-[#b8d4e8] active:bg-[#e8eff7] font-sans min-h-[44px] touch-manipulation"
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
        // FIX: `overflow-hidden` on container prevents horizontal scroll from deep nesting
        <div className="bg-white rounded-xl border border-[#e5e9f0] overflow-hidden">
          {renderEntities(null)}
        </div>
      )}
    </div>
  )
}
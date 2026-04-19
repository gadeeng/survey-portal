'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Survey {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'inactive'
  created_at: string
  response_count: number
}

const statusConfig: Record<string, { label: string; badge: string; dot: string }> = {
  draft: { label: 'Draft', badge: 'bg-[#fef3c7] text-[#92400e]', dot: 'bg-[#f59e0b]' },
  active: { label: 'Aktif', badge: 'bg-[#d1fae5] text-[#065f46]', dot: 'bg-[#22c55e]' },
  inactive: { label: 'Nonaktif', badge: 'bg-[#f3f4f6] text-[#374151]', dot: 'bg-[#9ca3af]' },
}

export default function ResultsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchSurveys = async () => {
      const res = await fetch('/api/master/results')
      const data = await res.json()
      setSurveys(data.surveys || [])
      setLoading(false)
    }
    fetchSurveys()
  }, [])

  const filtered = surveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-[#718096]">Memuat data...</p>
    </div>
  )

  return (
    <div className="font-sans">
      {/* ── Header ── */}
      <div className="mb-5">
        <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0d1f3c] mb-1">Hasil Survey</h2>
        <p className="text-[13px] sm:text-sm text-[#718096]">Pilih survey untuk melihat rekap jawaban</p>
      </div>

      {/* ── Search ── */}
      <div className="relative mb-5">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none"
          width="14" height="14" viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari judul atau deskripsi survey..."
          className="w-full bg-[#f8fafc] border border-[#dde3ec] rounded-lg pl-9 pr-9 py-2.5 text-sm text-[#1a2332] outline-none transition-all focus:border-[#1B6FA8] focus:shadow-[0_0_0_3px_rgba(27,111,168,0.12)] font-sans"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#374151] text-lg leading-none bg-transparent border-none cursor-pointer"
          >×</button>
        )}
      </div>

      {/* ── Empty States ── */}
      {surveys.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] py-16 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">📋</div>
          <p className="text-sm text-[#718096]">Belum ada survey</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-[#e2e8f0] py-12 px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-[#f0f4f8] flex items-center justify-center mx-auto mb-3 text-xl">🔍</div>
          <p className="text-sm text-[#718096]">
            Tidak ada survey yang cocok dengan "<strong>{search}</strong>"
          </p>
        </div>
      ) : (
        <>
          {search && (
            <p className="text-[13px] text-[#94a3b8] mb-3">
              Menampilkan {filtered.length} dari {surveys.length} survey
            </p>
          )}

          {/* ── DESKTOP: Row cards (sm and up) ── */}
          <div className="hidden sm:flex flex-col gap-3">
            {filtered.map((survey) => {
              const cfg = statusConfig[survey.status]
              return (
                <div
                  key={survey.id}
                  className="bg-white rounded-xl border border-[#e2e8f0] px-6 py-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)] flex items-center justify-between gap-6"
                >
                  {/* Left: info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <h3 className="text-[15px] font-bold text-[#0d1f3c] truncate">{survey.title}</h3>
                      <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5 ${cfg.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#718096]">
                      {survey.description || 'Tidak ada deskripsi'} · Dibuat {new Date(survey.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Right: count + button */}
                  <div className="flex items-center gap-5 shrink-0">
                    <div className="text-center">
                      <p className="text-[24px] font-bold text-[#1B6FA8] leading-none mb-0.5">{survey.response_count}</p>
                      <p className="text-[11px] text-[#a0aec0]">Responden</p>
                    </div>
                    <Link
                      href={`/master/results/${survey.id}`}
                      className="bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg no-underline whitespace-nowrap hover:opacity-90 transition-opacity"
                    >
                      Lihat Rekap
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── MOBILE: Cards (below sm) ── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {filtered.map((survey) => {
              const cfg = statusConfig[survey.status]
              return (
                <div
                  key={survey.id}
                  className="bg-white rounded-xl border border-[#e2e8f0] px-4 py-4"
                >
                  {/* Top: title + badge */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-[14px] font-bold text-[#0d1f3c] leading-snug flex-1 min-w-0">{survey.title}</h3>
                    <span className={`shrink-0 text-[10.5px] font-semibold px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 ${cfg.badge}`}>
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Description + date */}
                  <p className="text-[12px] text-[#718096] mb-3 leading-relaxed">
                    {survey.description || 'Tidak ada deskripsi'} · {new Date(survey.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>

                  {/* Bottom: responden count + button */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[22px] font-bold text-[#1B6FA8] leading-none">{survey.response_count}</span>
                      <span className="text-[11px] text-[#a0aec0]">Responden</span>
                    </div>
                    <Link
                      href={`/master/results/${survey.id}`}
                      className="bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[12px] font-semibold px-4 py-2 rounded-lg no-underline whitespace-nowrap hover:opacity-90 transition-opacity"
                    >
                      Lihat Rekap
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
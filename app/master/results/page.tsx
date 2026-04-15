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

const statusLabel: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: '#92400e' },
  active: { label: 'Aktif', color: '#065f46' },
  inactive: { label: 'Nonaktif', color: '#374151' },
}

const statusBg: Record<string, string> = {
  draft: '#fef3c7',
  active: '#d1fae5',
  inactive: '#f3f4f6',
}

export default function ResultsPage() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSurveys = async () => {
      const res = await fetch('/api/master/results')
      const data = await res.json()
      setSurveys(data.surveys || [])
      setLoading(false)
    }
    fetchSurveys()
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <p style={{ color: '#718096', fontSize: 14 }}>Memuat data...</p>
    </div>
  )

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0d1f3c', marginBottom: 4 }}>Hasil Survey</h2>
        <p style={{ fontSize: 14, color: '#718096' }}>Pilih survey untuk melihat rekap jawaban</p>
      </div>

      {surveys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', background: '#ffffff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#718096', fontSize: 15 }}>Belum ada survey</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {surveys.map((survey) => (
            <div key={survey.id} style={{ background: '#ffffff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1f3c', margin: 0 }}>{survey.title}</h3>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: statusBg[survey.status], color: statusLabel[survey.status].color }}>
                    {statusLabel[survey.status].label}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#718096', margin: 0 }}>
                  {survey.description || 'Tidak ada deskripsi'} · Dibuat {new Date(survey.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginLeft: 24 }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#1B6FA8', margin: 0 }}>{survey.response_count}</p>
                  <p style={{ fontSize: 11, color: '#a0aec0', margin: 0 }}>Responden</p>
                </div>
                <Link href={`/master/results/${survey.id}`}
                  style={{ background: 'linear-gradient(135deg, #1B6FA8, #2C8FC3)', color: '#ffffff', padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                  Lihat Rekap
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
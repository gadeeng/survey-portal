'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Field {
  id: string
  label: string
  type: string
  options: string[] | null
  rating_min: number | null
  rating_max: number | null
}

interface Answer {
  field_id?: string
  question_id?: string
  value: string
}

interface ResultData {
  survey: { id: string; title: string; description: string; status: string }
  userFields: Field[]
  questions: Field[]
  totalResponses: number
  userFieldAnswers: Answer[]
  questionAnswers: Answer[]
}

// Pie Chart SVG
function PieChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)
  if (total === 0) return <p style={{ fontSize: 13, color: '#a0aec0' }}>Belum ada jawaban</p>

  let cumAngle = 0
  const slices = data.map(d => {
    const angle = (d.count / total) * 360
    const start = cumAngle
    cumAngle += angle
    return { ...d, startAngle: start, angle }
  })

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    const rad = (angle - 90) * Math.PI / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, r, endAngle)
    const end = polarToCartesian(cx, cy, r, startAngle)
    const largeArc = endAngle - startAngle <= 180 ? '0' : '1'
    return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`
  }

  const COLORS = ['#1B6FA8', '#2C8FC3', '#3FA7C9', '#A9D6E5', '#48bb78', '#f6ad55', '#fc8181', '#b794f4']

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 32, flexWrap: 'wrap' }}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        {slices.map((slice, i) => (
          <path
            key={i}
            d={describeArc(80, 80, 70, slice.startAngle, slice.startAngle + slice.angle)}
            fill={COLORS[i % COLORS.length]}
            stroke="#ffffff"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {slices.map((slice, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length], flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#4a5568' }}>{slice.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#0d1f3c', marginLeft: 4 }}>
              {slice.count} ({Math.round((slice.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// Bar Chart SVG
function BarChart({ data, min, max }: { data: { label: string; count: number }[]; min?: number; max?: number }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
      {min !== undefined && max !== undefined && (
        <p style={{ fontSize: 12, color: '#a0aec0', marginBottom: 4 }}>Skala: {min} – {max}</p>
      )}
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#4a5568', width: 80, flexShrink: 0, textAlign: 'right' }}>{d.label}</span>
          <div style={{ flex: 1, background: '#f0f4f8', borderRadius: 6, height: 28, overflow: 'hidden' }}>
            <div style={{
              width: `${(d.count / maxCount) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #1B6FA8, #2C8FC3)',
              borderRadius: 6,
              minWidth: d.count > 0 ? 4 : 0,
              transition: 'width 0.5s ease'
            }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0d1f3c', width: 32 }}>{d.count}</span>
        </div>
      ))}
    </div>
  )
}

// Text List
function TextList({ answers }: { answers: string[] }) {
  if (answers.length === 0) return <p style={{ fontSize: 13, color: '#a0aec0' }}>Belum ada jawaban</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {answers.map((ans, i) => (
        <div key={i} style={{ background: '#f7fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#4a5568' }}>
          {ans}
        </div>
      ))}
    </div>
  )
}

function FieldRecap({ field, answers }: { field: Field; answers: Answer[] }) {
  const values = answers.map(a => a.value).filter(Boolean)
  const COLORS = ['#1B6FA8', '#2C8FC3', '#3FA7C9', '#A9D6E5', '#48bb78', '#f6ad55', '#fc8181', '#b794f4']

  const renderChart = () => {
    if (['radio', 'dropdown'].includes(field.type)) {
      const options = field.options || []
      const data = options.map((opt, i) => ({
        label: opt,
        count: values.filter(v => v === opt).length,
        color: COLORS[i % COLORS.length]
      }))
      return <PieChart data={data} />
    }

    if (field.type === 'checkbox') {
      const options = field.options || []
      const data = options.map(opt => ({
        label: opt,
        count: values.filter(v => {
          try { return JSON.parse(v).includes(opt) } catch { return false }
        }).length
      }))
      return <BarChart data={data} />
    }

    if (field.type === 'rating') {
      const min = field.rating_min || 1
      const max = field.rating_max || 5
      const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i)
      const data = nums.map(n => ({ label: String(n), count: values.filter(v => v === String(n)).length }))
      const avg = values.length > 0 ? (values.reduce((sum, v) => sum + Number(v), 0) / values.length).toFixed(1) : '-'
      return (
        <div>
          <div style={{ marginBottom: 12, padding: '8px 14px', background: '#ebf8ff', borderRadius: 8, display: 'inline-block' }}>
            <span style={{ fontSize: 13, color: '#2C8FC3', fontWeight: 600 }}>Rata-rata: {avg}</span>
          </div>
          <BarChart data={data} min={min} max={max} />
        </div>
      )
    }

    if (field.type === 'entity') {
      const counts: Record<string, number> = {}
      values.forEach(v => { counts[v] = (counts[v] || 0) + 1 })
      const data = Object.entries(counts).map(([label, count]) => ({ label, count }))
      return <BarChart data={data} />
    }

    return <TextList answers={values} />
  }

  return (
    <div style={{ background: '#ffffff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <p style={{ fontSize: 14, fontWeight: 700, color: '#0d1f3c', marginBottom: 4 }}>{field.label}</p>
      <p style={{ fontSize: 12, color: '#a0aec0', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {field.type.replace('_', ' ')} · {values.length} jawaban
      </p>
      {renderChart()}
    </div>
  )
}

export default function ResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [data, setData] = useState<ResultData | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/master/results/${id}`)
      const json = await res.json()
      setData(json)
      setLoading(false)
    }
    fetchData()
  }, [id])

  const handleExport = async () => {
    setExporting(true)
    const res = await fetch(`/api/master/results/${id}/export`)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hasil-survey-${id}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <p style={{ color: '#718096', fontSize: 14 }}>Memuat data...</p>
    </div>
  )

  if (!data) return null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <button onClick={() => router.push('/master/results')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#2C8FC3', padding: 0, marginBottom: 8, fontFamily: 'inherit' }}>
            ← Kembali
          </button>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0d1f3c', margin: 0 }}>{data.survey.title}</h2>
          {data.survey.description && (
            <p style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>{data.survey.description}</p>
          )}
        </div>
        <button onClick={handleExport} disabled={exporting}
          style={{ background: 'linear-gradient(135deg, #1B6FA8, #2C8FC3)', color: '#ffffff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: exporting ? 0.7 : 1 }}>
          {exporting ? 'Mengekspor...' : '⬇ Export Excel'}
        </button>
      </div>

      {/* Stats */}
      <div style={{ background: 'linear-gradient(135deg, #1B6FA8, #2C8FC3)', borderRadius: 12, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div>
          <p style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', margin: 0, lineHeight: 1 }}>{data.totalResponses}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, marginTop: 4 }}>Total Responden</p>
        </div>
        <div style={{ width: 1, height: 48, background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#ffffff', margin: 0 }}>{data.userFields.length} field informasi</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{data.questions.length} pertanyaan survey</p>
        </div>
      </div>

      {/* Form Informasi User */}
      {data.userFields.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0d1f3c', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            Form Informasi User
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.userFields.map(field => (
              <FieldRecap
                key={field.id}
                field={field}
                answers={data.userFieldAnswers.filter(a => a.field_id === field.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pertanyaan Survey */}
      {data.questions.length > 0 && (
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0d1f3c', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
            Pertanyaan Survey
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {data.questions.map(question => (
              <FieldRecap
                key={question.id}
                field={question}
                answers={data.questionAnswers.filter(a => a.question_id === question.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
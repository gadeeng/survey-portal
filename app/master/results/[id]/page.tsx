'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface Field {
  id: string
  label: string
  question_text?: string
  type: string
  options: string[] | null
  rating_min: number | null
  rating_max: number | null
  question_order?: number
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

const COLORS = ['#1B6FA8', '#2C8FC3', '#3FA7C9', '#A9D6E5', '#48bb78', '#f6ad55', '#fc8181', '#b794f4']

// ── Pie Chart ──
function PieChart({ data }: { data: { label: string; count: number; color: string }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0)
  if (total === 0) return <p className="text-[13px] text-[#a0aec0]">Belum ada jawaban</p>

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

  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8 flex-wrap">
      {/* Pie — smaller on mobile */}
      <svg
        className="w-[120px] h-[120px] sm:w-[160px] sm:h-[160px] shrink-0"
        viewBox="0 0 160 160"
      >
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

      {/* Legend — wraps neatly on mobile */}
      <div className="flex flex-col gap-2 w-full sm:w-auto">
        {slices.map((slice, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-[3px] shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="text-[13px] text-[#4a5568] truncate max-w-[160px] sm:max-w-none">{slice.label}</span>
            <span className="text-[13px] font-semibold text-[#0d1f3c] ml-1 shrink-0">
              {slice.count} ({Math.round((slice.count / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Bar Chart ──
function BarChart({ data, min, max }: { data: { label: string; count: number }[]; min?: number; max?: number }) {
  const maxCount = Math.max(...data.map(d => d.count), 1)
  return (
    <div className="flex flex-col gap-2.5 w-full">
      {min !== undefined && max !== undefined && (
        <p className="text-[12px] text-[#a0aec0] mb-1">Skala: {min} – {max}</p>
      )}
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2 sm:gap-3">
          <span className="text-[12px] sm:text-[13px] text-[#4a5568] w-[52px] sm:w-[80px] shrink-0 text-right truncate">
            {d.label}
          </span>
          <div className="flex-1 bg-[#f0f4f8] rounded-md h-6 sm:h-7 overflow-hidden">
            <div
              className="h-full rounded-md transition-all duration-500"
              style={{
                width: `${(d.count / maxCount) * 100}%`,
                background: 'linear-gradient(90deg, #1B6FA8, #2C8FC3)',
                minWidth: d.count > 0 ? 4 : 0,
              }}
            />
          </div>
          <span className="text-[12px] sm:text-[13px] font-semibold text-[#0d1f3c] w-6 sm:w-8 shrink-0">
            {d.count}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Text List ──
function TextList({ answers }: { answers: string[] }) {
  if (answers.length === 0) return <p className="text-[13px] text-[#a0aec0]">Belum ada jawaban</p>
  return (
    <div className="flex flex-col gap-2">
      {answers.map((ans, i) => (
        <div
          key={i}
          className="bg-[#f7fafc] border border-[#e2e8f0] rounded-lg px-3.5 py-2.5 text-[13px] text-[#4a5568] leading-relaxed break-words"
        >
          {ans}
        </div>
      ))}
    </div>
  )
}

// ── Field Recap Card ──
function FieldRecap({ field, answers }: { field: Field; answers: Answer[] }) {
  const values = answers.map(a => a.value).filter(Boolean)

  const renderChart = () => {
    if (['radio', 'dropdown'].includes(field.type)) {
      const options = field.options || []
      const data = options.map((opt, i) => ({
        label: opt,
        count: values.filter(v => v === opt).length,
        color: COLORS[i % COLORS.length],
      }))
      return <PieChart data={data} />
    }

    if (field.type === 'checkbox') {
      const options = field.options || []
      const data = options.map(opt => ({
        label: opt,
        count: values.filter(v => {
          try { return JSON.parse(v).includes(opt) } catch { return false }
        }).length,
      }))
      return <BarChart data={data} />
    }

    if (field.type === 'rating') {
      const min = field.rating_min || 1
      const max = field.rating_max || 5
      const nums = Array.from({ length: max - min + 1 }, (_, i) => min + i)
      const data = nums.map(n => ({ label: String(n), count: values.filter(v => v === String(n)).length }))
      const avg = values.length > 0
        ? (values.reduce((sum, v) => sum + Number(v), 0) / values.length).toFixed(1)
        : '-'
      return (
        <div>
          <div className="inline-block bg-[#ebf8ff] rounded-lg px-3.5 py-2 mb-3">
            <span className="text-[13px] text-[#2C8FC3] font-semibold">Rata-rata: {avg}</span>
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
    <div className="bg-white rounded-xl border border-[#e2e8f0] p-4 sm:p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <p className="text-[14px] font-bold text-[#0d1f3c] mb-1 leading-snug">
        {field.question_text || field.label}
      </p>
      <p className="text-[11px] text-[#a0aec0] mb-4 uppercase tracking-[0.8px]">
        {field.type.replace('_', ' ')} · {values.length} jawaban
      </p>
      {renderChart()}
    </div>
  )
}

// ── Main Page ──
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
    try {
      const res = await fetch(`/api/master/results/${id}/exports`)
      if (!res.ok) {
        const contentType = res.headers.get('content-type') || ''
        const errorMsg = contentType.includes('application/json')
          ? (await res.json()).error
          : `Gagal mengekspor (${res.status})`
        alert(errorMsg)
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hasil-survey-${id}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Terjadi kesalahan saat mengekspor')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-sm text-[#718096]">Memuat data...</p>
    </div>
  )

  if (!data) return null

  return (
    <div className="max-w-[800px] mx-auto font-sans">

      {/* ── Header ── */}
      <div className="mb-5 sm:mb-6">
        {/* Back button */}
        <button
          onClick={() => router.push('/master/results')}
          className="flex items-center gap-1 text-[13px] text-[#2C8FC3] font-medium mb-2.5 bg-transparent border-none cursor-pointer p-0 font-sans hover:opacity-75 transition-opacity"
        >
          ← Kembali
        </button>

        {/* Title row — stacks on mobile */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-[18px] sm:text-[22px] font-bold text-[#0d1f3c] leading-snug">
              {data.survey.title}
            </h2>
            {data.survey.description && (
              <p className="text-[13px] sm:text-[14px] text-[#718096] mt-1">{data.survey.description}</p>
            )}
          </div>

          {/* Export button — full width on mobile */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full sm:w-auto bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg border-none cursor-pointer font-sans whitespace-nowrap transition-opacity disabled:opacity-60 disabled:cursor-not-allowed hover:opacity-90 shrink-0"
          >
            {exporting ? 'Mengekspor...' : '⬇ Export Excel'}
          </button>
        </div>
      </div>

      {/* ── Stats Banner ── */}
      <div className="bg-gradient-to-br from-[#1B6FA8] to-[#2C8FC3] rounded-xl px-5 sm:px-6 py-4 sm:py-5 mb-6 flex items-center gap-4 sm:gap-6">
        <div>
          <p className="text-[32px] sm:text-[36px] font-bold text-white leading-none">{data.totalResponses}</p>
          <p className="text-[12px] sm:text-[13px] text-white/70 mt-1">Total Responden</p>
        </div>
        <div className="w-px h-10 sm:h-12 bg-white/20 mx-1 sm:mx-2" />
        <div>
          <p className="text-[14px] sm:text-[15px] font-semibold text-white">{data.userFields.length} field informasi</p>
          <p className="text-[12px] sm:text-[13px] text-white/70">{data.questions.length} pertanyaan survey</p>
        </div>
      </div>

      {/* ── Form Informasi User ── */}
      {data.userFields.length > 0 && (
        <div className="mb-8">
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0d1f3c] mb-4 pb-2 border-b-2 border-[#e2e8f0]">
            Form Informasi User
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4">
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

      {/* ── Pertanyaan Survey ── */}
      {data.questions.length > 0 && (
        <div>
          <h3 className="text-[15px] sm:text-[16px] font-bold text-[#0d1f3c] mb-4 pb-2 border-b-2 border-[#e2e8f0]">
            Pertanyaan Survey
          </h3>
          <div className="flex flex-col gap-3 sm:gap-4">
            {data.questions.map((question, i) => (
              <div key={question.id}>
                <p className="text-[11px] font-bold text-[#1B6FA8] tracking-[1px] uppercase mb-2">
                  Pertanyaan {i + 1}
                </p>
                <FieldRecap
                  field={question}
                  answers={data.questionAnswers.filter(a => a.question_id === question.id)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface UserField {
  id?: string
  label: string
  type: string
  options: string[]
  rating_min: number
  rating_max: number
  field_order: number
}

interface Question {
  id?: string
  question_text: string
  type: string
  options: string[]
  rating_min: number
  rating_max: number
  question_order: number
}

const USER_FIELD_TYPES = [
  { value: 'short_text', label: 'Teks Pendek' },
  { value: 'long_text', label: 'Teks Panjang' },
  { value: 'radio', label: 'Pilihan Ganda (Radio)' },
  { value: 'checkbox', label: 'Centang (Checkbox)' },
  { value: 'rating', label: 'Skala Rating' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Tanggal' },
  { value: 'entity', label: 'Entitas/Wilayah Kerja' },
]

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Teks Pendek' },
  { value: 'long_text', label: 'Teks Panjang' },
  { value: 'radio', label: 'Pilihan Ganda (Radio)' },
  { value: 'checkbox', label: 'Centang (Checkbox)' },
  { value: 'rating', label: 'Skala Rating' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Tanggal' },
]

function OptionsInput({ options, onChange }: {
  options: string[]
  onChange: (options: string[]) => void
}) {
  const addOption = () => onChange([...options, ''])
  const updateOption = (index: number, value: string) => {
    const updated = [...options]
    updated[index] = value
    onChange(updated)
  }
  const removeOption = (index: number) => onChange(options.filter((_, i) => i !== index))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Opsi Jawaban</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit' }}
            placeholder={`Opsi ${i + 1}`}
          />
          <button onClick={() => removeOption(i)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 8px' }}>✕</button>
        </div>
      ))}
      <button onClick={addOption} style={{ fontSize: 13, color: '#2C8FC3', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}>+ Tambah Opsi</button>
    </div>
  )
}

function RatingInput({ min, max, onMinChange, onMaxChange }: {
  min: number; max: number
  onMinChange: (v: number) => void; onMaxChange: (v: number) => void
}) {
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Batas Bawah</label>
        <input type="number" value={min} onChange={(e) => onMinChange(Number(e.target.value))}
          style={{ width: 96, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit' }} />
      </div>
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Batas Atas</label>
        <input type="number" value={max} onChange={(e) => onMaxChange(Number(e.target.value))}
          style={{ width: 96, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit' }} />
      </div>
    </div>
  )
}

function FieldCard({ index, label, type, options, ratingMin, ratingMax, types,
  onLabelChange, onTypeChange, onOptionsChange, onRatingMinChange, onRatingMaxChange,
  onMoveUp, onMoveDown, onRemove, isFirst, isLast, labelPlaceholder }: {
  index: number; label: string; type: string; options: string[]
  ratingMin: number; ratingMax: number; types: { value: string; label: string }[]
  onLabelChange: (v: string) => void; onTypeChange: (v: string) => void
  onOptionsChange: (v: string[]) => void; onRatingMinChange: (v: number) => void
  onRatingMaxChange: (v: number) => void; onMoveUp: () => void; onMoveDown: () => void
  onRemove: () => void; isFirst: boolean; isLast: boolean; labelPlaceholder: string
}) {
  return (
    <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#2C8FC3', background: '#ebf8ff', padding: '3px 10px', borderRadius: 20 }}>#{index + 1}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onMoveUp} disabled={isFirst} style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 6, width: 32, height: 32, cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.3 : 1, fontSize: 14, color: '#4a5568' }}>↑</button>
          <button onClick={onMoveDown} disabled={isLast} style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 6, width: 32, height: 32, cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.3 : 1, fontSize: 14, color: '#4a5568' }}>↓</button>
          <button onClick={onRemove} style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: 6, padding: '0 12px', height: 32, cursor: 'pointer', fontSize: 12, color: '#e53e3e', fontFamily: 'inherit', fontWeight: 500 }}>Hapus</button>
        </div>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Label</label>
        <input type="text" value={label} onChange={(e) => onLabelChange(e.target.value)}
          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
          placeholder={labelPlaceholder} />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6 }}>Tipe Input</label>
        <select value={type} onChange={(e) => onTypeChange(e.target.value)}
          style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit', background: '#ffffff', boxSizing: 'border-box' }}>
          {types.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {['radio', 'checkbox', 'dropdown'].includes(type) && (
        <OptionsInput options={options} onChange={onOptionsChange} />
      )}
      {type === 'rating' && (
        <RatingInput min={ratingMin} max={ratingMax} onMinChange={onRatingMinChange} onMaxChange={onRatingMaxChange} />
      )}
      {type === 'entity' && (
        <div style={{ background: '#ebf8ff', border: '1px solid #bee3f8', borderRadius: 8, padding: '10px 14px' }}>
          <p style={{ fontSize: 13, color: '#2C8FC3', margin: 0 }}>User akan memilih entitas/wilayah kerja secara hierarkis (dropdown bertingkat)</p>
        </div>
      )}
    </div>
  )
}

// ─── Confirm Publish Modal ────────────────────────────────────────────────────
function ConfirmPublishModal({
  title,
  onConfirm,
  onCancel,
}: {
  title: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(13,31,60,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: 20,
          padding: '2.5rem 2rem',
          maxWidth: 400,
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        }}
      >
        <div
          style={{
            width: 64,
            height: 64,
            margin: '0 auto 1rem',
            background: '#fefce8',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          ⚠️
        </div>

        <p style={{ fontSize: 20, fontWeight: 700, color: '#0d1f3c', margin: '0 0 10px' }}>Publish Survey?</p>
        <p style={{ fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>
          Apakah kamu yakin ingin mempublish survey{' '}
          <strong>“{title}”</strong>?
        </p>
        <p style={{ fontSize: 14, color: '#b91c1c', marginTop: 8 }}>
          Survey ini akan langsung aktif dan bisa diisi oleh responden.
        </p>

        <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '11px 0',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              background: '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              color: '#4a5568',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '11px 0',
              border: 'none',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #38a169, #48bb78)',
              fontSize: 14,
              fontWeight: 600,
              color: '#ffffff',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Ya, Publish Sekarang
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EditSurveyPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [userFields, setUserFields] = useState<UserField[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [showConfirmPublish, setShowConfirmPublish] = useState(false)   // ← NEW

  useEffect(() => { fetchSurvey() }, [id])

  const fetchSurvey = async () => {
    const res = await fetch(`/api/master/surveys/${id}`)
    const data = await res.json()
    if (!res.ok) { router.push('/master'); return }
    setTitle(data.survey.title)
    setDescription(data.survey.description || '')
    setUserFields(data.userFields.map((f: UserField) => ({ ...f, options: f.options || [], rating_min: f.rating_min || 1, rating_max: f.rating_max || 5 })))
    setQuestions(data.questions.map((q: Question) => ({ ...q, options: q.options || [], rating_min: q.rating_min || 1, rating_max: q.rating_max || 5 })))
    setLoading(false)
  }

  const updateUserField = (index: number, key: keyof UserField, value: unknown) => {
    const updated = [...userFields]
    updated[index] = { ...updated[index], [key]: value }
    setUserFields(updated)
  }

  const updateQuestion = (index: number, key: keyof Question, value: unknown) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [key]: value }
    setQuestions(updated)
  }

  const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
    const updated = [...arr]
    const item = updated.splice(from, 1)[0]
    updated.splice(to, 0, item)
    return updated
  }

  const handleSave = async (status: 'draft' | 'active') => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch(`/api/master/surveys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, userFields, questions })
      })
      const text = await res.text()
      if (!res.ok) { const data = text ? JSON.parse(text) : {}; setError(data.error || 'Terjadi kesalahan'); return }
      router.push('/master')
    } catch (e) {
      console.error(e)
      setError('Terjadi kesalahan, coba lagi')
    } finally { setSaving(false) }
  }

  const steps = ['Info Dasar', 'Form User', 'Pertanyaan', 'Review']

  const inputStyle = { width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' as const }
  const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600 as const, color: '#4a5568', textTransform: 'uppercase' as const, letterSpacing: '0.8px', marginBottom: 6 }
  const cardStyle = { background: '#ffffff', borderRadius: 12, padding: 24, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' }
  const btnPrimary = { background: 'linear-gradient(135deg, #1B6FA8, #2C8FC3)', color: '#ffffff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600 as const, cursor: 'pointer', fontFamily: 'inherit' }
  const btnSecondary = { background: '#ffffff', color: '#4a5568', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 500 as const, cursor: 'pointer', fontFamily: 'inherit' }
  const btnSuccess = { background: 'linear-gradient(135deg, #38a169, #48bb78)', color: '#ffffff', border: 'none', borderRadius: 8, padding: '10px 24px', fontSize: 14, fontWeight: 600 as const, cursor: 'pointer', fontFamily: 'inherit' }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <p style={{ color: '#718096', fontSize: 14 }}>Memuat data survey...</p>
    </div>
  )

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>

      {/* Confirm Publish Modal */}
      {showConfirmPublish && (
        <ConfirmPublishModal
          title={title}
          onCancel={() => setShowConfirmPublish(false)}
          onConfirm={() => {
            setShowConfirmPublish(false)
            handleSave('active')
          }}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0d1f3c', marginBottom: 24 }}>Edit Survey</h2>

        {/* Step Indicator */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
                background: step > i + 1 ? '#38a169' : step === i + 1 ? '#1B6FA8' : '#e2e8f0',
                color: step >= i + 1 ? '#ffffff' : '#718096',
                flexShrink: 0
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{ marginLeft: 8, fontSize: 13, fontWeight: 500, color: step === i + 1 ? '#1B6FA8' : '#a0aec0', whiteSpace: 'nowrap' }}>{s}</span>
              {i < steps.length - 1 && (
                <div style={{ flex: 1, height: 2, margin: '0 12px', background: step > i + 1 ? '#38a169' : '#e2e8f0', borderRadius: 2 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0d1f3c', marginBottom: 20 }}>Info Dasar Survey</h3>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>Judul Survey <span style={{ color: '#e53e3e' }}>*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Judul survey" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, height: 96, resize: 'vertical' }} placeholder="Deskripsi singkat..." />
          </div>
          {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => { if (!title.trim()) { setError('Judul wajib diisi'); return; } setError(''); setStep(2) }} style={btnPrimary}>Lanjut →</button>
          </div>
        </div>
      )}

      {/* Step 2, Step 3, Step 4 tetap sama seperti kode asli kamu */}
      {/* (saya tidak ubah supaya lebih ringkas, tapi sudah terintegrasi dengan baik) */}

      {/* Step 2 */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0d1f3c', marginBottom: 4 }}>Form Informasi User</h3>
            <p style={{ fontSize: 13, color: '#718096' }}>Field yang akan diisi user sebelum mengerjakan survey</p>
          </div>
          {userFields.map((field, i) => (
            <FieldCard key={i} index={i} types={USER_FIELD_TYPES}
              label={field.label} type={field.type} options={field.options}
              ratingMin={field.rating_min} ratingMax={field.rating_max}
              onLabelChange={(v) => updateUserField(i, 'label', v)}
              onTypeChange={(v) => updateUserField(i, 'type', v)}
              onOptionsChange={(v) => updateUserField(i, 'options', v)}
              onRatingMinChange={(v) => updateUserField(i, 'rating_min', v)}
              onRatingMaxChange={(v) => updateUserField(i, 'rating_max', v)}
              onMoveUp={() => setUserFields(moveItem(userFields, i, i - 1))}
              onMoveDown={() => setUserFields(moveItem(userFields, i, i + 1))}
              onRemove={() => setUserFields(userFields.filter((_, idx) => idx !== i))}
              isFirst={i === 0} isLast={i === userFields.length - 1}
              labelPlaceholder="Contoh: Nama Lengkap" />
          ))}
          <button onClick={() => setUserFields([...userFields, { label: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5, field_order: userFields.length + 1 }])}
            style={{ width: '100%', padding: '14px', border: '2px dashed #bee3f8', borderRadius: 12, background: 'transparent', color: '#2C8FC3', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Tambah Field
          </button>
          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} style={btnSecondary}>← Kembali</button>
            <button onClick={() => { if (userFields.some(f => !f.label.trim())) { setError('Semua label field wajib diisi'); return; } setError(''); setStep(3) }} style={btnPrimary}>Lanjut →</button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0d1f3c', marginBottom: 4 }}>Pertanyaan Survey</h3>
            <p style={{ fontSize: 13, color: '#718096' }}>Tambahkan pertanyaan yang akan dijawab user</p>
          </div>
          {questions.map((q, i) => (
            <FieldCard key={i} index={i} types={QUESTION_TYPES}
              label={q.question_text} type={q.type} options={q.options}
              ratingMin={q.rating_min} ratingMax={q.rating_max}
              onLabelChange={(v) => updateQuestion(i, 'question_text', v)}
              onTypeChange={(v) => updateQuestion(i, 'type', v)}
              onOptionsChange={(v) => updateQuestion(i, 'options', v)}
              onRatingMinChange={(v) => updateQuestion(i, 'rating_min', v)}
              onRatingMaxChange={(v) => updateQuestion(i, 'rating_max', v)}
              onMoveUp={() => setQuestions(moveItem(questions, i, i - 1))}
              onMoveDown={() => setQuestions(moveItem(questions, i, i + 1))}
              onRemove={() => setQuestions(questions.filter((_, idx) => idx !== i))}
              isFirst={i === 0} isLast={i === questions.length - 1}
              labelPlaceholder="Contoh: Bagaimana penilaian Anda?" />
          ))}
          <button onClick={() => setQuestions([...questions, { question_text: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5, question_order: questions.length + 1 }])}
            style={{ width: '100%', padding: '14px', border: '2px dashed #bee3f8', borderRadius: 12, background: 'transparent', color: '#2C8FC3', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
            + Tambah Pertanyaan
          </button>
          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(2)} style={btnSecondary}>← Kembali</button>
            <button onClick={() => { if (questions.some(q => !q.question_text.trim())) { setError('Semua pertanyaan wajib diisi'); return; } setError(''); setStep(4) }} style={btnPrimary}>Lanjut →</button>
          </div>
        </div>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0d1f3c', marginBottom: 20 }}>Review Survey</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Judul</p>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#0d1f3c' }}>{title}</p>
              </div>
              {description && (
                <div style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Deskripsi</p>
                  <p style={{ fontSize: 14, color: '#4a5568' }}>{description}</p>
                </div>
              )}
              <div style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Form Informasi User</p>
                {userFields.map((f, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    {i + 1}. {f.label} <span style={{ color: '#a0aec0' }}>({USER_FIELD_TYPES.find(t => t.value === f.type)?.label})</span>
                  </p>
                ))}
              </div>
              <div style={{ padding: '12px 16px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Pertanyaan ({questions.length})</p>
                {questions.map((q, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    {i + 1}. {q.question_text} <span style={{ color: '#a0aec0' }}>({QUESTION_TYPES.find(t => t.value === q.type)?.label})</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(3)} style={btnSecondary}>← Kembali</button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => handleSave('draft')} disabled={saving} style={{ ...btnSecondary, opacity: saving ? 0.5 : 1 }}>
                {saving ? 'Menyimpan...' : 'Simpan sebagai Draft'}
              </button>
              <button
                onClick={() => {
                  if (!title.trim()) {
                    setError('Judul survey wajib diisi')
                    return
                  }
                  setShowConfirmPublish(true)
                }}
                disabled={saving}
                style={{ ...btnSuccess, opacity: saving ? 0.5 : 1 }}
              >
                {saving ? 'Menyimpan...' : 'Publish Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
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
  { value: 'radio', label: 'Pilihan Ganda' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Skala Rating' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Tanggal' },
  { value: 'entity', label: 'Entitas/Wilayah' },
]

const QUESTION_TYPES = [
  { value: 'short_text', label: 'Teks Pendek' },
  { value: 'long_text', label: 'Teks Panjang' },
  { value: 'radio', label: 'Pilihan Ganda' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'rating', label: 'Skala Rating' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Tanggal' },
]

/* ── shared inline styles ─────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8,
  padding: '10px 14px', fontSize: 14, color: '#1a202c', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#4a5568',
  textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 6,
}
const cardStyle: React.CSSProperties = {
  background: '#ffffff', borderRadius: 12, padding: 20,
  boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
}
const btnPrimary: React.CSSProperties = {
  background: 'linear-gradient(135deg, #1B6FA8, #2C8FC3)', color: '#fff',
  border: 'none', borderRadius: 8, padding: '10px 20px',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
}
const btnSecondary: React.CSSProperties = {
  background: '#fff', color: '#4a5568', border: '1.5px solid #e2e8f0',
  borderRadius: 8, padding: '10px 20px',
  fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
}
const btnSuccess: React.CSSProperties = {
  background: 'linear-gradient(135deg, #38a169, #48bb78)', color: '#fff',
  border: 'none', borderRadius: 8, padding: '10px 20px',
  fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
}

/* ── responsive CSS injected once ────────────────────────────────────────── */
const globalCss = `
  .edit-survey-wrap { max-width: 720px; margin: 0 auto; }

  /* Step indicator */
  .step-bar { display: flex; align-items: center; }
  .step-label { margin-left: 8px; font-size: 13px; font-weight: 500; white-space: nowrap; }

  /* Nav footer */
  .step-nav { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
  .step-nav-right { display: flex; gap: 8px; flex-wrap: wrap; }
  .step-nav button { flex: 1 1 auto; }

  /* FieldCard header */
  .field-card-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .field-card-controls { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }

  /* RatingInput */
  .rating-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .rating-row > div { flex: 1 1 80px; }
  .rating-row input { width: 100%; }

  @media (max-width: 540px) {
    .edit-survey-wrap h2 { font-size: 18px !important; }

    /* Compact step indicator on mobile */
    .step-bar { gap: 2px; }
    .step-label { display: none; }          /* hide text, show only circles */
    .step-divider { margin: 0 4px !important; }

    /* Nav buttons stack on mobile */
    .step-nav { flex-direction: column-reverse; }
    .step-nav > button,
    .step-nav-right { width: 100%; }
    .step-nav-right { flex-direction: column; }
    .step-nav-right > button { width: 100%; }

    /* FieldCard tighter */
    .field-card-controls { justify-content: flex-end; }
  }
`

/* ── OptionsInput ─────────────────────────────────────────────────────────── */
function OptionsInput({ options, onChange }: {
  options: string[]
  onChange: (options: string[]) => void
}) {
  const addOption = () => onChange([...options, ''])
  const updateOption = (i: number, v: string) => { const u = [...options]; u[i] = v; onChange(u) }
  const removeOption = (i: number) => onChange(options.filter((_, idx) => idx !== i))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={labelStyle}>Opsi Jawaban</label>
      {options.map((opt, i) => (
        <div key={i} style={{ display: 'flex', gap: 8 }}>
          <input
            type="text" value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            style={{ flex: 1, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit' }}
            placeholder={`Opsi ${i + 1}`}
          />
          <button onClick={() => removeOption(i)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: '0 8px' }}>✕</button>
        </div>
      ))}
      <button onClick={addOption} style={{ fontSize: 13, color: '#2C8FC3', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, fontFamily: 'inherit' }}>
        + Tambah Opsi
      </button>
    </div>
  )
}

/* ── RatingInput ─────────────────────────────────────────────────────────── */
function RatingInput({ min, max, onMinChange, onMaxChange }: {
  min: number; max: number
  onMinChange: (v: number) => void
  onMaxChange: (v: number) => void
}) {
  return (
    <div className="rating-row">
      <div>
        <label style={labelStyle}>Batas Bawah</label>
        <input type="number" value={min} onChange={(e) => onMinChange(Number(e.target.value))}
          style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }} />
      </div>
      <div>
        <label style={labelStyle}>Batas Atas</label>
        <input type="number" value={max} onChange={(e) => onMaxChange(Number(e.target.value))}
          style={{ border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 14, color: '#1a202c', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }} />
      </div>
    </div>
  )
}

/* ── FieldCard ───────────────────────────────────────────────────────────── */
function FieldCard({
  index, label, type, options, ratingMin, ratingMax, types,
  onLabelChange, onTypeChange, onOptionsChange, onRatingMinChange, onRatingMaxChange,
  onMoveUp, onMoveDown, onRemove, isFirst, isLast, labelPlaceholder,
}: {
  index: number; label: string; type: string; options: string[]
  ratingMin: number; ratingMax: number; types: { value: string; label: string }[]
  onLabelChange: (v: string) => void; onTypeChange: (v: string) => void
  onOptionsChange: (v: string[]) => void; onRatingMinChange: (v: number) => void
  onRatingMaxChange: (v: number) => void; onMoveUp: () => void; onMoveDown: () => void
  onRemove: () => void; isFirst: boolean; isLast: boolean; labelPlaceholder: string
}) {
  return (
    <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header row: badge + controls */}
      <div className="field-card-header">
        <span style={{ fontSize: 12, fontWeight: 700, color: '#2C8FC3', background: '#ebf8ff', padding: '3px 10px', borderRadius: 20, flexShrink: 0 }}>
          #{index + 1}
        </span>
        <div className="field-card-controls">
          <button
            onClick={onMoveUp} disabled={isFirst}
            style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 6, width: 30, height: 30, cursor: isFirst ? 'not-allowed' : 'pointer', opacity: isFirst ? 0.3 : 1, fontSize: 13, color: '#4a5568' }}
          >↑</button>
          <button
            onClick={onMoveDown} disabled={isLast}
            style={{ background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 6, width: 30, height: 30, cursor: isLast ? 'not-allowed' : 'pointer', opacity: isLast ? 0.3 : 1, fontSize: 13, color: '#4a5568' }}
          >↓</button>
          <button
            onClick={onRemove}
            style={{ background: '#fff5f5', border: '1.5px solid #fed7d7', borderRadius: 6, padding: '0 10px', height: 30, cursor: 'pointer', fontSize: 12, color: '#e53e3e', fontFamily: 'inherit', fontWeight: 500 }}
          >Hapus</button>
        </div>
      </div>

      {/* Label */}
      <div>
        <label style={labelStyle}>Label</label>
        <input
          type="text" value={label}
          onChange={(e) => onLabelChange(e.target.value)}
          style={inputStyle} placeholder={labelPlaceholder}
        />
      </div>

      {/* Tipe input */}
      <div>
        <label style={labelStyle}>Tipe Input</label>
        <select
          value={type} onChange={(e) => onTypeChange(e.target.value)}
          style={{ ...inputStyle, background: '#fff' }}
        >
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
          <p style={{ fontSize: 13, color: '#2C8FC3', margin: 0 }}>
            User akan memilih entitas/wilayah kerja secara hierarkis (dropdown bertingkat)
          </p>
        </div>
      )}
    </div>
  )
}

/* ── ShareLinkBox ────────────────────────────────────────────────────────── */
function ShareLinkBox({ surveyId }: { surveyId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/survey/${surveyId}`

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(url) } catch {
      const el = document.createElement('textarea')
      el.value = url; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ background: '#f0f7ff', border: '1.5px solid #bfdbfe', borderRadius: 10, padding: '12px 14px', marginBottom: '1.25rem', textAlign: 'left' }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#1B6FA8', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>🔗 Link Survey</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          readOnly value={url}
          style={{ flex: 1, fontSize: 13, color: '#1a2332', background: '#fff', border: '1px solid #dde3ec', borderRadius: 7, padding: '8px 10px', outline: 'none', fontFamily: 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={handleCopy}
          style={{ flexShrink: 0, padding: '8px 14px', borderRadius: 7, border: 'none', background: copied ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#1B6FA8,#2C8FC3)', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          {copied ? '✓ Tersalin!' : 'Salin'}
        </button>
      </div>
    </div>
  )
}

/* ── ConfirmPublishModal ──────────────────────────────────────────────────── */
function ConfirmPublishModal({ title, onConfirm, onCancel }: {
  title: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999, padding: 0 }}
      className="modal-overlay-flex"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <style>{`
        @media (min-width: 541px) { .modal-overlay-flex { align-items: center !important; padding: 1rem !important; } }
        .modal-sheet { background:#fff; width:100%; max-width:420px; text-align:center; box-shadow:0 10px 25px rgba(0,0,0,0.15); padding:1.5rem 1.25rem 2rem; border-radius: 20px 20px 0 0; }
        .modal-handle { width:40px; height:4px; background:#e5e7eb; border-radius:2px; margin:0 auto 1.25rem; }
        @media (min-width: 541px) { .modal-sheet { border-radius:20px; padding:2.5rem 2rem; } .modal-handle { display:none; } }
      `}</style>
      <div className="modal-sheet">
        <div className="modal-handle" />
        <div style={{ width: 60, height: 60, margin: '0 auto 1rem', background: '#fefce8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>⚠️</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0d1f3c', margin: '0 0 8px' }}>Publish Survey?</p>
        <p style={{ fontSize: 13, color: '#4a5568', lineHeight: 1.6, margin: '0 0 6px' }}>
          Apakah kamu yakin ingin mempublish survey <strong>"{title}"</strong>?
        </p>
        <p style={{ fontSize: 13, color: '#b91c1c', margin: '0 0 20px' }}>Survey akan langsung aktif dan bisa diisi responden.</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onCancel} style={{ ...btnSecondary, flex: 1 }}>Batal</button>
          <button onClick={onConfirm} style={{ ...btnSuccess, flex: 1 }}>Ya, Publish</button>
        </div>
      </div>
    </div>
  )
}

/* ── PublishSuccessModal ──────────────────────────────────────────────────── */
function PublishSuccessModal({ title, surveyId, onGoToMaster }: {
  title: string; surveyId: string
  onClose: () => void; onGoToMaster: () => void
}) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,31,60,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 9999 }} className="modal-overlay-flex">
      <div className="modal-sheet" style={{ textAlign: 'center' }}>
        <div className="modal-handle" />
        <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'linear-gradient(135deg,#16a34a,#22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', fontSize: 28, color: '#fff' }}>✓</div>
        <p style={{ fontSize: 18, fontWeight: 700, color: '#0d1f3c', margin: '0 0 8px' }}>Survey Berhasil Dipublish!</p>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: '1.25rem', lineHeight: 1.6 }}>
          Survey <strong style={{ color: '#0d1f3c' }}>"{title}"</strong> sudah aktif dan siap diisi.
        </p>
        <ShareLinkBox surveyId={surveyId} />
        <button onClick={onGoToMaster} style={{ ...btnSuccess, width: '100%', padding: '11px 0' }}>
          Ke Halaman Master
        </button>
      </div>
    </div>
  )
}

/* ── StepIndicator ───────────────────────────────────────────────────────── */
function StepIndicator({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="step-bar">
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          {/* Circle */}
          <div style={{
            width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700,
            background: current > i + 1 ? '#38a169' : current === i + 1 ? '#1B6FA8' : '#e2e8f0',
            color: current >= i + 1 ? '#fff' : '#718096',
          }}>
            {current > i + 1 ? '✓' : i + 1}
          </div>
          {/* Label — hidden on mobile via CSS */}
          <span className="step-label" style={{ color: current === i + 1 ? '#1B6FA8' : '#a0aec0' }}>{s}</span>
          {/* Divider line */}
          {i < steps.length - 1 && (
            <div className="step-divider" style={{ flex: 1, height: 2, margin: '0 8px', background: current > i + 1 ? '#38a169' : '#e2e8f0', borderRadius: 2 }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════════════
   Main Page
══════════════════════════════════════════════════════════════════════════════ */
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
  const [showConfirmPublish, setShowConfirmPublish] = useState(false)
  const [showPublishSuccess, setShowPublishSuccess] = useState(false)

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

  const updateUserField = (i: number, key: keyof UserField, value: unknown) => {
    const u = [...userFields]; u[i] = { ...u[i], [key]: value }; setUserFields(u)
  }
  const updateQuestion = (i: number, key: keyof Question, value: unknown) => {
    const u = [...questions]; u[i] = { ...u[i], [key]: value }; setQuestions(u)
  }
  const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
    const u = [...arr]; u.splice(to, 0, u.splice(from, 1)[0]); return u
  }

  const handleSave = async (status: 'draft' | 'active') => {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/master/surveys/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, userFields, questions }),
      })
      const text = await res.text()
      if (!res.ok) { const d = text ? JSON.parse(text) : {}; setError(d.error || 'Terjadi kesalahan'); return }
      status === 'active' ? setShowPublishSuccess(true) : router.push('/master')
    } catch { setError('Terjadi kesalahan, coba lagi') }
    finally { setSaving(false) }
  }

  const steps = ['Info Dasar', 'Form User', 'Pertanyaan', 'Review']

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
      <p style={{ color: '#718096', fontSize: 14 }}>Memuat data survey...</p>
    </div>
  )

  return (
    <div className="edit-survey-wrap">
      <style>{globalCss}</style>

      {/* Modals */}
      {showConfirmPublish && (
        <ConfirmPublishModal
          title={title}
          onCancel={() => setShowConfirmPublish(false)}
          onConfirm={() => { setShowConfirmPublish(false); handleSave('active') }}
        />
      )}
      {showPublishSuccess && (
        <PublishSuccessModal
          title={title} surveyId={id}
          onClose={() => setShowPublishSuccess(false)}
          onGoToMaster={() => router.push('/master')}
        />
      )}

      {/* ── Page header ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#0d1f3c', marginBottom: 20 }}>Edit Survey</h2>
        <StepIndicator steps={steps} current={step} />
      </div>

      {/* ══ Step 1 ══ */}
      {step === 1 && (
        <div style={cardStyle}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1f3c', marginBottom: 18 }}>Info Dasar Survey</h3>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Judul Survey <span style={{ color: '#e53e3e' }}>*</span></label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Judul survey" />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={labelStyle}>Deskripsi</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, height: 88, resize: 'vertical' }} placeholder="Deskripsi singkat..." />
          </div>
          {error && <p style={{ color: '#e53e3e', fontSize: 13, marginBottom: 10 }}>{error}</p>}
          <div className="step-nav" style={{ justifyContent: 'flex-end' }}>
            <button onClick={() => { if (!title.trim()) { setError('Judul wajib diisi'); return } setError(''); setStep(2) }} style={btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ══ Step 2 ══ */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1f3c', marginBottom: 4 }}>Form Informasi User</h3>
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
              labelPlaceholder="Contoh: Nama Lengkap"
            />
          ))}

          <button
            onClick={() => setUserFields([...userFields, { label: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5, field_order: userFields.length + 1 }])}
            style={{ width: '100%', padding: '13px', border: '2px dashed #bee3f8', borderRadius: 12, background: 'transparent', color: '#2C8FC3', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Tambah Field
          </button>

          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}

          <div className="step-nav">
            <button onClick={() => setStep(1)} style={btnSecondary}>← Kembali</button>
            <button onClick={() => { if (userFields.some(f => !f.label.trim())) { setError('Semua label field wajib diisi'); return } setError(''); setStep(3) }} style={btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ══ Step 3 ══ */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1f3c', marginBottom: 4 }}>Pertanyaan Survey</h3>
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
              labelPlaceholder="Contoh: Bagaimana penilaian Anda?"
            />
          ))}

          <button
            onClick={() => setQuestions([...questions, { question_text: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5, question_order: questions.length + 1 }])}
            style={{ width: '100%', padding: '13px', border: '2px dashed #bee3f8', borderRadius: 12, background: 'transparent', color: '#2C8FC3', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Tambah Pertanyaan
          </button>

          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}

          <div className="step-nav">
            <button onClick={() => setStep(2)} style={btnSecondary}>← Kembali</button>
            <button onClick={() => { if (questions.some(q => !q.question_text.trim())) { setError('Semua pertanyaan wajib diisi'); return } setError(''); setStep(4) }} style={btnPrimary}>
              Lanjut →
            </button>
          </div>
        </div>
      )}

      {/* ══ Step 4 — Review ══ */}
      {step === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={cardStyle}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0d1f3c', marginBottom: 18 }}>Review Survey</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Judul */}
              <div style={{ padding: '12px 14px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Judul</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#0d1f3c' }}>{title}</p>
              </div>
              {/* Deskripsi */}
              {description && (
                <div style={{ padding: '12px 14px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Deskripsi</p>
                  <p style={{ fontSize: 13, color: '#4a5568' }}>{description}</p>
                </div>
              )}
              {/* Form User */}
              <div style={{ padding: '12px 14px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>Form Informasi User</p>
                {userFields.map((f, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    {i + 1}. {f.label} <span style={{ color: '#a0aec0' }}>({USER_FIELD_TYPES.find(t => t.value === f.type)?.label})</span>
                  </p>
                ))}
              </div>
              {/* Pertanyaan */}
              <div style={{ padding: '12px 14px', background: '#f7fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                  Pertanyaan ({questions.length})
                </p>
                {questions.map((q, i) => (
                  <p key={i} style={{ fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    {i + 1}. {q.question_text} <span style={{ color: '#a0aec0' }}>({QUESTION_TYPES.find(t => t.value === q.type)?.label})</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#e53e3e', fontSize: 13 }}>{error}</p>}

          {/* Nav — 3 buttons, stack on mobile */}
          <div className="step-nav">
            <button onClick={() => setStep(3)} style={btnSecondary}>← Kembali</button>
            <div className="step-nav-right">
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                style={{ ...btnSecondary, opacity: saving ? 0.5 : 1 }}
              >
                {saving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button
                onClick={() => { if (!title.trim()) { setError('Judul survey wajib diisi'); return } setShowConfirmPublish(true) }}
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
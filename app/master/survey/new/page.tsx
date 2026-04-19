'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserField {
  label: string
  type: string
  options: string[]
  rating_min: number
  rating_max: number
}

interface Question {
  question_text: string
  type: string
  options: string[]
  rating_min: number
  rating_max: number
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

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .survey-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Stepper ── */
  .step-circle {
    width: 32px; height: 32px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600; flex-shrink: 0; transition: all .25s;
  }
  .step-circle.done  { background: #16a34a; color: #fff; }
  .step-circle.active{ background: #1B6FA8; color: #fff; box-shadow: 0 0 0 4px rgba(27,111,168,.15); }
  .step-circle.idle  { background: #e5e9f0; color: #8fa0b4; }

  .step-label { margin-left: 6px; font-size: 12px; font-weight: 500; white-space: nowrap; }
  .step-label.active { color: #1B6FA8; }
  .step-label.done   { color: #16a34a; }
  .step-label.idle   { color: #8fa0b4; }

  .step-line { flex: 1; height: 2px; margin: 0 8px; border-radius: 2px; background: #e5e9f0; transition: background .25s; min-width: 8px; }
  .step-line.done { background: #16a34a; }

  /* ── Card ── */
  .survey-card {
    background: #fff; border-radius: 12px; border: 1px solid #e5e9f0;
    padding: 1.25rem; margin-bottom: 1rem;
  }
  .survey-card-title { font-size: 15px; font-weight: 700; color: #0d1f3c; margin-bottom: 4px; }
  .survey-card-sub   { font-size: 13px; color: #6b7280; }

  /* ── Form ── */
  .field-label    { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; display: block; }
  .field-required { color: #ef4444; }
  .field-optional { font-weight: 400; color: #9ca3af; }
  .form-group     { margin-bottom: 1rem; }

  .survey-input, .survey-select, .survey-textarea {
    width: 100%; background: #f8fafc; border: 1px solid #dde3ec; border-radius: 8px;
    padding: 10px 14px; font-size: 14px; color: #1a2332;
    font-family: 'Plus Jakarta Sans', sans-serif;
    outline: none; transition: border .2s, box-shadow .2s;
  }
  .survey-input:focus, .survey-select:focus, .survey-textarea:focus {
    border-color: #1B6FA8; box-shadow: 0 0 0 3px rgba(27,111,168,.12);
  }
  .survey-textarea { resize: vertical; min-height: 80px; }
  .survey-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238fa0b4'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px;
  }

  /* ── Inline row: 2 cols desktop, 1 col mobile ── */
  .inline-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  /* ── Field card ── */
  .field-card {
    background: #fff; border: 1px solid #e5e9f0; border-radius: 12px;
    padding: 1rem; margin-bottom: .75rem; transition: box-shadow .2s;
  }
  .field-card:hover { box-shadow: 0 2px 8px rgba(13,31,60,.06); }
  .field-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: .875rem; gap: 8px; }
  .field-num {
    font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
    color: #1B6FA8; background: #e8f3fb; padding: 3px 10px; border-radius: 20px;
    white-space: nowrap;
  }
  .field-actions { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }

  /* ── Buttons ── */
  .btn-icon {
    background: none; border: 1px solid #e5e9f0; border-radius: 6px;
    padding: 5px 9px; cursor: pointer; font-size: 13px; color: #8fa0b4;
    transition: all .2s; line-height: 1;
  }
  .btn-icon:hover:not(:disabled) { background: #f0f4f8; color: #1B6FA8; border-color: #b8d4e8; }
  .btn-icon:disabled { opacity: .3; cursor: not-allowed; }

  .btn-remove {
    background: none; border: 1px solid #fee2e2; border-radius: 6px;
    padding: 5px 10px; cursor: pointer; font-size: 12px; font-weight: 500;
    color: #ef4444; transition: all .2s; font-family: 'Plus Jakarta Sans', sans-serif;
    white-space: nowrap;
  }
  .btn-remove:hover { background: #fef2f2; border-color: #fca5a5; }

  .btn-add-opt {
    font-size: 13px; color: #1B6FA8; background: none; border: none;
    cursor: pointer; padding: 4px 0; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500; display: flex; align-items: center; gap: 4px;
  }
  .btn-add-opt:hover { color: #0d5a8a; }

  .btn-add-field {
    width: 100%; padding: 14px; border: 2px dashed #dde3ec; border-radius: 12px;
    background: none; cursor: pointer; font-size: 14px; font-weight: 500;
    color: #8fa0b4; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: all .2s; display: flex; align-items: center; justify-content: center;
    gap: 8px; margin-bottom: 1rem;
  }
  .btn-add-field:hover { border-color: #1B6FA8; color: #1B6FA8; background: #f0f7ff; }

  .btn-back {
    background: #fff; border: 1px solid #dde3ec; border-radius: 8px;
    padding: 10px 20px; font-size: 14px; font-weight: 600; color: #374151;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .2s;
    white-space: nowrap;
  }
  .btn-back:hover { background: #f0f4f8; border-color: #b8d4e8; }

  .btn-next {
    background: linear-gradient(135deg, #1B6FA8, #2C8FC3); border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: opacity .2s; display: flex; align-items: center; gap: 8px;
    white-space: nowrap;
  }
  .btn-next:hover { opacity: .9; }

  .btn-draft {
    background: #fff; border: 1px solid #dde3ec; border-radius: 8px;
    padding: 10px 18px; font-size: 14px; font-weight: 600; color: #374151;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .2s;
    white-space: nowrap;
  }
  .btn-draft:hover:not(:disabled) { background: #f0f4f8; }

  .btn-publish {
    background: linear-gradient(135deg, #16a34a, #22c55e); border: none; border-radius: 8px;
    padding: 10px 24px; font-size: 14px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity .2s;
    white-space: nowrap;
  }
  .btn-publish:hover:not(:disabled) { opacity: .9; }
  .btn-draft:disabled, .btn-publish:disabled { opacity: .5; cursor: not-allowed; }

  /* ── Nav row ── */
  .nav-row {
    display: flex; justify-content: space-between; align-items: center;
    margin-top: 1rem; gap: 8px; flex-wrap: wrap;
  }
  .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }

  /* ── Misc ── */
  .opt-row { display: flex; gap: 8px; margin-bottom: 6px; align-items: center; }
  .opt-del {
    background: none; border: none; cursor: pointer; color: #d1d5db;
    font-size: 18px; padding: 0 4px; line-height: 1; transition: color .2s; flex-shrink: 0;
  }
  .opt-del:hover { color: #ef4444; }

  .rating-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem; }

  .info-box {
    background: #f0f7ff; border: 1px solid #bfdbfe; border-radius: 8px;
    padding: 10px 14px; font-size: 13px; color: #1B6FA8; font-weight: 500; margin-top: 1rem;
  }
  .error-msg {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
    padding: 10px 14px; font-size: 13px; color: #dc2626; font-weight: 500; margin-bottom: 1rem;
  }

  /* ── Review ── */
  .review-label {
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px;
    text-transform: uppercase; color: #8fa0b4; margin-bottom: 6px;
  }
  .review-value { font-size: 15px; font-weight: 600; color: #0d1f3c; }
  .review-desc  { font-size: 14px; color: #374151; line-height: 1.6; }
  .review-list  { list-style: none; margin-top: 4px; padding: 0; }
  .review-list li {
    font-size: 13px; color: #374151; padding: 7px 0;
    border-bottom: 1px solid #f3f4f6;
    display: flex; align-items: flex-start; gap: 8px; flex-wrap: wrap;
  }
  .review-list li:last-child { border-bottom: none; }
  .review-badge {
    font-size: 11px; font-weight: 500; color: #1B6FA8;
    background: #e8f3fb; border-radius: 20px; padding: 2px 8px;
    flex-shrink: 0; margin-left: auto;
  }
  .review-divider { height: 1px; background: #f3f4f6; margin: 1rem 0; }
  .review-section { margin-bottom: 1.25rem; }

  /* ── Modals ── */
  @keyframes modalOverlayIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes modalBoxIn { from { opacity: 0; transform: scale(.92) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
  @keyframes checkPop { 0% { transform: scale(0) } 70% { transform: scale(1.18) } 100% { transform: scale(1) } }

  .modal-overlay {
    position: fixed; inset: 0; background: rgba(13,31,60,0.5);
    display: flex; align-items: flex-end; justify-content: center;
    z-index: 9999; padding: 0;
    animation: modalOverlayIn .2s ease;
  }
  .modal-box {
    background: #fff; border-radius: 20px 20px 0 0; padding: 2rem 1.25rem 2.5rem;
    width: 100%; text-align: center;
    animation: modalBoxIn .3s cubic-bezier(.34,1.56,.64,1);
  }
  .modal-handle {
    width: 40px; height: 4px; background: #e5e7eb; border-radius: 9999px;
    margin: 0 auto 1.25rem;
  }
  .modal-check {
    width: 68px; height: 68px; border-radius: 50%;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.25rem; font-size: 28px; color: #fff;
    animation: checkPop .45s .15s cubic-bezier(.34,1.56,.64,1) both;
  }
  .modal-warn-icon {
    width: 60px; height: 60px; border-radius: 50%;
    background: #fefce8; display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; font-size: 28px;
  }
  .modal-title { font-size: 18px; font-weight: 700; color: #0d1f3c; margin: 0 0 10px; }
  .modal-body  { font-size: 14px; color: #6b7280; line-height: 1.65; margin: 0 0 6px; }
  .modal-body strong { color: #0d1f3c; font-weight: 600; }
  .modal-btns { display: flex; gap: 8px; margin-top: 1.25rem; }
  .modal-btn-outline {
    flex: 1; padding: 11px 0; border: 1px solid #dde3ec; border-radius: 10px;
    background: #fff; font-size: 14px; font-weight: 600; color: #374151;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .2s;
  }
  .modal-btn-outline:hover { background: #f0f4f8; border-color: #b8d4e8; }
  .modal-btn-green {
    flex: 1; padding: 11px 0; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    font-size: 14px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: opacity .2s;
  }
  .modal-btn-green:hover { opacity: .9; }

  /* ── Share link box ── */
  .share-link-box {
    background: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 10px;
    padding: 12px 14px; margin-bottom: 1.25rem; text-align: left;
  }
  .share-link-label {
    font-size: 11px; font-weight: 700; color: #1B6FA8;
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 8px;
  }
  .share-link-row { display: flex; gap: 8px; align-items: center; }
  .share-link-input {
    flex: 1; font-size: 13px; color: #1a2332; background: #fff;
    border: 1px solid #dde3ec; border-radius: 7px; padding: 8px 12px;
    outline: none; font-family: inherit; overflow: hidden;
    text-overflow: ellipsis; white-space: nowrap; min-width: 0;
  }
  .share-link-btn {
    flex-shrink: 0; padding: 8px 14px; border-radius: 7px; border: none;
    color: #fff; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: inherit; transition: background 0.2s; white-space: nowrap;
  }

  /* ── MOBILE OVERRIDES (≤ 480px) ── */
  @media (max-width: 480px) {
    .survey-wrap { padding: 0 0 24px; }

    /* Stepper: hide labels, keep circles + lines */
    .step-label { display: none; }
    .step-circle { width: 28px; height: 28px; font-size: 12px; }
    .step-line   { margin: 0 6px; }

    /* Cards */
    .survey-card { padding: 1rem; }

    /* Field form: stack label + type */
    .inline-row { grid-template-columns: 1fr; gap: .75rem; }

    /* Rating: keep 2 cols but let them shrink */
    .rating-row { grid-template-columns: 1fr 1fr; gap: .75rem; }

    /* Nav: back left, next right — but btn-group wraps */
    .nav-row { flex-wrap: wrap; }
    .btn-group { width: 100%; justify-content: flex-end; }

    /* Full-width publish + draft buttons */
    .btn-draft, .btn-publish { flex: 1; text-align: center; justify-content: center; padding: 11px 12px; }
    .btn-next  { flex: 1; justify-content: center; }

    /* Review badge pushes to new line gracefully */
    .review-list li { flex-wrap: wrap; }
    .review-badge   { margin-left: 0; }

    /* Modal: bottom sheet */
    .modal-box { border-radius: 20px 20px 0 0; padding: 0 1rem 2rem; }

    /* Share link: stack on very narrow screens */
    .share-link-row { flex-direction: column; align-items: stretch; }
    .share-link-btn { width: 100%; padding: 10px; text-align: center; }
  }

  /* ── SMALL-MEDIUM (481px – 640px): restore labels ── */
  @media (min-width: 481px) {
    .modal-overlay { align-items: center; padding: 1rem; }
    .modal-box     { border-radius: 20px; padding: 2.5rem 2rem; max-width: 420px; width: 100%; }
    .modal-handle  { display: none; }
    .survey-card   { padding: 1.5rem; }
    .survey-card-title { font-size: 16px; }
  }
`

// ─── Sub-components ───────────────────────────────────────────────────────────

function OptionsInput({ options, onChange }: {
  options: string[]
  onChange: (options: string[]) => void
}) {
  const addOption = () => onChange([...options, ''])
  const updateOption = (i: number, v: string) => { const u = [...options]; u[i] = v; onChange(u) }
  const removeOption = (i: number) => onChange(options.filter((_, idx) => idx !== i))

  return (
    <div style={{ marginTop: '1rem' }}>
      <label className="field-label">Opsi Jawaban</label>
      {options.map((opt, i) => (
        <div key={i} className="opt-row">
          <input
            type="text" value={opt}
            onChange={(e) => updateOption(i, e.target.value)}
            className="survey-input" placeholder={`Opsi ${i + 1}`}
            style={{ flex: 1 }}
          />
          <button onClick={() => removeOption(i)} className="opt-del">×</button>
        </div>
      ))}
      <button onClick={addOption} className="btn-add-opt">+ Tambah Opsi</button>
    </div>
  )
}

function RatingInput({ min, max, onMinChange, onMaxChange }: {
  min: number; max: number
  onMinChange: (v: number) => void; onMaxChange: (v: number) => void
}) {
  return (
    <div className="rating-row">
      <div>
        <label className="field-label">Batas Bawah</label>
        <input type="number" value={min} onChange={(e) => onMinChange(Number(e.target.value))} className="survey-input" />
      </div>
      <div>
        <label className="field-label">Batas Atas</label>
        <input type="number" value={max} onChange={(e) => onMaxChange(Number(e.target.value))} className="survey-input" />
      </div>
    </div>
  )
}

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
    <div className="field-card">
      <div className="field-card-header">
        <span className="field-num">#{index + 1}</span>
        <div className="field-actions">
          <button onClick={onMoveUp} disabled={isFirst} className="btn-icon">↑</button>
          <button onClick={onMoveDown} disabled={isLast} className="btn-icon">↓</button>
          <button onClick={onRemove} className="btn-remove">Hapus</button>
        </div>
      </div>

      <div className="inline-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="field-label">Label</label>
          <input
            type="text" value={label}
            onChange={(e) => onLabelChange(e.target.value)}
            className="survey-input" placeholder={labelPlaceholder}
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="field-label">Tipe Input</label>
          <select value={type} onChange={(e) => onTypeChange(e.target.value)} className="survey-select">
            {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </div>

      {['radio', 'checkbox', 'dropdown'].includes(type) && (
        <OptionsInput options={options} onChange={onOptionsChange} />
      )}
      {type === 'rating' && (
        <RatingInput min={ratingMin} max={ratingMax} onMinChange={onRatingMinChange} onMaxChange={onRatingMaxChange} />
      )}
      {type === 'entity' && (
        <div className="info-box">
          User akan memilih entitas/wilayah kerja secara hierarkis (dropdown bertingkat)
        </div>
      )}
    </div>
  )
}

// ── Stepper ──
function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
      {steps.map((s, i) => {
        const n = i + 1
        const done = current > n; const active = current === n
        const cc = done ? 'done' : active ? 'active' : 'idle'
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div className={`step-circle ${cc}`}>{done ? '✓' : n}</div>
            <span className={`step-label ${cc}`}>{s}</span>
            {i < steps.length - 1 && <div className={`step-line ${current > n ? 'done' : ''}`} />}
          </div>
        )
      })}
    </div>
  )
}

// ── Share Link Box ──
function ShareLinkBox({ surveyId }: { surveyId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/survey/${surveyId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url; document.body.appendChild(el); el.select()
      document.execCommand('copy'); document.body.removeChild(el)
    }
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share-link-box">
      <p className="share-link-label">🔗 Link Survey</p>
      <div className="share-link-row">
        <input readOnly value={url} className="share-link-input" onFocus={(e) => e.target.select()} />
        <button
          onClick={handleCopy}
          className="share-link-btn"
          style={{ background: copied ? 'linear-gradient(135deg,#16a34a,#22c55e)' : 'linear-gradient(135deg,#1B6FA8,#2C8FC3)' }}
        >
          {copied ? '✓ Tersalin!' : 'Salin Link'}
        </button>
      </div>
    </div>
  )
}

// ── Publish Modal ──
function PublishModal({ title, surveyId, onClose, onGoToMaster }: {
  title: string; surveyId: string; onClose: () => void; onGoToMaster: () => void
}) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box">
        <div className="modal-handle" />
        <div className="modal-check">✓</div>
        <p className="modal-title">Survey Berhasil Dipublish!</p>
        <p className="modal-body">
          Survey <strong>"{title}"</strong> sudah aktif dan siap diisi oleh responden.
        </p>
        {surveyId && <ShareLinkBox surveyId={surveyId} />}
        <div className="modal-btns">
          <button className="modal-btn-green" onClick={onGoToMaster}>Ke Halaman Master</button>
        </div>
      </div>
    </div>
  )
}

// ── Confirm Publish Modal ──
function ConfirmPublishModal({ title, onConfirm, onCancel }: {
  title: string; onConfirm: () => void; onCancel: () => void
}) {
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="modal-box">
        <div className="modal-handle" />
        <div className="modal-warn-icon">⚠️</div>
        <p className="modal-title">Publish Survey?</p>
        <p className="modal-body">
          Apakah kamu yakin ingin mempublish survey <strong>"{title}"</strong>?
        </p>
        <p className="modal-body" style={{ color: '#b91c1c' }}>
          Survey ini akan langsung aktif dan bisa diisi oleh responden.
        </p>
        <div className="modal-btns">
          <button className="modal-btn-outline" onClick={onCancel}>Batal</button>
          <button className="modal-btn-green" onClick={onConfirm}>Ya, Publish Sekarang</button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function NewSurveyPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [publishedId, setPublishedId] = useState('')
  const [showConfirmPublish, setShowConfirmPublish] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [userFields, setUserFields] = useState<UserField[]>([
    { label: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5 },
  ])
  const [questions, setQuestions] = useState<Question[]>([
    { question_text: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5 },
  ])

  const updateUserField = (i: number, key: keyof UserField, value: unknown) => {
    const u = [...userFields]; u[i] = { ...u[i], [key]: value }; setUserFields(u)
  }
  const updateQuestion = (i: number, key: keyof Question, value: unknown) => {
    const u = [...questions]; u[i] = { ...u[i], [key]: value }; setQuestions(u)
  }
  const moveItem = <T,>(arr: T[], from: number, to: number): T[] => {
    const u = [...arr]; const item = u.splice(from, 1)[0]; u.splice(to, 0, item); return u
  }

  const handleSave = async (status: 'draft' | 'active') => {
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/master/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, status, userFields, questions }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Terjadi kesalahan'); return }
      if (status === 'active') { setPublishedId(data.survey.id); setShowPublishModal(true) }
      else router.push('/master')
    } catch { setError('Terjadi kesalahan, coba lagi') }
    finally { setSaving(false) }
  }

  const STEPS = ['Info Dasar', 'Form User', 'Pertanyaan', 'Review']

  return (
    <div className="survey-wrap" style={{ maxWidth: 720, margin: '0 auto' }}>
      <style>{styles}</style>

      {showPublishModal && (
        <PublishModal title={title} surveyId={publishedId}
          onClose={() => setShowPublishModal(false)}
          onGoToMaster={() => router.push('/master')} />
      )}
      {showConfirmPublish && (
        <ConfirmPublishModal title={title}
          onCancel={() => setShowConfirmPublish(false)}
          onConfirm={() => { setShowConfirmPublish(false); handleSave('active') }} />
      )}

      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0d1f3c', marginBottom: '1.25rem' }}>
        Buat Survey Baru
      </h2>

      <Stepper steps={STEPS} current={step} />

      {/* ── Step 1: Info Dasar ── */}
      {step === 1 && (
        <>
          <div className="survey-card">
            <p className="survey-card-title">Info Dasar Survey</p>
            <p className="survey-card-sub" style={{ marginBottom: '1.25rem' }}>Tentukan judul dan deskripsi singkat survey</p>
            <div className="form-group">
              <label className="field-label">Judul Survey <span className="field-required">*</span></label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                className="survey-input" placeholder="Contoh: Survey Kepuasan Pelanggan Q1 2025" />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="field-label">Deskripsi <span className="field-optional">(opsional)</span></label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="survey-textarea" placeholder="Deskripsi singkat tentang survey ini..." rows={3} />
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div className="nav-row">
            <div />
            <button className="btn-next" onClick={() => {
              if (!title.trim()) { setError('Judul survey wajib diisi'); return }
              setError(''); setStep(2)
            }}>Lanjut →</button>
          </div>
        </>
      )}

      {/* ── Step 2: Form User ── */}
      {step === 2 && (
        <>
          <div className="survey-card">
            <p className="survey-card-title">Form Informasi User</p>
            <p className="survey-card-sub">Field yang akan diisi user sebelum mengerjakan survey</p>
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
          <button className="btn-add-field"
            onClick={() => setUserFields([...userFields, { label: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5 }])}>
            + Tambah Field
          </button>
          {error && <div className="error-msg">{error}</div>}
          <div className="nav-row">
            <button className="btn-back" onClick={() => { setError(''); setStep(1) }}>← Kembali</button>
            <button className="btn-next" onClick={() => {
              if (userFields.some(f => !f.label.trim())) { setError('Semua label field wajib diisi'); return }
              setError(''); setStep(3)
            }}>Lanjut →</button>
          </div>
        </>
      )}

      {/* ── Step 3: Pertanyaan ── */}
      {step === 3 && (
        <>
          <div className="survey-card">
            <p className="survey-card-title">Pertanyaan Survey</p>
            <p className="survey-card-sub">Tambahkan pertanyaan yang akan dijawab user</p>
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
              labelPlaceholder="Contoh: Bagaimana penilaian Anda terhadap layanan kami?" />
          ))}
          <button className="btn-add-field"
            onClick={() => setQuestions([...questions, { question_text: '', type: 'short_text', options: [], rating_min: 1, rating_max: 5 }])}>
            + Tambah Pertanyaan
          </button>
          {error && <div className="error-msg">{error}</div>}
          <div className="nav-row">
            <button className="btn-back" onClick={() => { setError(''); setStep(2) }}>← Kembali</button>
            <button className="btn-next" onClick={() => {
              if (questions.some(q => !q.question_text.trim())) { setError('Semua pertanyaan wajib diisi'); return }
              setError(''); setStep(4)
            }}>Lanjut →</button>
          </div>
        </>
      )}

      {/* ── Step 4: Review ── */}
      {step === 4 && (
        <>
          <div className="survey-card">
            <p className="survey-card-title" style={{ marginBottom: '1.25rem' }}>Review Survey</p>
            <div className="review-section">
              <p className="review-label">Judul</p>
              <p className="review-value">{title}</p>
            </div>
            {description && (
              <div className="review-section">
                <p className="review-label">Deskripsi</p>
                <p className="review-desc">{description}</p>
              </div>
            )}
            <div className="review-divider" />
            <div className="review-section">
              <p className="review-label">Form Informasi User ({userFields.length} field)</p>
              <ul className="review-list">
                {userFields.map((f, i) => (
                  <li key={i}>
                    <span>{i + 1}. {f.label}</span>
                    <span className="review-badge">{USER_FIELD_TYPES.find(t => t.value === f.type)?.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="review-divider" />
            <div className="review-section" style={{ marginBottom: 0 }}>
              <p className="review-label">Pertanyaan ({questions.length})</p>
              <ul className="review-list">
                {questions.map((q, i) => (
                  <li key={i}>
                    <span>{i + 1}. {q.question_text}</span>
                    <span className="review-badge">{QUESTION_TYPES.find(t => t.value === q.type)?.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {error && <div className="error-msg">{error}</div>}
          <div className="nav-row">
            <button className="btn-back" onClick={() => { setError(''); setStep(3) }}>← Kembali</button>
            <div className="btn-group">
              <button className="btn-draft" onClick={() => handleSave('draft')} disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Draft'}
              </button>
              <button className="btn-publish"
                onClick={() => { if (!title.trim()) { setError('Judul survey wajib diisi'); return }; setShowConfirmPublish(true) }}
                disabled={saving}>
                {saving ? 'Menyimpan...' : 'Publish Sekarang'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
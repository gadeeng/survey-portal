'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface UserField {
  id: string
  label: string
  type: 'short_text' | 'long_text' | 'dropdown' | 'radio' | 'checkbox' | 'rating' | 'date' | 'entity'
  options?: string[]
  rating_min?: number
  rating_max?: number
  field_order: number
}

export default function SurveyIdentityPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.surveyId as string

  const [fields, setFields] = useState<UserField[]>([])
  const [surveyTitle, setSurveyTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  // Ganti menjadi
  const [entities, setEntities] = useState<{ id: string; name: string; level: number; parent_id: string | null; is_active: boolean }[]>([])
  const [entitySelections, setEntitySelections] = useState<Record<string, { l1: string; l2: string; l3: string }>>({})

  useEffect(() => {
    fetch(`/api/survey/${surveyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push(`/survey/${surveyId}`); return }
        setSurveyTitle(d.survey.title)
        setFields(d.userFields)
        const init: Record<string, string | string[]> = {}
        d.userFields.forEach((f: UserField) => {
          init[f.id] = f.type === 'checkbox' ? [] : ''
        })
        setAnswers(init)

        // Fetch entities jika ada field bertipe entity
        const hasEntity = d.userFields.some((f: UserField) => f.type === 'entity')
        if (hasEntity) {
          fetch('/api/master/entities')
            .then((r) => r.json())
            .then((d) => setEntities(d.entities || []))
        }
      })
      .finally(() => setLoading(false))
  }, [surveyId])

  const setValue = (fieldId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[fieldId]; return n })
  }

  const toggleCheckbox = (fieldId: string, option: string) => {
    const current = (answers[fieldId] as string[]) || []
    setValue(
      fieldId,
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option]
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    fields.forEach((f) => {
      const val = answers[f.id]
      const empty = Array.isArray(val) ? val.length === 0 : !val
      if (empty) errs[f.id] = 'Wajib diisi'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (!validate()) return
    sessionStorage.setItem(`survey_identity_${surveyId}`, JSON.stringify(answers))
    router.push(`/survey/${surveyId}/questions`)
  }

  const setEntityLevel = (fieldId: string, level: 1 | 2 | 3, value: string) => {
    setEntitySelections((prev) => {
      const current = prev[fieldId] || { l1: '', l2: '', l3: '' }
      const next = { ...current }
      if (level === 1) { next.l1 = value; next.l2 = ''; next.l3 = '' }
      if (level === 2) { next.l2 = value; next.l3 = '' }
      if (level === 3) { next.l3 = value }
      // Simpan value paling dalam yang dipilih ke answers
      const finalValue = next.l3 || next.l2 || next.l1
      setValue(fieldId, finalValue)
      return { ...prev, [fieldId]: next }
    })
  }

  const getEntityChildren = (parentId: string) =>
    entities.filter((e) => e.parent_id === parentId && e.is_active !== false)

  const getEntityRoots = () =>
    entities.filter((e) => e.level === 1)


  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .page-root {
          min-height: 100vh;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: #f0f4f8;
        }

        /* Header bar */
        .top-bar {
          background: linear-gradient(135deg, #0d1f3c, #1B6FA8);
          padding: 0 32px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 16px rgba(13,31,60,.3);
        }
        .top-bar img { height: 36px; object-fit: contain; filter: brightness(0) invert(1); opacity: .9; }
        .top-survey-title { font-size: 13px; color: rgba(255,255,255,.7); font-weight: 500; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        /* Progress */
        .progress-bar-wrap { background: #fff; border-bottom: 1px solid #e8edf4; padding: 12px 32px; }
        .progress-steps { display: flex; align-items: center; gap: 0; max-width: 560px; margin: 0 auto; }
        .step-item { display: flex; align-items: center; flex: 1; }
        .step-circle {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; transition: all .2s;
        }
        .step-circle.done { background: #1B6FA8; color: #fff; }
        .step-circle.active { background: #1B6FA8; color: #fff; box-shadow: 0 0 0 3px rgba(27,111,168,.2); }
        .step-circle.pending { background: #e8edf4; color: #94a3b8; }
        .step-label { font-size: 11px; font-weight: 600; margin-top: 4px; text-align: center; }
        .step-label.active { color: #1B6FA8; }
        .step-label.pending { color: #94a3b8; }
        .step-line { flex: 1; height: 2px; background: #e8edf4; margin: 0 6px; }
        .step-line.done { background: #1B6FA8; }
        .step-wrapper { display: flex; flex-direction: column; align-items: center; }

        /* Content */
        .content { max-width: 600px; margin: 0 auto; padding: 32px 16px 80px; }

        .section-header { margin-bottom: 28px; }
        .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #1B6FA8; margin-bottom: 8px; }
        .section-title { font-size: 22px; font-weight: 700; color: #0d1f3c; margin-bottom: 6px; }
        .section-sub { font-size: 13px; color: #64748b; }

        .field-card {
          background: #fff; border-radius: 12px; border: 1px solid #e8edf4;
          padding: 22px 24px; margin-bottom: 16px;
          transition: border-color .2s, box-shadow .2s;
        }
        .field-card.has-error { border-color: #fca5a5; }
        .field-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 12px; }
        .required-dot { color: #ef4444; margin-left: 3px; }

        .f-input, .f-textarea, .f-select {
          width: 100%; background: #f8fafc; border: 1px solid #dde3ec; border-radius: 8px;
          padding: 0 14px; font-size: 14px; color: #1a2332;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border .2s, box-shadow .2s;
        }
        .f-input { height: 44px; }
        .f-textarea { padding: 12px 14px; min-height: 96px; resize: vertical; }
        .f-select { height: 44px; appearance: none; cursor: pointer; }
        .f-input:focus, .f-textarea:focus, .f-select:focus {
          border-color: #1B6FA8; box-shadow: 0 0 0 3px rgba(27,111,168,.1);
        }
        .f-input::placeholder, .f-textarea::placeholder { color: #c4cdd8; }

        /* Radio & checkbox */
        .options-list { display: flex; flex-direction: column; gap: 8px; }
        .option-row {
          display: flex; align-items: center; gap: 12px;
          background: #f8fafc; border: 1px solid #e8edf4; border-radius: 8px;
          padding: 11px 14px; cursor: pointer;
          transition: border-color .15s, background .15s;
        }
        .option-row:hover { border-color: #93c5fd; background: #eff6ff; }
        .option-row.selected { border-color: #1B6FA8; background: #EBF5FF; }
        .option-circle {
          width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          transition: all .15s;
        }
        .option-row.selected .option-circle { border-color: #1B6FA8; background: #1B6FA8; }
        .option-inner { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
        .option-square {
          width: 18px; height: 18px; border-radius: 4px; border: 2px solid #d1d5db;
          flex-shrink: 0; display: flex; align-items: center; justify-content: center;
          transition: all .15s; font-size: 11px; color: transparent;
        }
        .option-row.selected .option-square { border-color: #1B6FA8; background: #1B6FA8; color: #fff; }
        .option-text { font-size: 14px; color: #374151; }
        .option-row.selected .option-text { color: #1B6FA8; font-weight: 600; }

        /* Rating */
        .rating-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .rating-btn {
          width: 44px; height: 44px; border-radius: 8px; border: 1.5px solid #dde3ec;
          background: #f8fafc; font-size: 14px; font-weight: 600; color: #64748b;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all .15s;
        }
        .rating-btn:hover { border-color: #1B6FA8; color: #1B6FA8; background: #EBF5FF; }
        .rating-btn.selected { border-color: #1B6FA8; background: #1B6FA8; color: #fff; }

        .field-error { font-size: 12px; color: #ef4444; margin-top: 8px; font-weight: 500; }

        /* Bottom nav */
        .bottom-nav {
          position: fixed; bottom: 0; left: 0; right: 0;
          background: #fff; border-top: 1px solid #e8edf4;
          padding: 16px 32px; display: flex; justify-content: space-between; align-items: center;
          z-index: 100; box-shadow: 0 -4px 16px rgba(13,31,60,.06);
        }
        .btn-back {
          height: 44px; padding: 0 20px;
          background: transparent; border: 1.5px solid #dde3ec; border-radius: 8px;
          font-size: 14px; font-weight: 600; color: #64748b;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          transition: border-color .15s, color .15s;
        }
        .btn-back:hover { border-color: #94a3b8; color: #374151; }
        .btn-next {
          height: 44px; padding: 0 28px;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3); color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-next:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,111,168,.3); }

        .loading-center { display: flex; justify-content: center; align-items: center; height: 200px; }
        .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1B6FA8; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-root">
        {/* Top bar */}
        <div className="top-bar">
          <img src="/white-logo.png" alt="PT Pelindo Daya Sejahtera" />
          <span className="top-survey-title">{surveyTitle}</span>
        </div>

        {/* Progress */}
        <div className="progress-bar-wrap">
          <div className="progress-steps">
            {[
              { label: 'Intro', step: 0 },
              { label: 'Identitas', step: 1 },
              { label: 'Pertanyaan', step: 2 },
              { label: 'Selesai', step: 3 },
            ].map((s, i, arr) => (
              <div key={s.step} className="step-item">
                <div className="step-wrapper">
                  <div className={`step-circle ${s.step < 1 ? 'done' : s.step === 1 ? 'active' : 'pending'}`}>
                    {s.step < 1 ? '✓' : s.step + 1}
                  </div>
                  <span className={`step-label ${s.step === 1 ? 'active' : 'pending'}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className={`step-line ${s.step < 1 ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="content">
          <div className="section-header">
            <p className="section-eyebrow">Langkah 1 dari 2</p>
            <h2 className="section-title">Data Identitas Anda</h2>
            <p className="section-sub">Mohon isi informasi berikut sebelum melanjutkan ke pertanyaan survey.</p>
          </div>

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            fields.map((field) => (
              <div key={field.id} className={`field-card ${errors[field.id] ? 'has-error' : ''}`}>
                <label className="field-label">
                  {field.label}
                  <span className="required-dot">*</span>
                </label>

                {field.type === 'short_text' && (
                  <input
                    className="f-input"
                    type="text"
                    value={answers[field.id] as string || ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  />
                )}

                {field.type === 'long_text' && (
                  <textarea
                    className="f-textarea"
                    value={answers[field.id] as string || ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                    placeholder={`Masukkan ${field.label.toLowerCase()}`}
                  />
                )}

                {field.type === 'date' && (
                  <input
                    className="f-input"
                    type="date"
                    value={answers[field.id] as string || ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  />
                )}

                {field.type === 'dropdown' && field.options && (
                  <select
                    className="f-select"
                    value={answers[field.id] as string || ''}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  >
                    <option value="">-- Pilih opsi --</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                )}

                {field.type === 'radio' && field.options && (
                  <div className="options-list">
                    {field.options.map((opt) => (
                      <div
                        key={opt}
                        className={`option-row ${answers[field.id] === opt ? 'selected' : ''}`}
                        onClick={() => setValue(field.id, opt)}
                      >
                        <div className="option-circle">
                          {answers[field.id] === opt && <div className="option-inner" />}
                        </div>
                        <span className="option-text">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {field.type === 'checkbox' && field.options && (
                  <div className="options-list">
                    {field.options.map((opt) => {
                      const checked = (answers[field.id] as string[])?.includes(opt)
                      return (
                        <div
                          key={opt}
                          className={`option-row ${checked ? 'selected' : ''}`}
                          onClick={() => toggleCheckbox(field.id, opt)}
                        >
                          <div className="option-square">{checked ? '✓' : ''}</div>
                          <span className="option-text">{opt}</span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {field.type === 'entity' && (() => {
                  const sel = entitySelections[field.id] || { l1: '', l2: '', l3: '' }
                  const level2Options = sel.l1 ? getEntityChildren(sel.l1) : []
                  const level3Options = sel.l2 ? getEntityChildren(sel.l2) : []

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Level 1 */}
                      <div>
                        <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                          Entitas Utama
                        </p>
                        <select
                          className="f-select"
                          value={sel.l1}
                          onChange={(e) => setEntityLevel(field.id, 1, e.target.value)}
                        >
                          <option value="">-- Pilih entitas --</option>
                          {getEntityRoots().map((e) => (
                            <option key={e.id} value={e.id}>{e.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Level 2 — muncul setelah level 1 dipilih */}
                      {sel.l1 && level2Options.length > 0 && (
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                            Anak Perusahaan
                          </p>
                          <select
                            className="f-select"
                            value={sel.l2}
                            onChange={(e) => setEntityLevel(field.id, 2, e.target.value)}
                          >
                            <option value="">-- Pilih anak perusahaan --</option>
                            {level2Options.map((e) => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Level 3 — muncul setelah level 2 dipilih */}
                      {sel.l2 && level3Options.length > 0 && (
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                            Cabang/Unit
                          </p>
                          <select
                            className="f-select"
                            value={sel.l3}
                            onChange={(e) => setEntityLevel(field.id, 3, e.target.value)}
                          >
                            <option value="">-- Pilih cabang/unit --</option>
                            {level3Options.map((e) => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {errors[field.id] && (
                  <p className="field-error">⚠ {errors[field.id]}</p>
                )}
              </div>
            ))
          )}
        </div>

        <div className="bottom-nav">
          <button className="btn-back" onClick={() => router.push(`/survey/${surveyId}`)}>
            ← Kembali
          </button>
          <button className="btn-next" onClick={handleNext}>
            Lanjutkan <span>→</span>
          </button>
        </div>
      </div>
    </>
  )
}
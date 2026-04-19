'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface Question {
  id: string
  question_text: string
  type: 'short_text' | 'long_text' | 'radio' | 'checkbox' | 'rating' | 'dropdown' | 'date'
  options?: string[]
  rating_min?: number
  rating_max?: number
  question_order: number
}

export default function SurveyQuestionsPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.surveyId as string

  const [questions, setQuestions] = useState<Question[]>([])
  const [surveyTitle, setSurveyTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    // Cek apakah identitas sudah diisi
    const savedIdentity = sessionStorage.getItem(`survey_identity_${surveyId}`)
    if (!savedIdentity) {
      router.push(`/survey/${surveyId}/identity`)
      return
    }

    fetch(`/api/survey/${surveyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { router.push(`/survey/${surveyId}`); return }
        setSurveyTitle(d.survey.title)
        setQuestions(d.questions)
        const init: Record<string, string | string[]> = {}
        d.questions.forEach((q: Question) => {
          init[q.id] = q.type === 'checkbox' ? [] : ''
        })
        setAnswers(init)
      })
      .finally(() => setLoading(false))
  }, [surveyId])

  const setValue = (qId: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [qId]: value }))
    setErrors((prev) => { const n = { ...prev }; delete n[qId]; return n })
  }

  const toggleCheckbox = (qId: string, option: string) => {
    const current = (answers[qId] as string[]) || []
    setValue(
      qId,
      current.includes(option) ? current.filter((v) => v !== option) : [...current, option]
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    questions.forEach((q) => {
      const val = answers[q.id]
      const empty = Array.isArray(val) ? val.length === 0 : !val
      if (empty) errs[q.id] = 'Wajib diisi'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      // Scroll ke error pertama
      const firstErrorId = Object.keys(errors)[0] || Object.keys(
        questions.reduce((acc, q) => {
          const val = answers[q.id]
          const empty = Array.isArray(val) ? val.length === 0 : !val
          if (empty) acc[q.id] = true
          return acc
        }, {} as Record<string, boolean>)
      )[0]
      if (firstErrorId) {
        document.getElementById(`q-${firstErrorId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }

    const savedIdentity = sessionStorage.getItem(`survey_identity_${surveyId}`)
    if (!savedIdentity) { router.push(`/survey/${surveyId}/identity`); return }

    const identityAnswers = Object.entries(JSON.parse(savedIdentity)).map(([fieldId, value]) => ({
      fieldId, value,
    }))
    const questionAnswers = Object.entries(answers).map(([questionId, value]) => ({
      questionId, value,
    }))

    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch(`/api/survey/${surveyId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityAnswers, questionAnswers }),
      })
      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Gagal mengirim jawaban')
        setSubmitting(false)
        return
      }

      sessionStorage.removeItem(`survey_identity_${surveyId}`)
      router.push(`/survey/${surveyId}/done?rid=${data.responseId}`)
    } catch {
      setSubmitError('Terjadi kesalahan jaringan. Coba lagi.')
      setSubmitting(false)
    }
  }

  const answeredCount = questions.filter((q) => {
    const val = answers[q.id]
    return Array.isArray(val) ? val.length > 0 : !!val
  }).length

  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0

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

        .top-bar {
          background: linear-gradient(135deg, #0d1f3c, #1B6FA8);
          padding: 0 32px; height: 64px;
          display: flex; align-items: center; justify-content: space-between;
          position: sticky; top: 0; z-index: 100;
          box-shadow: 0 2px 16px rgba(13,31,60,.3);
        }
        .top-bar img { height: 36px; object-fit: contain; filter: brightness(0) invert(1); opacity: .9; }
        .top-survey-title { font-size: 13px; color: rgba(255,255,255,.7); font-weight: 500; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

        .progress-bar-wrap { background: #fff; border-bottom: 1px solid #e8edf4; padding: 12px 32px; }
        .progress-steps { display: flex; align-items: center; gap: 0; max-width: 560px; margin: 0 auto; }
        .step-item { display: flex; align-items: center; flex: 1; }
        .step-circle {
          width: 28px; height: 28px; border-radius: 50%; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
        }
        .step-circle.done { background: #1B6FA8; color: #fff; }
        .step-circle.active { background: #1B6FA8; color: #fff; box-shadow: 0 0 0 3px rgba(27,111,168,.2); }
        .step-circle.pending { background: #e8edf4; color: #94a3b8; }
        .step-label { font-size: 11px; font-weight: 600; margin-top: 4px; }
        .step-label.active { color: #1B6FA8; }
        .step-label.pending { color: #94a3b8; }
        .step-line { flex: 1; height: 2px; background: #e8edf4; margin: 0 6px; }
        .step-line.done { background: #1B6FA8; }
        .step-wrapper { display: flex; flex-direction: column; align-items: center; }

        /* Inline progress */
        .inline-progress { background: #fff; border-bottom: 1px solid #e8edf4; padding: 10px 32px; }
        .inline-progress-inner { max-width: 600px; margin: 0 auto; }
        .inline-progress-info { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .inline-progress-label { font-size: 12px; color: #64748b; font-weight: 500; }
        .inline-progress-pct { font-size: 12px; font-weight: 700; color: #1B6FA8; }
        .progress-track { height: 6px; background: #e8edf4; border-radius: 99px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #1B6FA8, #2C8FC3); border-radius: 99px; transition: width .4s ease; }

        .content { max-width: 600px; margin: 0 auto; padding: 32px 16px 100px; }

        .section-header { margin-bottom: 28px; }
        .section-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #1B6FA8; margin-bottom: 8px; }
        .section-title { font-size: 22px; font-weight: 700; color: #0d1f3c; margin-bottom: 6px; }
        .section-sub { font-size: 13px; color: #64748b; }

        .q-card {
          background: #fff; border-radius: 12px; border: 1px solid #e8edf4;
          padding: 22px 24px; margin-bottom: 16px;
          transition: border-color .2s, box-shadow .2s;
          scroll-margin-top: 160px;
        }
        .q-card.has-error { border-color: #fca5a5; }
        .q-card.answered { border-left: 3px solid #1B6FA8; }

        .q-number { font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; }
        .q-text { font-size: 15px; font-weight: 600; color: #0d1f3c; margin-bottom: 16px; line-height: 1.5; }

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
          width: 18px; height: 18px; border-radius: 50%; border: 2px solid #d1d5db; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; transition: all .15s;
        }
        .option-row.selected .option-circle { border-color: #1B6FA8; background: #1B6FA8; }
        .option-inner { width: 8px; height: 8px; border-radius: 50%; background: #fff; }
        .option-square {
          width: 18px; height: 18px; border-radius: 4px; border: 2px solid #d1d5db; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; transition: all .15s; font-size: 11px; color: transparent;
        }
        .option-row.selected .option-square { border-color: #1B6FA8; background: #1B6FA8; color: #fff; }
        .option-text { font-size: 14px; color: #374151; }
        .option-row.selected .option-text { color: #1B6FA8; font-weight: 600; }

        /* Rating dengan label */
        .rating-wrap { display: flex; flex-direction: column; gap: 8px; }
        .rating-row { display: flex; gap: 8px; flex-wrap: wrap; }
        .rating-labels { display: flex; justify-content: space-between; }
        .rating-label-text { font-size: 11px; color: #94a3b8; }
        .rating-btn {
          width: 44px; height: 44px; border-radius: 8px; border: 1.5px solid #dde3ec;
          background: #f8fafc; font-size: 14px; font-weight: 600; color: #64748b;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; transition: all .15s;
        }
        .rating-btn:hover { border-color: #1B6FA8; color: #1B6FA8; background: #EBF5FF; }
        .rating-btn.selected { border-color: #1B6FA8; background: #1B6FA8; color: #fff; }

        .q-error { font-size: 12px; color: #ef4444; margin-top: 8px; font-weight: 500; }

        .submit-error-box {
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px;
          padding: 14px 16px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; color: #dc2626; font-weight: 500;
        }

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
        .btn-submit {
          height: 44px; padding: 0 28px;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3); color: #fff;
          border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif; cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          display: flex; align-items: center; gap: 8px;
        }
        .btn-submit:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(27,111,168,.3); }
        .btn-submit:disabled { opacity: .55; cursor: not-allowed; }

        .loading-center { display: flex; justify-content: center; align-items: center; height: 200px; }
        .spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1B6FA8; border-radius: 50%; animation: spin .8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="page-root">
        <div className="top-bar">
          <img src="/white-logo.png" alt="PT Pelindo Daya Sejahtera" />
          <span className="top-survey-title">{surveyTitle}</span>
        </div>

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
                  <div className={`step-circle ${s.step < 2 ? 'done' : s.step === 2 ? 'active' : 'pending'}`}>
                    {s.step < 2 ? '✓' : s.step + 1}
                  </div>
                  <span className={`step-label ${s.step === 2 ? 'active' : s.step < 2 ? 'active' : 'pending'}`}>{s.label}</span>
                </div>
                {i < arr.length - 1 && <div className={`step-line ${s.step < 2 ? 'done' : ''}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Progress isi pertanyaan */}
        {!loading && questions.length > 0 && (
          <div className="inline-progress">
            <div className="inline-progress-inner">
              <div className="inline-progress-info">
                <span className="inline-progress-label">{answeredCount} dari {questions.length} pertanyaan terjawab</span>
                <span className="inline-progress-pct">{progress}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        )}

        <div className="content">
          <div className="section-header">
            <p className="section-eyebrow">Langkah 2 dari 2</p>
            <h2 className="section-title">Pertanyaan Survey</h2>
            <p className="section-sub">Jawab semua pertanyaan berikut dengan sejujurnya.</p>
          </div>

          {submitError && (
            <div className="submit-error-box">
              <span>⚠</span>
              <span>{submitError}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-center"><div className="spinner" /></div>
          ) : (
            questions.map((q, idx) => {
              const isAnswered = Array.isArray(answers[q.id]) ? (answers[q.id] as string[]).length > 0 : !!answers[q.id]
              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className={`q-card ${errors[q.id] ? 'has-error' : ''} ${isAnswered ? 'answered' : ''}`}
                >
                  <p className="q-number">Pertanyaan {idx + 1}</p>
                  <p className="q-text">{q.question_text}</p>

                  {q.type === 'short_text' && (
                    <input
                      className="f-input"
                      type="text"
                      value={answers[q.id] as string || ''}
                      onChange={(e) => setValue(q.id, e.target.value)}
                      placeholder="Tulis jawaban Anda..."
                    />
                  )}

                  {q.type === 'long_text' && (
                    <textarea
                      className="f-textarea"
                      value={answers[q.id] as string || ''}
                      onChange={(e) => setValue(q.id, e.target.value)}
                      placeholder="Tulis jawaban Anda..."
                    />
                  )}

                  {q.type === 'dropdown' && q.options && (
                    <select
                      className="f-select"
                      value={answers[q.id] as string || ''}
                      onChange={(e) => setValue(q.id, e.target.value)}
                    >
                      <option value="">-- Pilih jawaban --</option>
                      {q.options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  {q.type === 'radio' && q.options && (
                    <div className="options-list">
                      {q.options.map((opt) => (
                        <div
                          key={opt}
                          className={`option-row ${answers[q.id] === opt ? 'selected' : ''}`}
                          onClick={() => setValue(q.id, opt)}
                        >
                          <div className="option-circle">
                            {answers[q.id] === opt && <div className="option-inner" />}
                          </div>
                          <span className="option-text">{opt}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {q.type === 'checkbox' && q.options && (
                    <div className="options-list">
                      {q.options.map((opt) => {
                        const checked = (answers[q.id] as string[])?.includes(opt)
                        return (
                          <div
                            key={opt}
                            className={`option-row ${checked ? 'selected' : ''}`}
                            onClick={() => toggleCheckbox(q.id, opt)}
                          >
                            <div className="option-square">{checked ? '✓' : ''}</div>
                            <span className="option-text">{opt}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {q.type === 'date' && (
                    <input
                      className="f-input"
                      type="date"
                      value={answers[q.id] as string || ''}
                      onChange={(e) => setValue(q.id, e.target.value)}
                    />
                  )}

                  {q.type === 'rating' && (
                    <div className="rating-wrap">
                      <div className="rating-row">
                        {Array.from(
                          { length: (q.rating_max ?? 5) - (q.rating_min ?? 1) + 1 },
                          (_, i) => (q.rating_min ?? 1) + i
                        ).map((n) => (
                          <button
                            key={n}
                            className={`rating-btn ${answers[q.id] === String(n) ? 'selected' : ''}`}
                            onClick={() => setValue(q.id, String(n))}
                            type="button"
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="rating-labels">
                        <span className="rating-label-text">Sangat Tidak Puas</span>
                        <span className="rating-label-text">Sangat Puas</span>
                      </div>
                    </div>
                  )}

                  {errors[q.id] && <p className="q-error">⚠ {errors[q.id]}</p>}
                </div>
              )
            })
          )}
        </div>

        <div className="bottom-nav">
          <button className="btn-back" onClick={() => router.push(`/survey/${surveyId}/identity`)}>
            ← Kembali
          </button>
          <button className="btn-submit" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Mengirim...' : 'Kirim Jawaban ✓'}
          </button>
        </div>
      </div>
    </>
  )
}
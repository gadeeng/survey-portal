'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Survey {
  id: string
  title: string
  description: string
  status: 'draft' | 'active' | 'inactive'
  created_at: string
  published_at: string | null
}

interface User {
  id: string
  username: string
  role: string
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

  .dash-wrap * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }

  /* ── Header ── */
  .dash-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.25rem; gap: 12px; flex-wrap: wrap;
  }
  .dash-title { font-size: 20px; font-weight: 700; color: #0d1f3c; }

  .btn-primary {
    background: linear-gradient(135deg, #1B6FA8, #2C8FC3); border: none; border-radius: 8px;
    padding: 10px 16px; font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: opacity .2s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  }
  .btn-primary:hover { opacity: .9; }

  /* ── Search ── */
  .search-wrap { position: relative; margin-bottom: 1rem; }
  .search-input {
    width: 100%; background: #f8fafc; border: 1px solid #dde3ec; border-radius: 8px;
    padding: 10px 36px; font-size: 14px; color: #1a2332; outline: none;
    font-family: 'Plus Jakarta Sans', sans-serif; transition: border-color .2s, box-shadow .2s;
  }
  .search-input:focus { border-color: #1B6FA8; box-shadow: 0 0 0 3px rgba(27,111,168,0.12); }
  .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #94a3b8; pointer-events: none; }
  .search-clear {
    position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #94a3b8; font-size: 18px; cursor: pointer;
    line-height: 1; padding: 0;
  }
  .search-count { font-size: 12px; color: #94a3b8; margin-bottom: 10px; }

  /* ── Error ── */
  .error-msg {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
    padding: 10px 14px; font-size: 13px; color: #dc2626; font-weight: 500; margin-bottom: 1rem;
  }

  /* ── Loading / Empty ── */
  .dash-loading { color: #6b7280; font-size: 14px; padding: 1rem 0; }
  .dash-empty {
    background: #fff; border-radius: 12px; border: 1px solid #e5e9f0;
    padding: 4rem 1.5rem; text-align: center;
  }
  .dash-empty-icon {
    width: 52px; height: 52px; border-radius: 50%; background: #f0f7ff;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 12px; font-size: 22px;
  }
  .dash-empty-title { font-size: 15px; font-weight: 600; color: #0d1f3c; margin-bottom: 4px; }
  .dash-empty-sub { font-size: 13px; color: #8fa0b4; }

  /* ── Survey Card ── */
  .survey-card-wrap { position: relative; margin-bottom: .65rem; }
  .survey-card-wrap::before {
    content: ''; position: absolute; left: 0; top: 12px; bottom: 12px;
    width: 3px; border-radius: 0 3px 3px 0;
  }
  .survey-card-wrap.status-draft::before  { background: #eab308; }
  .survey-card-wrap.status-active::before { background: #22c55e; }
  .survey-card-wrap.status-inactive::before { background: #d1d5db; }

  .survey-card {
    background: #fff; border-radius: 12px; border: 1px solid #e5e9f0;
    padding: 1rem 1.25rem 1rem 1.75rem;
    transition: box-shadow .2s, border-color .2s;
  }
  .survey-card:hover { box-shadow: 0 4px 16px rgba(13,31,60,.07); border-color: #d0dff0; }

  /* Desktop: side-by-side */
  .survey-card-inner {
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  }
  .survey-card-left { flex: 1; min-width: 0; }
  .survey-card-top { display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap; }
  .survey-card-title { font-size: 14px; font-weight: 700; color: #0d1f3c; }
  .survey-card-desc { font-size: 12.5px; color: #6b7280; line-height: 1.5; margin-bottom: 6px; }
  .survey-card-meta { font-size: 11.5px; color: #a0aec0; }

  /* ── Badges ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10.5px; font-weight: 600; padding: 3px 9px; border-radius: 20px; flex-shrink: 0;
  }
  .badge-dot { width: 5px; height: 5px; border-radius: 50%; }
  .badge-draft    { background: #fefce8; color: #a16207; }
  .badge-draft .badge-dot    { background: #eab308; }
  .badge-active   { background: #dcfce7; color: #15803d; }
  .badge-active .badge-dot   { background: #22c55e; }
  .badge-inactive { background: #f3f4f6; color: #4b5563; }
  .badge-inactive .badge-dot { background: #9ca3af; }

  /* ── Action Buttons ── */
  .survey-actions {
    display: flex; gap: 6px; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end;
  }

  .btn-ghost {
    font-size: 12px; font-weight: 600; padding: 6px 11px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid #e5e9f0; background: #fff; color: #374151;
    text-decoration: none; display: inline-flex; align-items: center; transition: all .2s;
    white-space: nowrap;
  }
  .btn-ghost:hover { background: #f0f4f8; border-color: #b8d4e8; }

  .btn-publish {
    font-size: 12px; font-weight: 600; padding: 6px 11px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: none; background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff;
    display: inline-flex; align-items: center; transition: opacity .2s; white-space: nowrap;
  }
  .btn-publish:hover { opacity: .9; }

  .btn-deactivate {
    font-size: 12px; font-weight: 600; padding: 6px 11px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; transition: all .2s; white-space: nowrap;
  }
  .btn-deactivate:hover { background: #fee2e2; }

  .btn-delete {
    font-size: 12px; font-weight: 600; padding: 6px 11px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid #fecaca; background: #fff; color: #dc2626; transition: all .2s; white-space: nowrap;
  }
  .btn-delete:hover { background: #fef2f2; }

  /* ── Mobile: actions stacked below card content ── */
  @media (max-width: 639px) {
    .survey-card-inner { flex-direction: column; gap: .65rem; }
    .survey-actions { justify-content: flex-start; width: 100%; }
    .survey-actions a,
    .survey-actions button { flex: 1; justify-content: center; font-size: 12px; padding: 8px 6px; }
    .survey-card { padding: .875rem 1rem .875rem 1.5rem; }
    .dash-title { font-size: 17px; }
    .btn-primary { padding: 9px 13px; font-size: 12px; }
  }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 16px;
  }
  .modal-box {
    background: #fff; border-radius: 16px; padding: 1.75rem;
    width: 100%; max-width: 380px; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: slideUp 0.2s ease;
  }

  /* Mobile: bottom sheet style */
  @media (max-width: 639px) {
    .modal-overlay { align-items: flex-end; padding: 0; }
    .modal-box {
      border-radius: 20px 20px 0 0; max-width: 100%; width: 100%;
      padding: 1.25rem 1.25rem 2rem;
      animation: slideUpSheet 0.25s ease;
    }
    /* Handle bar */
    .modal-box::before {
      content: ''; display: block; width: 40px; height: 4px;
      background: #e5e7eb; border-radius: 2px; margin: 0 auto 1.25rem;
    }
  }

  .modal-icon {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto .875rem; font-size: 24px;
  }
  .modal-icon-publish    { background: #dcfce7; }
  .modal-icon-deactivate { background: #fef9c3; }
  .modal-icon-delete     { background: #fee2e2; }

  .modal-title { font-size: 15px; font-weight: 700; color: #0d1f3c; margin: 0 0 5px; }
  .modal-survey-name {
    font-size: 12.5px; font-weight: 600; color: #1B6FA8;
    background: #f0f7ff; border-radius: 6px; padding: 5px 10px;
    margin: 0 0 8px; display: inline-block; max-width: 100%; word-break: break-word;
  }
  .modal-desc { font-size: 12.5px; color: #6b7280; margin: 0 0 1.25rem; line-height: 1.6; }
  .modal-actions { display: flex; gap: 8px; }

  .btn-modal-cancel {
    flex: 1; padding: 10px; border-radius: 8px;
    border: 1px solid #e5e7eb; background: #f9fafb; color: #374151;
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500; cursor: pointer;
  }
  .btn-modal-publish {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff;
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; cursor: pointer;
  }
  .btn-modal-deactivate {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: #f59e0b; color: #fff;
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; cursor: pointer;
  }
  .btn-modal-delete {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: #dc2626; color: #fff;
    font-size: 13px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; cursor: pointer;
  }

  /* ── Publish Success Modal ── */
  .modal-box-success {
    background: #fff; border-radius: 20px; padding: 2rem 1.75rem;
    width: 100%; max-width: 420px; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: slideUp 0.25s cubic-bezier(.34,1.56,.64,1);
  }
  @media (max-width: 639px) {
    .modal-overlay-success { align-items: flex-end; padding: 0; }
    .modal-box-success {
      border-radius: 20px 20px 0 0; max-width: 100%;
      padding: 1.25rem 1.25rem 2rem;
      animation: slideUpSheet 0.25s ease;
    }
    .modal-box-success::before {
      content: ''; display: block; width: 40px; height: 4px;
      background: #e5e7eb; border-radius: 2px; margin: 0 auto 1.25rem;
    }
  }

  .modal-check {
    width: 64px; height: 64px; border-radius: 50%;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; font-size: 28px; color: #fff;
    animation: checkPop .45s .1s cubic-bezier(.34,1.56,.64,1) both;
  }

  .share-box {
    background: #f0f7ff; border: 1.5px solid #bfdbfe; border-radius: 10px;
    padding: 10px 12px; margin-bottom: 1rem; text-align: left;
  }
  .share-box-label {
    font-size: 10px; font-weight: 700; color: #1B6FA8;
    letter-spacing: 1px; text-transform: uppercase; margin-bottom: 7px;
  }
  .share-box-row { display: flex; gap: 7px; align-items: center; }
  .share-box-input {
    flex: 1; font-size: 12px; color: #1a2332; background: #fff;
    border: 1px solid #dde3ec; border-radius: 7px; padding: 7px 10px;
    outline: none; font-family: 'Plus Jakarta Sans', sans-serif;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
  }
  .share-box-btn {
    flex-shrink: 0; padding: 7px 13px; border-radius: 7px; border: none;
    font-size: 12px; font-weight: 600; cursor: pointer; color: #fff;
    font-family: 'Plus Jakarta Sans', sans-serif; white-space: nowrap; transition: opacity .2s;
  }
  .share-box-btn:hover { opacity: .9; }
  .btn-modal-close {
    width: 100%; padding: 11px 0; border: none; border-radius: 10px;
    background: linear-gradient(135deg, #16a34a, #22c55e);
    font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
  }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideUpSheet {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0); }
    70%  { transform: scale(1.18); }
    100% { transform: scale(1); }
  }
`

const STATUS_MAP = {
  draft: { label: 'Draft', cls: 'badge-draft' },
  active: { label: 'Aktif', cls: 'badge-active' },
  inactive: { label: 'Nonaktif', cls: 'badge-inactive' },
}

type ModalState =
  | { type: 'publish'; id: string; title: string }
  | { type: 'deactivate'; id: string; title: string }
  | { type: 'delete'; id: string; title: string }
  | null

function ShareLinkBox({ surveyId }: { surveyId: string }) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/survey/${surveyId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="share-box">
      <p className="share-box-label">🔗 Link Survey</p>
      <div className="share-box-row">
        <input
          readOnly value={url}
          className="share-box-input"
          onFocus={(e) => e.target.select()}
        />
        <button
          onClick={handleCopy}
          className="share-box-btn"
          style={{
            background: copied
              ? 'linear-gradient(135deg, #16a34a, #22c55e)'
              : 'linear-gradient(135deg, #1B6FA8, #2C8FC3)',
          }}
        >
          {copied ? '✓ Tersalin!' : 'Salin'}
        </button>
      </div>
    </div>
  )
}

export default function MasterDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [modal, setModal] = useState<ModalState>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [publishedSurvey, setPublishedSurvey] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => d && setUser(d.user))
    fetchSurveys()
  }, [])

  const fetchSurveys = async () => {
    const res = await fetch('/api/master/surveys')
    const data = await res.json()
    setSurveys(data.surveys || [])
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!modal || modal.type !== 'publish') return
    const { id, title } = modal
    await fetch(`/api/master/surveys/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    setModal(null)
    setPublishedSurvey({ id, title })
    fetchSurveys()
  }

  const handleDeactivate = async () => {
    if (!modal || modal.type !== 'deactivate') return
    await fetch(`/api/master/surveys/${modal.id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'inactive' }),
    })
    setModal(null)
    fetchSurveys()
  }

  const handleDelete = async () => {
    if (!modal || modal.type !== 'delete') return
    setDeleteError('')
    const res = await fetch(`/api/master/surveys/${modal.id}`, { method: 'DELETE' })
    const data = await res.json()
    setModal(null)
    if (!res.ok) { setDeleteError(data.error); return }
    fetchSurveys()
  }

  const handleCopyLink = (surveyId: string) => {
    const url = `${window.location.origin}/survey/${surveyId}`
    navigator.clipboard.writeText(url)
    setCopiedId(surveyId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filtered = surveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="dash-wrap">
      <style>{styles}</style>

      {/* Header */}
      <div className="dash-header">
        <h2 className="dash-title">Dashboard Survey</h2>
        <Link href="/master/survey/new" className="btn-primary">
          + Buat Survey Baru
        </Link>
      </div>

      {deleteError && <div className="error-msg">{deleteError}</div>}

      {/* Search */}
      {!loading && surveys.length > 0 && (
        <div className="search-wrap">
          <svg className="search-icon" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari survey..."
            className="search-input"
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>×</button>
          )}
        </div>
      )}

      {/* States */}
      {loading ? (
        <p className="dash-loading">Memuat data...</p>
      ) : surveys.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">📋</div>
          <p className="dash-empty-title">Belum ada survey</p>
          <p className="dash-empty-sub">Klik "Buat Survey Baru" untuk memulai</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">🔍</div>
          <p className="dash-empty-title">Tidak ada hasil</p>
          <p className="dash-empty-sub">Tidak ada survey yang cocok dengan "<strong>{search}</strong>"</p>
        </div>
      ) : (
        <div>
          {search && (
            <p className="search-count">Menampilkan {filtered.length} dari {surveys.length} survey</p>
          )}
          {filtered.map((survey) => {
            const st = STATUS_MAP[survey.status]
            return (
              <div key={survey.id} className={`survey-card-wrap status-${survey.status}`}>
                <div className="survey-card">
                  <div className="survey-card-inner">
                    {/* Left / Content */}
                    <div className="survey-card-left">
                      <div className="survey-card-top">
                        <span className="survey-card-title">{survey.title}</span>
                        <span className={`badge ${st.cls}`}>
                          <span className="badge-dot" />{st.label}
                        </span>
                      </div>
                      <p className="survey-card-desc">
                        {survey.description || 'Tidak ada deskripsi'}
                      </p>
                      <p className="survey-card-meta">
                        Dibuat: {new Date(survey.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        {survey.published_at && (
                          <> · Dipublikasi: {new Date(survey.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="survey-actions">
                      {survey.status === 'draft' && (
                        <>
                          <Link href={`/master/survey/${survey.id}/edit`} className="btn-ghost">Edit</Link>
                          <button className="btn-publish" onClick={() => setModal({ type: 'publish', id: survey.id, title: survey.title })}>
                            Publish
                          </button>
                        </>
                      )}
                      {survey.status === 'active' && (
                        <>
                          <button className="btn-ghost" onClick={() => handleCopyLink(survey.id)}>
                            {copiedId === survey.id ? '✓ Tersalin!' : '🔗 Salin Link'}
                          </button>
                          <Link href={`/master/results/${survey.id}`} className="btn-ghost">Lihat Hasil</Link>
                          <button className="btn-deactivate" onClick={() => setModal({ type: 'deactivate', id: survey.id, title: survey.title })}>
                            Nonaktifkan
                          </button>
                        </>
                      )}
                      {survey.status === 'inactive' && (
                        <Link href={`/master/results/${survey.id}`} className="btn-ghost">Lihat Hasil</Link>
                      )}
                      {user?.role === 'super_admin' && (
                        <button className="btn-delete" onClick={() => setModal({ type: 'delete', id: survey.id, title: survey.title })}>
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Publish Modal */}
      {modal?.type === 'publish' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-publish">📢</div>
            <p className="modal-title">Publikasikan Survey?</p>
            <p className="modal-survey-name">{modal.title}</p>
            <p className="modal-desc">Survey ini akan dipublikasikan dan dapat diakses oleh responden.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-modal-publish" onClick={handlePublish}>Ya, Publikasikan</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {modal?.type === 'deactivate' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-deactivate">⏸️</div>
            <p className="modal-title">Nonaktifkan Survey?</p>
            <p className="modal-survey-name">{modal.title}</p>
            <p className="modal-desc">Survey ini tidak akan bisa diakses oleh responden.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-modal-deactivate" onClick={handleDeactivate}>Ya, Nonaktifkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-delete">🗑️</div>
            <p className="modal-title">Hapus Survey?</p>
            <p className="modal-survey-name">{modal.title}</p>
            <p className="modal-desc">Survey akan dihapus permanen beserta seluruh datanya.</p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-modal-delete" onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Success Modal */}
      {publishedSurvey && (
        <div className="modal-overlay modal-overlay-success">
          <div className="modal-box-success">
            <div className="modal-check">✓</div>
            <p className="modal-title" style={{ fontSize: 17, marginBottom: 8 }}>Survey Berhasil Dipublikasikan!</p>
            <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: '1rem', lineHeight: 1.6 }}>
              Survey <strong style={{ color: '#0d1f3c' }}>"{publishedSurvey.title}"</strong> sudah aktif.
            </p>
            <ShareLinkBox surveyId={publishedSurvey.id} />
            <button className="btn-modal-close" onClick={() => setPublishedSurvey(null)}>Tutup</button>
          </div>
        </div>
      )}
    </div>
  )
}
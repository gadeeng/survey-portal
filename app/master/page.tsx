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

  .dash-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;
  }
  .dash-title { font-size: 22px; font-weight: 700; color: #0d1f3c; }

  .btn-primary {
    background: linear-gradient(135deg, #1B6FA8, #2C8FC3); border: none; border-radius: 8px;
    padding: 10px 18px; font-size: 13px; font-weight: 600; color: #fff;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    transition: opacity .2s; text-decoration: none;
    display: inline-flex; align-items: center; gap: 6px;
  }
  .btn-primary:hover { opacity: .9; }

  /* Error */
  .error-msg {
    background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
    padding: 10px 14px; font-size: 13px; color: #dc2626; font-weight: 500; margin-bottom: 1rem;
  }

  /* Loading / empty */
  .dash-loading { color: #6b7280; font-size: 14px; padding: 1rem 0; }
  .dash-empty {
    background: #fff; border-radius: 12px; border: 1px solid #e5e9f0;
    padding: 5rem 2rem; text-align: center;
  }
  .dash-empty-icon {
    width: 56px; height: 56px; border-radius: 50%; background: #f0f7ff;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 14px; font-size: 24px;
  }
  .dash-empty-title { font-size: 15px; font-weight: 600; color: #0d1f3c; margin-bottom: 4px; }
  .dash-empty-sub { font-size: 13px; color: #8fa0b4; }

  /* Survey card */
  .survey-card {
    background: #fff; border-radius: 12px; border: 1px solid #e5e9f0;
    padding: 1.25rem 1.5rem; margin-bottom: .75rem;
    transition: box-shadow .2s, border-color .2s;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  }
  .survey-card:hover { box-shadow: 0 4px 16px rgba(13,31,60,.07); border-color: #d0dff0; }

  .survey-card-left { flex: 1; min-width: 0; }
  .survey-card-top { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
  .survey-card-title { font-size: 15px; font-weight: 700; color: #0d1f3c; }
  .survey-card-desc { font-size: 13px; color: #6b7280; line-height: 1.5; margin-bottom: 8px; }
  .survey-card-meta { font-size: 12px; color: #a0aec0; }

  /* Status badges */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; flex-shrink: 0;
  }
  .badge-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .badge-draft { background: #fefce8; color: #a16207; }
  .badge-draft .badge-dot { background: #eab308; }
  .badge-active { background: #dcfce7; color: #15803d; }
  .badge-active .badge-dot { background: #22c55e; }
  .badge-inactive { background: #f3f4f6; color: #4b5563; }
  .badge-inactive .badge-dot { background: #9ca3af; }

  /* Action buttons */
  .survey-actions { display: flex; gap: 6px; align-items: center; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end; }

  .btn-ghost {
    font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid #e5e9f0; background: #fff; color: #374151;
    text-decoration: none; display: inline-flex; align-items: center; transition: all .2s;
  }
  .btn-ghost:hover { background: #f0f4f8; border-color: #b8d4e8; }

  .btn-publish {
    font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: none; background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff;
    display: inline-flex; align-items: center; transition: opacity .2s;
  }
  .btn-publish:hover { opacity: .9; }

  .btn-deactivate {
    font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid #fecaca; background: #fef2f2; color: #dc2626; transition: all .2s;
  }
  .btn-deactivate:hover { background: #fee2e2; }

  .btn-delete {
    font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 6px;
    cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
    border: 1px solid #fecaca; background: #fff; color: #dc2626; transition: all .2s;
  }
  .btn-delete:hover { background: #fef2f2; }

  /* Left accent bar per status */
  .survey-card-wrap { position: relative; }
  .survey-card-wrap::before {
    content: ''; position: absolute; left: 0; top: 12px; bottom: 12px;
    width: 3px; border-radius: 0 3px 3px 0;
  }
  .survey-card-wrap.status-draft::before { background: #eab308; }
  .survey-card-wrap.status-active::before { background: #22c55e; }
  .survey-card-wrap.status-inactive::before { background: #d1d5db; }
  .survey-card-wrap .survey-card { padding-left: 1.75rem; }

  /* Modal */
  .modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; animation: fadeIn 0.15s ease;
  }
  .modal-box {
    background: #fff; border-radius: 16px; padding: 2rem;
    width: 380px; text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
    animation: slideUp 0.2s ease;
  }
  .modal-icon {
    width: 56px; height: 56px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1rem; font-size: 26px;
  }
  .modal-icon-publish    { background: #dcfce7; }
  .modal-icon-deactivate { background: #fef9c3; }
  .modal-icon-delete     { background: #fee2e2; }
  .modal-title { font-size: 16px; font-weight: 700; color: #0d1f3c; margin: 0 0 6px; }
  .modal-survey-name {
    font-size: 13px; font-weight: 600; color: #1B6FA8;
    background: #f0f7ff; border-radius: 6px; padding: 6px 12px;
    margin: 0 0 8px; display: inline-block;
  }
  .modal-desc { font-size: 13px; color: #6b7280; margin: 0 0 1.5rem; line-height: 1.6; }
  .modal-actions { display: flex; gap: 10px; }

  .btn-modal-cancel {
    flex: 1; padding: 10px; border-radius: 8px;
    border: 1px solid #e5e7eb; background: #f9fafb; color: #374151;
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 500; cursor: pointer; transition: background .15s;
  }
  .btn-modal-cancel:hover { background: #f3f4f6; }

  .btn-modal-publish {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: linear-gradient(135deg, #16a34a, #22c55e); color: #fff;
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; cursor: pointer; transition: opacity .15s;
  }
  .btn-modal-publish:hover { opacity: .9; }

  .btn-modal-deactivate {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: #f59e0b; color: #fff;
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; cursor: pointer; transition: background .15s;
  }
  .btn-modal-deactivate:hover { background: #d97706; }

  .btn-modal-delete {
    flex: 1; padding: 10px; border-radius: 8px; border: none;
    background: #dc2626; color: #fff;
    font-size: 14px; font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 600; cursor: pointer; transition: background .15s;
  }
  .btn-modal-delete:hover { background: #b91c1c; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`

const STATUS_MAP = {
  draft:    { label: 'Draft',    cls: 'badge-draft' },
  active:   { label: 'Aktif',    cls: 'badge-active' },
  inactive: { label: 'Nonaktif', cls: 'badge-inactive' },
}

type ModalState =
  | { type: 'publish';    id: string; title: string }
  | { type: 'deactivate'; id: string; title: string }
  | { type: 'delete';     id: string; title: string }
  | null

export default function MasterDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [modal, setModal] = useState<ModalState>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    }
    fetchUser()
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
    await fetch(`/api/master/surveys/${modal.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    })
    setModal(null)
    fetchSurveys()
  }

  const handleDeactivate = async () => {
    if (!modal || modal.type !== 'deactivate') return
    await fetch(`/api/master/surveys/${modal.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
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

      {/* States */}
      {loading ? (
        <p className="dash-loading">Memuat data...</p>
      ) : surveys.length === 0 ? (
        <div className="dash-empty">
          <div className="dash-empty-icon">📋</div>
          <p className="dash-empty-title">Belum ada survey</p>
          <p className="dash-empty-sub">Klik "Buat Survey Baru" untuk memulai</p>
        </div>
      ) : (
        <div>
          {surveys.map((survey) => {
            const st = STATUS_MAP[survey.status]
            return (
              <div key={survey.id} className={`survey-card-wrap status-${survey.status}`}>
                <div className="survey-card">
                  {/* Left: info */}
                  <div className="survey-card-left">
                    <div className="survey-card-top">
                      <span className="survey-card-title">{survey.title}</span>
                      <span className={`badge ${st.cls}`}>
                        <span className="badge-dot" />
                        {st.label}
                      </span>
                    </div>
                    <p className="survey-card-desc">
                      {survey.description || 'Tidak ada deskripsi'}
                    </p>
                    <p className="survey-card-meta">
                      Dibuat: {new Date(survey.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                      {survey.published_at && (
                        <> &nbsp;·&nbsp; Dipublikasi: {new Date(survey.published_at).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric',
                        })}</>
                      )}
                    </p>
                  </div>

                  {/* Right: actions */}
                  <div className="survey-actions">
                    {survey.status === 'draft' && (
                      <>
                        <Link href={`/master/survey/${survey.id}/edit`} className="btn-ghost">
                          Edit
                        </Link>
                        <button
                          className="btn-publish"
                          onClick={() => setModal({ type: 'publish', id: survey.id, title: survey.title })}
                        >
                          Publish
                        </button>
                      </>
                    )}
                    {survey.status === 'active' && (
                      <>
                        <Link href={`/master/results/${survey.id}`} className="btn-ghost">
                          Lihat Hasil
                        </Link>
                        <button
                          className="btn-deactivate"
                          onClick={() => setModal({ type: 'deactivate', id: survey.id, title: survey.title })}
                        >
                          Nonaktifkan
                        </button>
                      </>
                    )}
                    {survey.status === 'inactive' && (
                      <Link href={`/master/results/${survey.id}`} className="btn-ghost">
                        Lihat Hasil
                      </Link>
                    )}
                    {user?.role === 'super_admin' && (
                      <button
                        className="btn-delete"
                        onClick={() => setModal({ type: 'delete', id: survey.id, title: survey.title })}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {modal?.type === 'publish' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-publish">📢</div>
            <p className="modal-title">Publikasikan Survey?</p>
            <p className="modal-survey-name">{modal.title}</p>
            <p className="modal-desc">
              Survey ini akan dipublikasikan dan dapat diakses oleh responden.
              Tindakan ini tidak dapat dibatalkan secara langsung.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-modal-publish" onClick={handlePublish}>Ya, Publikasikan</button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {modal?.type === 'deactivate' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-deactivate">⏸️</div>
            <p className="modal-title">Nonaktifkan Survey?</p>
            <p className="modal-survey-name">{modal.title}</p>
            <p className="modal-desc">
              Survey ini akan dinonaktifkan dan tidak dapat diakses oleh responden.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-modal-deactivate" onClick={handleDeactivate}>Ya, Nonaktifkan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modal?.type === 'delete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon modal-icon-delete">🗑️</div>
            <p className="modal-title">Hapus Survey?</p>
            <p className="modal-survey-name">{modal.title}</p>
            <p className="modal-desc">
              Survey ini akan dihapus secara permanen beserta seluruh datanya.
              Tindakan ini tidak dapat dikembalikan.
            </p>
            <div className="modal-actions">
              <button className="btn-modal-cancel" onClick={() => setModal(null)}>Batal</button>
              <button className="btn-modal-delete" onClick={handleDelete}>Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

interface SurveyData {
  survey: {
    id: string
    title: string
    description: string
    status: string
    published_at: string
  }
  userFields: any[]
  questions: any[]
}

export default function SurveyIntroPage() {
  const params = useParams()
  const router = useRouter()
  const surveyId = params.surveyId as string

  const [data, setData] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/survey/${surveyId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Gagal memuat survey'))
      .finally(() => setLoading(false))
  }, [surveyId])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .survey-root {
          min-height: 100vh;
          min-height: 100dvh; /* dynamic viewport height for mobile browsers */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(180deg, rgba(13, 31, 60, 0.82) 0%, rgba(27, 111, 168, 0.82) 100%), url('/bg_pds.jpeg') no-repeat center center;
          background-size: cover;
          position: relative;
          overflow: hidden;
          padding: 24px 16px;
          padding-top: 80px; /* room for logo on mobile */
        }
        .survey-root::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 52px 52px; pointer-events: none; z-index: 0;
        }

        /* Stars */
        .star {
          position: absolute; border-radius: 50%;
          background: #ffffff; pointer-events: none;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }

        /* Waves */
        .wave-wrap {
          position: absolute; left: 0; width: 200%;
          pointer-events: none; z-index: 1;
        }
        .wave-wrap svg { width: 100%; height: 100%; }
        .wave-back  { bottom: 22px; height: 90px; animation: waveR 14s linear infinite; }
        .wave-mid   { bottom: 10px; height: 90px; animation: waveL 10s linear infinite; }
        .wave-front { bottom: 0;    height: 90px; animation: waveR  7s linear infinite; }
        @keyframes waveL { 0%{ transform:translateX(-50%) } 100%{ transform:translateX(0) } }
        @keyframes waveR { 0%{ transform:translateX(0) }   100%{ transform:translateX(-50%) } }

        /* Logo — Pelindo kiri & Danantara kanan pada mobile,
           centered berdampingan pada tablet, kiri pada desktop */
        .logo-wrap {
          position: absolute;
          top: 16px;
          left: 0;
          right: 0;
          width: 100%;
          padding: 0 20px;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: space-between; /* kiri & kanan pada mobile */
          transition: all 0.3s ease;
        }
        .logo-wrap img.pelindo-logo {
          filter: brightness(0) invert(1);
          opacity: .88;
          height: 32px;
          width: auto;
          object-fit: contain;
        }
        .logo-wrap img.danantara-logo {
          filter: none;
          opacity: 1;
          height: 80px;
        }
        .logo-divider {
          display: none; /* disembunyikan pada mobile */
          width: 1px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.4);
          transition: all 0.3s ease;
        }

        /* Card */
        .card {
          position: relative; z-index: 10;
          background: #ffffff; border-radius: 16px;
          padding: 28px 20px; /* tighter on mobile */
          width: 100%; max-width: 480px;
          box-shadow: 0 24px 64px rgba(13,31,60,.35), 0 4px 16px rgba(13,31,60,.2);
        }

        /* Badge */
        .badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: #EBF5FF; color: #1B6FA8;
          border-radius: 20px; padding: 4px 12px;
          font-size: 11px; font-weight: 600; letter-spacing: 1.2px;
          text-transform: uppercase; margin-bottom: 14px;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #1B6FA8; }

        .survey-title {
          font-size: 22px; font-weight: 700; color: #0d1f3c;
          line-height: 1.28; margin-bottom: 10px;
        }
        .survey-desc {
          font-size: 13.5px; color: #64748b; line-height: 1.7;
          margin-bottom: 24px;
          white-space: pre-line;
        }

        /* CTA Button */
        .start-btn {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3);
          color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: opacity .2s, transform .15s, box-shadow .2s;
          letter-spacing: .3px; display: flex; align-items: center; justify-content: center; gap: 8px;
          /* Prevent iOS tap-delay and improve touch feedback */
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .start-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(27,111,168,.35); }
        .start-btn:active { transform: scale(0.98); opacity: .85; }

        /* Footer */
        .card-footer {
          margin-top: 20px; padding-top: 16px;
          border-top: 1px solid #f0f4f8;
          text-align: center; font-size: 11px; color: #b0bec5;
        }

        /* Error state */
        .error-state { text-align: center; padding: 16px 0; }
        .error-icon { font-size: 36px; margin-bottom: 10px; }
        .error-title { font-size: 17px; font-weight: 700; color: #0d1f3c; margin-bottom: 6px; }
        .error-desc { font-size: 13px; color: #94a3b8; }

        /* Loading */
        .loading-wrap { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 20px 0; }
        .spinner {
          width: 34px; height: 34px; border: 3px solid #e2e8f0;
          border-top-color: #1B6FA8; border-radius: 50%;
          animation: spin .8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-size: 13px; color: #94a3b8; }

        /* ─── Tablet & Desktop ─── */
        @media (min-width: 600px) {
          .survey-root {
            padding: 32px 16px;
            padding-top: 88px; /* room for centered logo on tablet */
          }

          .logo-wrap {
            top: 24px;
            left: 50%;
            right: auto;
            width: auto;
            padding: 0;
            transform: translateX(-50%);
            justify-content: center;
            gap: 16px;
          }
          .logo-wrap img.danantara-logo { height: 72px; }
          .logo-divider { display: block; height: 24px; }

          .card {
            padding: 48px 44px;
          }

          .survey-title { font-size: 26px; margin-bottom: 12px; }
          .survey-desc  { font-size: 14px; margin-bottom: 32px; }

          .badge { margin-bottom: 20px; }
          .card-footer { margin-top: 24px; padding-top: 18px; font-size: 12px; }
        }

        @media (min-width: 1024px) {
          .survey-root {
            padding-top: 32px; /* logo floats top-left, no extra push needed */
          }

          .logo-wrap {
            top: 36px;
            left: 48px;
            right: auto;
            width: auto;
            padding: 0;
            transform: none;
            justify-content: flex-start;
            gap: 20px;
          }
          .logo-wrap img.danantara-logo { height: 88px; }
          .logo-divider { display: block; height: 30px; }
        }

        /* Landscape phones — constrain vertical space */
        @media (max-height: 600px) and (max-width: 900px) {
          .survey-root { padding-top: 16px; justify-content: flex-start; overflow-y: auto; }
          .logo-wrap { display: none; }
          .wave-back, .wave-mid, .wave-front { display: none; }
          .card { padding: 20px 18px; }
          .badge { margin-bottom: 10px; }
          .survey-title { font-size: 19px; margin-bottom: 8px; }
          .survey-desc  { margin-bottom: 16px; }
        }
      `}</style>

      <div className="survey-root">
        {/* Stars */}
        {[
          { top: '7%', left: '10%', size: 2, delay: '0s' },
          { top: '5%', left: '25%', size: 2, delay: '.7s' },
          { top: '11%', left: '42%', size: 3, delay: '1.3s' },
          { top: '4%', left: '60%', size: 2, delay: '.2s' },
          { top: '9%', left: '75%', size: 2, delay: '1.8s' },
          { top: '6%', left: '88%', size: 3, delay: '.5s' },
          { top: '17%', left: '18%', size: 2, delay: '2s' },
          { top: '14%', left: '53%', size: 2, delay: '1s' },
        ].map((s, i) => (
          <div key={i} className="star" style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }} />
        ))}

        {/* Waves */}
        <div className="wave-wrap wave-back">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C180,20 360,70 540,45 C720,20 900,70 1080,45 C1260,20 1440,60 1440,45 L1440,90 L0,90 Z" fill="#1B6FA8" opacity=".35" />
          </svg>
        </div>
        <div className="wave-wrap wave-mid">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,50 C240,22 480,78 720,50 C960,22 1200,72 1440,50 L1440,90 L0,90 Z" fill="#1565a0" opacity=".55" />
          </svg>
        </div>
        <div className="wave-wrap wave-front">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,40 C200,10 400,72 600,40 C800,10 1000,68 1200,40 C1320,24 1380,52 1440,40 L1440,90 L0,90 Z" fill="#0d4f7a" />
          </svg>
        </div>

        {/* Logo */}
        <div className="logo-wrap">
          <img src="/white-logo.png" alt="PT Pelindo Daya Sejahtera" className="pelindo-logo" />
          <div className="logo-divider" />
          <img src="/logo_putih.png" alt="Danantara Indonesia" className="danantara-logo" />
        </div>

        {/* Card */}
        <div className="card">
          {loading ? (
            <div className="loading-wrap">
              <div className="spinner" />
              <p className="loading-text">Memuat survey...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚓</div>
              <p className="error-title">Survey Tidak Tersedia</p>
              <p className="error-desc">{error}</p>
            </div>
          ) : data ? (
            <>
              <div className="badge">
                <span className="badge-dot" />
                Survey Aktif
              </div>
              <h1 className="survey-title">{data.survey.title}</h1>
              {data.survey.description && (
                <p className="survey-desc">{data.survey.description}</p>
              )}

              <button
                className="start-btn"
                onClick={() => router.push(`/survey/${surveyId}/identity`)}
              >
                <span>Mulai Mengisi Survey</span>
                <span>→</span>
              </button>
            </>
          ) : null}

          <div className="card-footer">© 2026 PT Pelindo Daya Sejahtera</div>
        </div>
      </div>
    </>
  )
}
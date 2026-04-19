'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

const StarField = () => {
  const stars = [
    { top: '7%', left: '10%', size: 2, delay: '0s' },
    { top: '5%', left: '25%', size: 2, delay: '.7s' },
    { top: '11%', left: '42%', size: 3, delay: '1.3s' },
    { top: '4%', left: '60%', size: 2, delay: '.2s' },
    { top: '9%', left: '75%', size: 2, delay: '1.8s' },
    { top: '6%', left: '88%', size: 3, delay: '.5s' },
    { top: '17%', left: '18%', size: 2, delay: '2s' },
    { top: '14%', left: '53%', size: 2, delay: '1s' },
    { top: '19%', left: '70%', size: 2, delay: '.4s' },
    { top: '3%', left: '36%', size: 2, delay: '1.6s' },
    { top: '13%', left: '82%', size: 3, delay: '2.3s' },
  ]

  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}
    </>
  )
}

const Buoy = ({ left, colorTop, colorBody, animationDuration, animationDelay }: {
  left: string
  colorTop: string
  colorBody: string
  animationDuration: string
  animationDelay?: string
}) => (
  <div
    className="buoy"
    style={{
      bottom: 72,
      left,
      animationDuration,
      animationDelay: animationDelay || '0s',
    }}
  >
    <svg width="14" height="30" viewBox="0 0 14 30">
      <rect x="5" y="0" width="4" height="2" rx="1" fill={colorTop} />
      <ellipse cx="7" cy="17" rx="6" ry="9" fill={colorBody} />
      <rect x="4" y="9" width="6" height="3" fill="#f9fafb" opacity=".75" />
      <rect x="4" y="15" width="6" height="3" fill={colorBody === '#dc2626' ? '#b91c1c' : '#15803d'} />
      <rect x="6" y="26" width="2" height="4" fill="#6b7280" />
    </svg>
  </div>
)

const Ship = () => (
  <div className="ship-wrap">
    <svg width="300" height="112" viewBox="0 0 300 112">
      {/* Hull */}
      <polygon points="18,72 282,72 262,94 38,94" fill="#1e3a5f" />
      <rect x="38" y="94" width="224" height="12" rx="6" fill="#163152" />
      {/* Superstructure */}
      <rect x="84" y="28" width="132" height="44" rx="3" fill="#1e4976" />
      <rect x="96" y="16" width="88" height="14" rx="2" fill="#245a8a" />
      {/* Windows */}
      {[88, 112, 136, 160, 184, 200].map((x, i) => (
        <rect key={i} x={x} y="34" width="16" height="12" rx="1" fill="#A9D6E5" opacity=".8" />
      ))}
      {/* Bow cabin */}
      <rect x="48" y="40" width="28" height="32" rx="2" fill="#1a3d6e" />
      <rect x="52" y="44" width="8" height="11" rx="1" fill="#A9D6E5" opacity=".7" />
      <rect x="62" y="44" width="8" height="11" rx="1" fill="#A9D6E5" opacity=".7" />
      {/* Stern cabin */}
      <rect x="224" y="40" width="28" height="32" rx="2" fill="#1a3d6e" />
      <rect x="228" y="44" width="8" height="11" rx="1" fill="#A9D6E5" opacity=".7" />
      <rect x="238" y="44" width="8" height="11" rx="1" fill="#A9D6E5" opacity=".7" />
      {/* Mast + flag */}
      <rect x="147" y="4" width="4" height="14" fill="#e5e7eb" />
      <polygon points="151,4 178,10 151,17" fill="#ef4444" opacity=".9" />
      {/* Containers */}
      <rect x="88" y="55" width="32" height="14" rx="1" fill="#2563eb" opacity=".65" />
      <rect x="124" y="55" width="32" height="14" rx="1" fill="#dc2626" opacity=".65" />
      <rect x="160" y="55" width="32" height="14" rx="1" fill="#16a34a" opacity=".65" />
      {/* Bow wave & waterline */}
      <polygon points="18,72 2,82 38,94" fill="#163152" />
      <rect x="38" y="88" width="224" height="4" rx="2" fill="#A9D6E5" opacity=".15" />
    </svg>
  </div>
)

const WaveLayer = ({ className, path, fill, opacity }: {
  className: string
  path: string
  fill: string
  opacity?: number
}) => (
  <div className={`wave-wrap ${className}`}>
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
      <path d={path} fill={fill} opacity={opacity || 1} />
    </svg>
  </div>
)

// ====================== DONE PAGE ======================

function DoneContent() {
  const searchParams = useSearchParams()
  const responseId = searchParams.get('rid')
  const [timestamp, setTimestamp] = useState('')
  const [showCloseHint, setShowCloseHint] = useState(false)

  useEffect(() => {
    setTimestamp(new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }))
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .done-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(180deg, #0d1f3c 0%, #1B6FA8 55%, #2C8FC3 100%);
          position: relative; overflow: hidden; padding: 32px 16px;
        }

        /* Grid overlay */
        .done-root::before {
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

        /* Ocean waves */
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

        /* Ship */
        .ship-wrap {
          position: absolute;
          bottom: 72px; left: 50%; transform: translateX(-50%);
          z-index: 2; pointer-events: none;
          animation: bob 4.5s ease-in-out infinite;
        }
        @keyframes bob {
          0%,100% { transform: translateX(-50%) translateY(0)    rotate(-0.4deg); }
          50%      { transform: translateX(-50%) translateY(-7px) rotate(0.4deg); }
        }

        /* Buoys */
        .buoy {
          position: absolute; z-index: 2; pointer-events: none;
          animation: float 3.5s ease-in-out infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0); }
          50%      { transform: translateY(-5px); }
        }

        /* Card */
        .done-card {
          position: relative; z-index: 10;
          background: #ffffff; border-radius: 16px;
          border: 1px solid rgba(255,255,255,.15);
          padding: 44px 40px 32px; width: 100%; max-width: 420px;
          box-shadow: 0 24px 64px rgba(13,31,60,.35), 0 4px 16px rgba(13,31,60,.2);
          animation: popIn .55s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.88) translateY(16px); }
          to   { opacity: 1; transform: none; }
        }

        /* Check ring */
        .done-check-ring {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          box-shadow: 0 8px 24px rgba(27,111,168,.35);
          animation: scaleIn .6s .12s cubic-bezier(.34,1.56,.64,1) both;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0); }
          to   { opacity: 1; transform: scale(1); }
        }

        /* Info rows */
        .done-info-row {
          display: flex; align-items: center; gap: 12px;
          background: #f8fafc; border: 1px solid #e8edf4;
          border-radius: 10px; padding: 11px 14px; margin-bottom: 10px;
        }
        .done-info-icon {
          width: 34px; height: 34px; border-radius: 8px;
          background: #EBF5FF;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .done-info-label {
          font-size: 10px; font-weight: 700; letter-spacing: .7px;
          text-transform: uppercase; color: #94a3b8; margin-bottom: 2px;
        }
        .done-info-value { font-size: 13px; font-weight: 600; color: #0d1f3c; }

        /* Response ID */
        .done-rid {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #f0f9ff; border: 1px dashed #93c5fd;
          border-radius: 8px; padding: 9px 14px; margin: 14px 0 20px;
          font-size: 11px; font-weight: 700; color: #1B6FA8;
          font-family: monospace; letter-spacing: .7px;
        }

        /* Button */
        .done-btn {
          width: 100%; height: 48px; border: none; border-radius: 8px;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3);
          color: #fff; font-size: 14px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: opacity .2s, transform .15s, box-shadow .2s;
          letter-spacing: .3px;
        }
        .done-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(27,111,168,.35); }
        .done-btn:active { transform: translateY(0); }
        .done-btn:disabled { opacity: .55; cursor: not-allowed; transform: none; box-shadow: none; }

        /* Manual close hint */
        .done-close-hint {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          border-radius: 8px; padding: 10px 14px; margin-top: 12px;
          font-size: 12px; font-weight: 500; color: #16a34a;
        }

        /* Logo */
        .done-logo { position: absolute; top: 36px; left: 48px; z-index: 10; }
        .done-logo img { height: 45px; width: auto; object-fit: contain; filter: brightness(0) invert(1); opacity: .88; }

        /* Pill badge */
        .done-pill {
          position: absolute; top: -13px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(90deg, #f59e0b, #f97316);
          color: #fff; font-size: 10px; font-weight: 700; letter-spacing: .7px;
          text-transform: uppercase; padding: 3px 14px; border-radius: 20px; white-space: nowrap;
        }
      `}</style>

      <div className="done-root">

        {/* Logo */}
        <div className="done-logo">
          <img src="/white-logo.png" alt="PT Pelindo Daya Sejahtera" />
        </div>

        {/* Stars */}
        <StarField />

        {/* Buoys */}
        <Buoy left="16%" colorTop="#f59e0b" colorBody="#dc2626" animationDuration="3.8s" />
        <Buoy left="82%" colorTop="#22c55e" colorBody="#16a34a" animationDuration="4.2s" animationDelay="1.2s" />

        {/* Ship */}
        <Ship />

        {/* Waves */}
        <WaveLayer
          className="wave-back"
          path="M0,45 C180,20 360,70 540,45 C720,20 900,70 1080,45 C1260,20 1440,60 1440,45 L1440,90 L0,90 Z"
          fill="#1B6FA8"
          opacity={0.35}
        />
        <WaveLayer
          className="wave-mid"
          path="M0,50 C240,22 480,78 720,50 C960,22 1200,72 1440,50 L1440,90 L0,90 Z"
          fill="#1565a0"
          opacity={0.55}
        />
        <WaveLayer
          className="wave-front"
          path="M0,40 C200,10 400,72 600,40 C800,10 1000,68 1200,40 C1320,24 1380,52 1440,40 L1440,90 L0,90 Z"
          fill="#0d4f7a"
        />

        {/* Card */}
        <div className="done-card">
          <div className="done-pill">Berhasil Terkirim</div>

          {/* Check circle */}
          <div className="done-check-ring">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <polyline points="7,17 13,23 25,10" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 700, textAlign: 'center', color: '#0d1f3c', marginBottom: 8 }}>
            Terima Kasih!
          </h1>
          <p style={{ fontSize: 13, color: '#8fa0b4', textAlign: 'center', lineHeight: 1.7, marginBottom: 28 }}>
            Jawaban Anda telah berhasil dikirim dan tersimpan. Respons Anda sangat berarti bagi PT Pelindo Daya Sejahtera.
          </p>

          <div style={{ height: 1, background: '#f0f4f8', margin: '0 -40px 24px' }} />

          {/* Waktu Submit */}
          <div className="done-info-row">
            <div className="done-info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B6FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
              </svg>
            </div>
            <div>
              <div className="done-info-label">Waktu Submit</div>
              <div className="done-info-value">{timestamp}</div>
            </div>
          </div>

          {/* Status */}
          <div className="done-info-row">
            <div className="done-info-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1B6FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
              </svg>
            </div>
            <div>
              <div className="done-info-label">Status</div>
              <div className="done-info-value">Jawaban Tersimpan</div>
            </div>
          </div>

          {/* Response ID */}
          {responseId && (
            <div className="done-rid">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B6FA8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span>ID Respons: {responseId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}

          <button
            className="done-btn"
            disabled={showCloseHint}
            onClick={() => {
              window.close()
              setTimeout(() => setShowCloseHint(true), 300)
            }}
          >
            {showCloseHint ? 'Halaman Selesai' : 'Tutup Halaman'}
          </button>

          {showCloseHint && (
            <div className="done-close-hint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Silakan tutup tab ini secara manual</span>
            </div>
          )}

          <p style={{ fontSize: 12, color: '#b0bec5', textAlign: 'center', marginTop: 24 }}>
            © 2026 PT Pelindo Daya Sejahtera
          </p>
        </div>

      </div>
    </>
  )
}

export default function SurveyDonePage() {
  return (
    <Suspense>
      <DoneContent />
    </Suspense>
  )
}
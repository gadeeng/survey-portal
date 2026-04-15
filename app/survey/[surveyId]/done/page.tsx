'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function DoneContent() {
  const searchParams = useSearchParams()
  const responseId = searchParams.get('rid')

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
        .done-root::before {
          content: ''; position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 52px 52px; pointer-events: none; z-index: 0;
        }

        .star {
          position: absolute; border-radius: 50%;
          background: #ffffff; pointer-events: none;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.4); }
        }

        /* Confetti particles */
        .confetti {
          position: absolute; border-radius: 2px;
          pointer-events: none; z-index: 1;
          animation: fall linear infinite;
        }
        @keyframes fall {
          0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh)  rotate(360deg); opacity: 0; }
        }

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

        .logo-wrap { position: absolute; top: 36px; left: 48px; z-index: 10; }
        .logo-wrap img { height: 45px; width: auto; object-fit: contain; filter: brightness(0) invert(1); opacity: .88; }

        .card {
          position: relative; z-index: 10;
          background: #ffffff; border-radius: 20px;
          padding: 52px 44px; width: 100%; max-width: 460px;
          box-shadow: 0 24px 64px rgba(13,31,60,.35), 0 4px 16px rgba(13,31,60,.2);
          text-align: center;
          animation: popIn .5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes popIn {
          0%   { opacity: 0; transform: scale(.88) translateY(20px); }
          100% { opacity: 1; transform: scale(1)   translateY(0); }
        }

        /* Check circle */
        .check-wrap {
          width: 80px; height: 80px; border-radius: 50%;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 24px;
          box-shadow: 0 8px 24px rgba(27,111,168,.35);
          animation: scaleIn .6s .2s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        }
        @keyframes scaleIn {
          0%   { opacity: 0; transform: scale(0); }
          100% { opacity: 1; transform: scale(1); }
        }
        .check-icon { font-size: 36px; color: #fff; line-height: 1; }

        .done-title { font-size: 26px; font-weight: 700; color: #0d1f3c; margin-bottom: 12px; }
        .done-sub {
          font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 32px;
        }

        /* Divider */
        .divider { height: 1px; background: #f0f4f8; margin: 0 -44px 28px; }

        /* Info boxes */
        .info-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
        .info-box {
          background: #f8fafc; border: 1px solid #e8edf4;
          border-radius: 10px; padding: 14px 18px;
          display: flex; align-items: center; gap: 14px; text-align: left;
        }
        .info-icon-wrap {
          width: 36px; height: 36px; border-radius: 8px;
          background: #EBF5FF; display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .info-box-label { font-size: 11px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: #94a3b8; margin-bottom: 2px; }
        .info-box-value { font-size: 13px; font-weight: 600; color: #0d1f3c; }

        .id-badge {
          background: #f0f9ff; border: 1px dashed #93c5fd;
          border-radius: 8px; padding: 10px 14px;
          font-size: 12px; color: #1B6FA8; font-weight: 600;
          letter-spacing: .5px; margin-bottom: 28px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          font-family: monospace;
        }

        .close-btn {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3);
          color: #fff; border: none; border-radius: 10px;
          font-size: 15px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: opacity .2s, transform .15s, box-shadow .2s;
          margin-bottom: 12px;
        }
        .close-btn:hover { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(27,111,168,.35); }

        .footer { font-size: 12px; color: #b0bec5; margin-top: 24px; }
      `}</style>

      <div className="done-root">
        {/* Stars */}
        {[
          { top:'7%',  left:'10%', size:2, delay:'0s'   },
          { top:'5%',  left:'25%', size:2, delay:'.7s'  },
          { top:'11%', left:'42%', size:3, delay:'1.3s' },
          { top:'4%',  left:'60%', size:2, delay:'.2s'  },
          { top:'9%',  left:'75%', size:2, delay:'1.8s' },
          { top:'6%',  left:'88%', size:3, delay:'.5s'  },
        ].map((s, i) => (
          <div key={i} className="star" style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }} />
        ))}

        {/* Confetti */}
        {[
          { left:'10%', color:'#1B6FA8', size:8,  delay:'0s',   dur:'2.8s' },
          { left:'20%', color:'#f59e0b', size:6,  delay:'.3s',  dur:'3.2s' },
          { left:'30%', color:'#2C8FC3', size:10, delay:'.6s',  dur:'2.5s' },
          { left:'45%', color:'#ef4444', size:6,  delay:'.1s',  dur:'3.0s' },
          { left:'55%', color:'#1B6FA8', size:8,  delay:'.8s',  dur:'2.7s' },
          { left:'65%', color:'#22c55e', size:6,  delay:'.4s',  dur:'3.1s' },
          { left:'75%', color:'#f59e0b', size:10, delay:'.2s',  dur:'2.9s' },
          { left:'85%', color:'#2C8FC3', size:6,  delay:'.7s',  dur:'3.3s' },
          { left:'92%', color:'#ef4444', size:8,  delay:'.5s',  dur:'2.6s' },
        ].map((c, i) => (
          <div key={i} className="confetti" style={{
            left: c.left, top: '-20px',
            width: c.size, height: c.size * 1.5,
            background: c.color, opacity: .8,
            animationDelay: c.delay, animationDuration: c.dur,
          }} />
        ))}

        <div className="wave-wrap wave-back">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,45 C180,20 360,70 540,45 C720,20 900,70 1080,45 C1260,20 1440,60 1440,45 L1440,90 L0,90 Z" fill="#1B6FA8" opacity=".35"/>
          </svg>
        </div>
        <div className="wave-wrap wave-mid">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,50 C240,22 480,78 720,50 C960,22 1200,72 1440,50 L1440,90 L0,90 Z" fill="#1565a0" opacity=".55"/>
          </svg>
        </div>
        <div className="wave-wrap wave-front">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none">
            <path d="M0,40 C200,10 400,72 600,40 C800,10 1000,68 1200,40 C1320,24 1380,52 1440,40 L1440,90 L0,90 Z" fill="#0d4f7a"/>
          </svg>
        </div>

        <div className="logo-wrap">
          <img src="/white-logo.png" alt="PT Pelindo Daya Sejahtera" />
        </div>

        <div className="card">
          <div className="check-wrap">
            <span className="check-icon">✓</span>
          </div>

          <h1 className="done-title">Terima Kasih!</h1>
          <p className="done-sub">
            Jawaban Anda telah berhasil dikirim dan tersimpan. Respons Anda sangat berarti bagi PT Pelindo Daya Sejahtera.
          </p>

          <div className="divider" />

          <div className="info-row">
            <div className="info-box">
              <div className="info-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B6FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
                </svg>
              </div>
              <div>
                <p className="info-box-label">Waktu Submit</p>
                <p className="info-box-value">{new Date().toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}</p>
              </div>
            </div>
            <div className="info-box">
              <div className="info-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1B6FA8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
                </svg>
              </div>
              <div>
                <p className="info-box-label">Status</p>
                <p className="info-box-value">Jawaban Tersimpan</p>
              </div>
            </div>
          </div>

          {responseId && (
            <div className="id-badge">
              <span>📋</span>
              <span>ID Respons: {responseId.slice(0, 8).toUpperCase()}</span>
            </div>
          )}

          <button className="close-btn" onClick={() => window.close()}>
            Tutup Halaman
          </button>

          <p className="footer">© 2026 PT Pelindo Daya Sejahtera</p>
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
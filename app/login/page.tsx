'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    router.push('/master')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          background: linear-gradient(180deg, #0d1f3c 0%, #1B6FA8 55%, #2C8FC3 100%);
          position: relative; overflow: hidden; padding: 32px 16px;
        }

        /* Grid overlay */
        .login-root::before {
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
          0%,100% { transform: translateX(-50%) translateY(0)   rotate(-0.4deg); }
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

        /* Form card */
        .form-card {
          position: relative; z-index: 10;
          background: #ffffff; border-radius: 16px;
          border: 1px solid rgba(255,255,255,.15);
          padding: 44px 40px; width: 100%; max-width: 420px;
          box-shadow: 0 24px 64px rgba(13,31,60,.35), 0 4px 16px rgba(13,31,60,.2);
        }
        .form-eyebrow { font-size: 11px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; color: #1B6FA8; margin-bottom: 8px; }
        .form-title { font-size: 26px; font-weight: 700; color: #0d1f3c; line-height: 1.2; margin-bottom: 6px; }
        .form-sub { font-size: 13px; color: #8fa0b4; margin-bottom: 32px; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: .8px; text-transform: uppercase; color: #374151; margin-bottom: 8px; }
        .form-input {
          width: 100%; height: 46px; background: #f8fafc; border: 1px solid #dde3ec; border-radius: 8px;
          padding: 0 14px; font-size: 14px; color: #1a2332;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none; transition: border .2s, box-shadow .2s;
        }
        .form-input:focus { border-color: #1B6FA8; box-shadow: 0 0 0 3px rgba(27,111,168,.12); }
        .form-input::placeholder { color: #c4cdd8; }
        .error-box {
          background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px;
          padding: 11px 14px; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: #dc2626; font-weight: 500;
        }
        .submit-btn {
          width: 100%; height: 48px;
          background: linear-gradient(135deg, #1B6FA8, #2C8FC3);
          color: #fff; border: none; border-radius: 8px;
          font-size: 14px; font-weight: 600;
          font-family: 'Plus Jakarta Sans', sans-serif;
          cursor: pointer; transition: opacity .2s, transform .15s, box-shadow .2s;
          margin-top: 6px; letter-spacing: .3px;
        }
        .submit-btn:hover:not(:disabled) { opacity: .92; transform: translateY(-1px); box-shadow: 0 8px 24px rgba(27,111,168,.35); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: .55; cursor: not-allowed; }
        .form-footer { margin-top: 28px; padding-top: 20px; border-top: 1px solid #f0f4f8; text-align: center; font-size: 12px; color: #b0bec5; }

        /* === PASSWORD TOGGLE === */
        .password-wrapper {
          position: relative;
        }
        .password-input {
          padding-right: 50px !important;
        }
        .password-toggle {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          width: 24px;
          height: 24px;
          transition: color .2s;
        }
        .password-toggle:hover {
          color: #1B6FA8;
        }
        .password-toggle:focus {
          outline: 2px solid #1B6FA8;
          outline-offset: 2px;
        }
        .password-toggle svg {
          width: 20px;
          height: 20px;
        }

        /* Logo */
        .login-logo { position: absolute; top: 36px; left: 48px; z-index: 10; }
        .login-logo img { height: 45px; width: auto; object-fit: contain; filter: brightness(0) invert(1); opacity: .88; }
      `}</style>

      <div className="login-root">

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
          { top: '19%', left: '70%', size: 2, delay: '.4s' },
          { top: '3%', left: '36%', size: 2, delay: '1.6s' },
          { top: '13%', left: '82%', size: 3, delay: '2.3s' },
        ].map((s, i) => (
          <div key={i} className="star" style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            animationDelay: s.delay,
          }} />
        ))}

        {/* Left red buoy */}
        <div className="buoy" style={{ bottom: 72, left: '16%', animationDuration: '3.8s' }}>
          <svg width="14" height="30" viewBox="0 0 14 30">
            <rect x="5" y="0" width="4" height="2" rx="1" fill="#f59e0b" />
            <ellipse cx="7" cy="17" rx="6" ry="9" fill="#dc2626" />
            <rect x="4" y="9" width="6" height="3" fill="#f9fafb" opacity=".75" />
            <rect x="4" y="15" width="6" height="3" fill="#b91c1c" />
            <rect x="6" y="26" width="2" height="4" fill="#6b7280" />
          </svg>
        </div>

        {/* Right green buoy */}
        <div className="buoy" style={{ bottom: 72, left: '82%', animationDuration: '4.2s', animationDelay: '1.2s' }}>
          <svg width="14" height="30" viewBox="0 0 14 30">
            <rect x="5" y="0" width="4" height="2" rx="1" fill="#22c55e" />
            <ellipse cx="7" cy="17" rx="6" ry="9" fill="#16a34a" />
            <rect x="4" y="9" width="6" height="3" fill="#f9fafb" opacity=".75" />
            <rect x="4" y="15" width="6" height="3" fill="#15803d" />
            <rect x="6" y="26" width="2" height="4" fill="#6b7280" />
          </svg>
        </div>

        {/* Cargo ship */}
        <div className="ship-wrap">
          <svg width="300" height="112" viewBox="0 0 300 112">
            {/* Hull */}
            <polygon points="18,72 282,72 262,94 38,94" fill="#1e3a5f" />
            <rect x="38" y="94" width="224" height="12" rx="6" fill="#163152" />
            {/* Superstructure */}
            <rect x="84" y="28" width="132" height="44" rx="3" fill="#1e4976" />
            <rect x="96" y="16" width="88" height="14" rx="2" fill="#245a8a" />
            {/* Windows row */}
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
            {/* Containers on deck */}
            <rect x="88" y="55" width="32" height="14" rx="1" fill="#2563eb" opacity=".65" />
            <rect x="124" y="55" width="32" height="14" rx="1" fill="#dc2626" opacity=".65" />
            <rect x="160" y="55" width="32" height="14" rx="1" fill="#16a34a" opacity=".65" />
            {/* Bow wave detail */}
            <polygon points="18,72 2,82 38,94" fill="#163152" />
            {/* Waterline stripe */}
            <rect x="38" y="88" width="224" height="4" rx="2" fill="#A9D6E5" opacity=".15" />
          </svg>
        </div>

        {/* Waves — back to front */}
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
        <div className="login-logo">
          <img src="/white-logo.png" alt="PT Pelindo Daya Sejahtera" />
        </div>

        {/* Form card */}
        <div className="form-card">
          <p className="form-eyebrow">Akses Portal</p>
          <h2 className="form-title">Selamat Datang</h2>
          <p className="form-sub">Masuk dengan kredensial akun Anda</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input password-input"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    // Eye-slash (hide)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908L3 3m3.75 3.75L21 21" />
                    </svg>
                  ) : (
                    // Eye (show)
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5 16.477 5 20.268 7.943 21.542 12 20.268 16.057 16.477 19 12 19 7.523 19 3.732 16.057 2.458 12z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="error-box">
                <span>⚠</span>
                <span>{error}</span>
              </div>
            )}
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Memverifikasi...' : 'Masuk'}
            </button>
          </form>

          <div className="form-footer">© 2026 PT Pelindo Daya Sejahtera</div>
        </div>
      </div>
    </>
  )
}
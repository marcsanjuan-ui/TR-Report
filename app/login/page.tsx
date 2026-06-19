'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) { setError('Please enter your name.'); return }
    localStorage.setItem('creator_name', trimmed)
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="w-full max-w-sm">
        {/* Brand header */}
        <div
          className="rounded-xl mb-4 px-7 py-6"
          style={{ background: '#1a2744', boxShadow: '0 8px 32px rgba(26,39,68,0.35)' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold"
              style={{ background: '#d4870a', color: '#fff', boxShadow: '0 2px 8px rgba(212,135,10,0.4)' }}
            >
              J
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#4f6490', fontFamily: 'var(--font-mono)' }}>
                JHIC / Makerlab
              </div>
              <div className="text-white font-bold text-sm tracking-wide">Document System</div>
            </div>
          </div>
          <p className="text-xs" style={{ color: '#4f6490' }}>Jassen Harris Industries Corporation · Technical Department</p>
        </div>

        {/* Form card */}
        <div className="card overflow-hidden">
          <div className="p-6">
            <h2 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-secondary)' }}>
              Who&apos;s creating the report?
            </h2>
            <p className="text-xs mb-5" style={{ color: 'var(--text-muted)' }}>
              Enter your name to be recorded as the report creator.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setError('') }}
                  className="field-input"
                  placeholder="e.g. Juan Dela Cruz"
                  autoFocus
                  required
                />
              </div>

              {error && (
                <div
                  className="text-xs px-3 py-2.5 rounded-lg"
                  style={{
                    background: 'var(--status-draft-bg)',
                    color: 'var(--status-draft-text)',
                    border: '1px solid var(--status-draft-border)',
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full justify-center">
                Continue
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Technical Department · Internal Use Only
        </p>
      </div>
    </div>
  )
}

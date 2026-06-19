'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setError('Check your email to confirm your account.')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
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
            <h2 className="text-sm font-bold uppercase tracking-wider mb-5" style={{ color: 'var(--text-secondary)' }}>Sign In</h2>

            {/* Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 mb-4 text-sm font-semibold rounded-lg transition-all disabled:opacity-50"
              style={{ border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
            >
              {googleLoading ? <Loader2 size={15} className="spin" /> : <GoogleIcon />}
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="field-input" placeholder="you@company.com" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="field-input" placeholder="••••••••" required />
              </div>

              {error && (
                <div className="text-xs px-3 py-2.5 rounded-lg" style={{
                  background: error.includes('Check') ? 'var(--status-approved-bg)' : 'var(--status-draft-bg)',
                  color: error.includes('Check') ? 'var(--status-approved-text)' : 'var(--status-draft-text)',
                  border: `1px solid ${error.includes('Check') ? 'var(--status-approved-border)' : 'var(--status-draft-border)'}`,
                }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={loading || googleLoading} className="btn-primary flex-1 justify-center">
                  {loading ? <><Loader2 size={13} className="spin" /> Signing in…</> : 'Sign In'}
                </button>
                <button type="button" onClick={handleSignUp} disabled={loading || googleLoading} className="btn-outline flex-1 justify-center">
                  Sign Up
                </button>
              </div>
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

function GoogleIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
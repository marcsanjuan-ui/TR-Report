'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
    router.refresh()
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    setError('Check your email to confirm your account.')
    setLoading(false)
  }

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) { setError(error.message); setGoogleLoading(false) }
    // On success, Supabase redirects automatically — no need to setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f2f7' }}>
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="rounded-lg mb-6 p-7 text-white" style={{ background: '#1a2744' }}>
          <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: '#8fa3cc', fontFamily: 'IBM Plex Mono' }}>
            JHIC / Makerlab
          </div>
          <h1 className="text-xl font-bold tracking-wide uppercase">Document System</h1>
          <p className="text-sm mt-1" style={{ color: '#8fa3cc' }}>Jassen Harris Industries Corporation</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-5">Sign In</h2>

            {/* Google Login */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-2 px-4 mb-4 text-sm font-semibold rounded border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              {googleLoading ? (
                <span className="text-sm">Redirecting…</span>
              ) : (
                <>
                  <GoogleIcon />
                  Continue with Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="field-input"
                  placeholder="you@company.com"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="field-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="text-xs px-3 py-2 rounded" style={{
                  background: error.includes('Check') ? '#edf7f1' : '#fde8e8',
                  color: error.includes('Check') ? '#2a7a4b' : '#c8392b',
                  border: `1px solid ${error.includes('Check') ? '#b2dfc4' : '#f5c6c2'}`
                }}>
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  disabled={loading || googleLoading}
                  className="flex-1 py-2 px-4 text-sm font-semibold text-white rounded transition-colors"
                  style={{ background: loading ? '#7a9bd4' : '#2e5490' }}
                >
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading || googleLoading}
                  className="flex-1 py-2 px-4 text-sm font-semibold rounded border border-gray-300 text-gray-700 transition-colors hover:bg-gray-50"
                >
                  Sign Up
                </button>
              </div>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5" style={{ fontFamily: 'IBM Plex Mono' }}>
          Technical Department · Internal Use Only
        </p>
      </div>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import {
  LayoutDashboard, FileText, PlusCircle, LogOut,
  ChevronRight, Sun, Moon, User,
} from 'lucide-react'
import { useEffect, useState } from 'react'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/documents',  label: 'All Documents',  icon: FileText },
  { href: '/new',        label: 'New Document',   icon: PlusCircle },
]

const FILTERS = [
  { label: 'TR — Technical',      href: '/documents?prefix=TR', color: '#4472c4' },
  { label: 'TA — Announcements',  href: '/documents?prefix=TA', color: '#d4870a' },
  { label: 'AS — After Sales',    href: '/documents?prefix=AS', color: '#c8392b' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, toggle } = useTheme()
  const [creatorName, setCreatorName] = useState('')

  useEffect(() => {
    setCreatorName(localStorage.getItem('creator_name') ?? '')
  }, [])

  function signOut() {
    localStorage.removeItem('creator_name')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col z-40 select-none"
      style={{
        width: 240,
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5 mb-0.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: '#d4870a', color: '#fff', boxShadow: '0 2px 8px rgba(212,135,10,0.4)' }}
          >
            J
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight tracking-wide">JHIC / Makerlab</div>
          </div>
        </div>
        <p className="text-xs mt-2 pl-[42px]" style={{ color: '#4f6490', fontFamily: 'var(--font-mono)' }}>
          Doc System v2
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{
                color: active ? '#fff' : '#8fa3cc',
                background: active ? 'rgba(46,84,144,0.7)' : 'transparent',
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <Icon size={15} style={{ opacity: active ? 1 : 0.7 }} />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={12} style={{ opacity: 0.5 }} />}
            </Link>
          )
        })}

        {/* Quick filter */}
        <div className="pt-5">
          <div
            className="px-3 mb-2 text-[10px] font-bold tracking-widest uppercase"
            style={{ color: '#344870' }}
          >
            Quick Filter
          </div>
          {FILTERS.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all"
              style={{ color: '#8fa3cc' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8fa3cc' }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Bottom: theme toggle + user + signout */}
      <div className="px-3 pb-4 pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-xs transition-all"
          style={{ color: '#8fa3cc' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8fa3cc' }}
        >
          {theme === 'dark'
            ? <Sun size={14} />
            : <Moon size={14} />
          }
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          <div
            className="ml-auto rounded-full flex items-center transition-all"
            style={{
              width: 28, height: 16,
              background: theme === 'dark' ? '#2e5490' : 'rgba(255,255,255,0.15)',
              padding: 2,
            }}
          >
            <div
              className="w-3 h-3 rounded-full bg-white transition-all"
              style={{ transform: theme === 'dark' ? 'translateX(12px)' : 'translateX(0)' }}
            />
          </div>
        </button>

        {/* User card */}
        <div
          className="px-3 py-2.5 rounded-lg"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
              style={{ background: 'rgba(46,84,144,0.6)', color: '#a0bce8' }}
            >
              {creatorName ? creatorName[0].toUpperCase() : <User size={10} />}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">{creatorName || 'Unknown'}</p>
              <p className="text-[10px]" style={{ color: '#4f6490', fontFamily: 'var(--font-mono)' }}>Report Creator</p>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs transition-all"
          style={{ color: '#8fa3cc' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,57,43,0.12)'; (e.currentTarget as HTMLElement).style.color = '#e8806e' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#8fa3cc' }}
        >
          <LogOut size={13} />
          Change Name
        </button>
      </div>
    </aside>
  )
}

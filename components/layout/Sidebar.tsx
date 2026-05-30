'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, FileText, PlusCircle, LogOut,
  ChevronRight, Layers
} from 'lucide-react'

interface Props { userEmail: string }

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/documents',  label: 'All Documents', icon: FileText },
  { href: '/new',        label: 'New Document', icon: PlusCircle },
]

export default function Sidebar({ userEmail }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 w-60 flex flex-col z-40 border-r"
      style={{ background: '#1a2744', borderColor: '#24366a' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: '#24366a' }}>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#d4870a', color: '#fff' }}>
            J
          </div>
          <span className="text-sm font-bold text-white tracking-wide">JHIC / Makerlab</span>
        </div>
        <p className="text-xs ml-9" style={{ color: '#6a85b8', fontFamily: 'IBM Plex Mono' }}>Doc System</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all',
                active
                  ? 'text-white'
                  : 'text-[#8fa3cc] hover:text-white hover:bg-[#243760]'
              )}
              style={active ? { background: '#2e5490' } : {}}
            >
              <Icon size={15} />
              {item.label}
              {active && <ChevronRight size={12} className="ml-auto opacity-60" />}
            </Link>
          )
        })}

        {/* Document type quick links */}
        <div className="pt-4">
          <div className="px-3 mb-2 text-xs font-bold tracking-widest uppercase" style={{ color: '#4a6090' }}>
            Quick Filter
          </div>
          {[
            { label: 'TR — Technical', href: '/documents?prefix=TR', color: '#4472c4' },
            { label: 'TA — Announcements', href: '/documents?prefix=TA', color: '#d4870a' },
            { label: 'AS — After Sales', href: '/documents?prefix=AS', color: '#c8392b' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-3 py-2 rounded text-xs transition-all text-[#8fa3cc] hover:text-white hover:bg-[#243760]"
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }} />
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      {/* User + sign out */}
      <div className="px-3 py-4 border-t" style={{ borderColor: '#24366a' }}>
        <div className="px-3 py-2 mb-1 rounded" style={{ background: '#162036' }}>
          <p className="text-xs font-medium text-white truncate">{userEmail}</p>
          <p className="text-xs mt-0.5" style={{ color: '#6a85b8', fontFamily: 'IBM Plex Mono' }}>Staff</p>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded text-xs transition-all text-[#8fa3cc] hover:text-white hover:bg-[#243760]"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

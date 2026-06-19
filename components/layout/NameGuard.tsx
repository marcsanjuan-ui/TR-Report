'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function NameGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't guard the login page itself
    if (pathname === '/login') return
    const name = localStorage.getItem('creator_name')
    if (!name) {
      router.replace('/login')
    }
  }, [pathname, router])

  return <>{children}</>
}

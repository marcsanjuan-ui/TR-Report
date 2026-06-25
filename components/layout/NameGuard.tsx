'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function NameGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname === '/login') {
      setReady(true)
      return
    }
    const name = localStorage.getItem('creator_name')
    if (!name) {
      router.replace('/login')
    } else {
      setReady(true)
    }
  }, [pathname, router])

  if (!ready) return null

  return <>{children}</>
}

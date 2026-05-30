'use client'

import { updateDocument } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const STATUSES = ['draft', 'submitted', 'approved', 'archived'] as const

export default function StatusChanger({ docId, currentStatus }: { docId: string; currentStatus: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function changeStatus(status: string) {
    if (status === currentStatus) return
    setLoading(true)
    try {
      await updateDocument(docId, { status })
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <select
      value={currentStatus}
      onChange={e => changeStatus(e.target.value)}
      disabled={loading}
      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 cursor-pointer"
    >
      {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
    </select>
  )
}

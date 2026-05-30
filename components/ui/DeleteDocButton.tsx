'use client'

import { deleteDocument } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function DeleteDocButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm('Delete this document? This cannot be undone.')) return
    setLoading(true)
    try {
      await deleteDocument(id)
      router.refresh()
    } catch (e) {
      alert('Could not delete: ' + (e instanceof Error ? e.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs text-red-500 hover:text-red-700 hover:underline disabled:opacity-40"
    >
      {loading ? '…' : 'Delete'}
    </button>
  )
}

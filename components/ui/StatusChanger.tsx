// FILE: components/ui/StatusChanger.tsx
'use client'

import { useState } from 'react'
import { updateDocument } from '@/lib/actions'
import { ChevronDown, Loader2 } from 'lucide-react'

const STATUSES = ['draft', 'submitted', 'approved', 'archived'] as const

type Status = (typeof STATUSES)[number]

const STATUS_LABELS: Record<Status, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  archived: 'Archived',
}

type StatusChangerProps = {
  docId: string
  currentStatus: string
}

export default function StatusChanger({
  docId,
  currentStatus,
}: StatusChangerProps) {
  const initialStatus = STATUSES.includes(currentStatus as Status)
    ? (currentStatus as Status)
    : 'draft'

  const [status, setStatus] = useState<Status>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function change(next: Status) {
    if (next === status) {
      setOpen(false)
      return
    }

    try {
      setLoading(true)
      setOpen(false)

      await updateDocument(docId, { status: next })

      setStatus(next)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        disabled={loading}
        className="status-change-button flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
      >
        {loading && <Loader2 size={12} className="spin" />}

        {loading ? 'Updating…' : 'Change Status'}

        {!loading && <ChevronDown size={12} style={{ opacity: 0.6 }} />}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div className="status-dropdown absolute right-0 top-full mt-1.5 z-50 py-1 rounded-lg overflow-hidden">
            {STATUSES.map((item) => {
              const active = item === status

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => change(item)}
                  className={`status-option flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-left transition-all ${
                    active ? 'status-option-active' : ''
                  }`}
                >
                  <span className={`badge badge-${item}`}>
                    {STATUS_LABELS[item]}
                  </span>

                  {active && (
                    <span className="ml-auto text-[10px] status-check">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
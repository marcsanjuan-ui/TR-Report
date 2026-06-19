import { fetchDocuments, fetchStats } from '@/lib/actions'
import { DOC_META } from '@/types/documents'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import {
  FileText,
  TrendingUp,
  CheckCircle,
  Clock,
  PlusCircle,
  ArrowRight,
} from 'lucide-react'

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    fetchStats(),
    fetchDocuments({ limit: 8 }),
  ])

  const statCards = [
    {
      label: 'Total Documents',
      value: stats.total,
      icon: FileText,
      accent: '#2e5490',
      pale: 'rgba(46,84,144,0.1)',
    },
    {
      label: 'TR · Technical',
      value: stats.byPrefix?.TR ?? 0,
      icon: TrendingUp,
      accent: '#4472c4',
      pale: 'rgba(68,114,196,0.1)',
    },
    {
      label: 'TA · Announcements',
      value: stats.byPrefix?.TA ?? 0,
      icon: CheckCircle,
      accent: '#d4870a',
      pale: 'rgba(212,135,10,0.1)',
    },
    {
      label: 'AS · After Sales',
      value: stats.byPrefix?.AS ?? 0,
      icon: Clock,
      accent: '#c8392b',
      pale: 'rgba(200,57,43,0.1)',
    },
  ]

  const statusRows = [
    { key: 'draft', label: 'Draft', color: '#d4870a' },
    { key: 'submitted', label: 'Submitted', color: '#2e5490' },
    { key: 'approved', label: 'Approved', color: '#2a7a4b' },
    { key: 'archived', label: 'Archived', color: '#9aa0ad' },
  ]

  const quickTypes = ['PPL', 'PRD', 'CRR', 'RPR', 'TAN', 'IDM'] as const

  return (
    <div className="p-8 max-w-5xl mx-auto fade-up">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-1"
            style={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-mono)',
            }}
          >
            JHIC / Makerlab
          </p>

          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-primary)' }}
          >
            Dashboard
          </h1>
        </div>

        <Link href="/new" className="btn-primary">
          <PlusCircle size={15} />
          New Document
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className="card p-5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: card.pale }}
              >
                <Icon size={17} style={{ color: card.accent }} />
              </div>

              <div
                className="text-3xl font-bold mb-1"
                style={{
                  color: card.accent,
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {card.value}
              </div>

              <div
                className="text-xs font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                {card.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* By Status */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2>By Status</h2>
          </div>

          <div className="p-5 space-y-4">
            {statusRows.map(({ key, label, color }) => {
              const count =
                stats.byStatus?.[key as keyof typeof stats.byStatus] ?? 0

              const pct =
                stats.total > 0
                  ? Math.round((count / stats.total) * 100)
                  : 0

              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span
                      className="font-medium"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {label}
                    </span>

                    <span
                      style={{
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      {count}
                    </span>
                  </div>

                  <div
                    className="h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--border)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        background: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Create */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h2>Quick Create</h2>
          </div>

          <div className="p-4 grid grid-cols-2 gap-2">
            {quickTypes.map((type) => {
              const meta = DOC_META[type]

              const isPill =
                meta.prefix === 'TR'
                  ? 'pill-tr'
                  : meta.prefix === 'TA'
                    ? 'pill-ta'
                    : 'pill-as'

              return (
                <Link
                  key={type}
                  href={`/new?type=${type}`}
                  className="quick-create-link group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                >
                  <span
                    className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${isPill}`}
                  >
                    {type}
                  </span>

                  <span className="truncate">{meta.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <div className="card overflow-hidden">
        <div className="card-header">
          <h2>Recent Documents</h2>

          <Link
            href="/documents"
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--brand-blue)' }}
          >
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <FileText
              size={32}
              className="mx-auto mb-3"
              style={{ color: 'var(--border)' }}
            />

            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              No documents yet.{' '}
              <Link
                href="/new"
                style={{ color: 'var(--brand-blue)' }}
                className="hover:underline"
              >
                Create your first one →
              </Link>
            </p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Control #</th>
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>

            <tbody>
              {recent.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-mono text-xs font-semibold hover:underline"
                      style={{ color: 'var(--brand-blue)' }}
                    >
                      {doc.control_number}
                    </Link>
                  </td>

                  <td>
                    <span
                      className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        doc.doc_prefix === 'TR'
                          ? 'pill-tr'
                          : doc.doc_prefix === 'TA'
                            ? 'pill-ta'
                            : 'pill-as'
                      }`}
                    >
                      {doc.doc_type}
                    </span>
                  </td>

                  <td className="max-w-[200px]">
                    <span
                      className="truncate block text-xs"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {doc.title || (
                        <span
                          style={{
                            color: 'var(--text-muted)',
                            fontStyle: 'italic',
                          }}
                        >
                          Untitled
                        </span>
                      )}
                    </span>
                  </td>

                  <td>
                    <span className={`badge badge-${doc.status}`}>
                      {doc.status}
                    </span>
                  </td>

                  <td
                    className="font-mono text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {formatDateTime(doc.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
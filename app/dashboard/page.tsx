import { fetchDocuments, fetchStats } from '@/lib/actions'
import { DOC_META, STATUS_COLORS, PREFIX_COLORS } from '@/types/documents'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { FileText, TrendingUp, CheckCircle, Clock, PlusCircle } from 'lucide-react'

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    fetchStats(),
    fetchDocuments({ limit: 8 }),
  ])

  const statCards = [
    { label: 'Total Documents', value: stats.total, icon: FileText, color: '#2e5490', bg: '#eef2fa' },
    { label: 'TR · Technical', value: stats.byPrefix?.TR ?? 0, icon: TrendingUp, color: '#2e5490', bg: '#eef2fa' },
    { label: 'TA · Announcements', value: stats.byPrefix?.TA ?? 0, icon: CheckCircle, color: '#d4870a', bg: '#fff8ec' },
    { label: 'AS · After Sales', value: stats.byPrefix?.AS ?? 0, icon: Clock, color: '#c8392b', bg: '#fdf0ee' },
  ]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1f3864] tracking-wide uppercase">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5" style={{ fontFamily: 'IBM Plex Mono' }}>
            JHIC / Makerlab Document System
          </p>
        </div>
        <Link
          href="/new"
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ background: '#2e5490' }}
        >
          <PlusCircle size={15} />
          New Document
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className="rounded-lg border p-4" style={{ background: card.bg, borderColor: '#d9e1f2' }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color: card.color }} />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{card.label}</span>
              </div>
              <div className="text-3xl font-bold" style={{ color: card.color, fontFamily: 'IBM Plex Mono' }}>
                {card.value}
              </div>
            </div>
          )
        })}
      </div>

      {/* Status breakdown */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">By Status</h2>
          </div>
          <div className="p-5 space-y-3">
            {[
              { key: 'draft', label: 'Draft' },
              { key: 'submitted', label: 'Submitted' },
              { key: 'approved', label: 'Approved' },
              { key: 'archived', label: 'Archived' },
            ].map(({ key, label }) => {
              const count = stats.byStatus?.[key] ?? 0
              const pct = stats.total > 0 ? Math.round(count / stats.total * 100) : 0
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-700">{label}</span>
                    <span className="font-mono text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${pct}%`,
                      background: key === 'draft' ? '#d4870a' : key === 'submitted' ? '#2e5490' : key === 'approved' ? '#2a7a4b' : '#9aa0ad'
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Quick Create</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-2">
            {(['PPL', 'PRD', 'CRR', 'RPR', 'TAN', 'IDM'] as const).map(type => (
              <Link
                key={type}
                href={`/new?type=${type}`}
                className="flex items-center gap-2 px-3 py-2 rounded border text-xs font-medium transition-all hover:border-blue-300 hover:bg-blue-50"
                style={{ borderColor: '#e8eaed', color: '#2d3142' }}
              >
                <span
                  className="text-xs font-mono font-bold px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    background: DOC_META[type].prefix === 'TR' ? '#e8f0fe' : DOC_META[type].prefix === 'TA' ? '#fff3cd' : '#fde8e8',
                    color: DOC_META[type].prefix === 'TR' ? '#1a56c4' : DOC_META[type].prefix === 'TA' ? '#856404' : '#a02f22'
                  }}
                >
                  {type}
                </span>
                {DOC_META[type].name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent documents */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Recent Documents</h2>
          <Link href="/documents" className="text-xs text-blue-600 hover:underline">View all →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-gray-400">
            No documents yet.{' '}
            <Link href="/new" className="text-blue-500 hover:underline">Create your first one →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100" style={{ background: '#f8f9fc' }}>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Control #</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-5 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((doc, i) => (
                <tr key={doc.id} className="border-b border-gray-50 hover:bg-blue-50 transition-colors">
                  <td className="px-5 py-3">
                    <Link href={`/documents/${doc.id}`} className="font-mono text-xs text-blue-600 hover:underline">
                      {doc.control_number}
                    </Link>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded"
                      style={{
                        background: doc.doc_prefix === 'TR' ? '#e8f0fe' : doc.doc_prefix === 'TA' ? '#fff3cd' : '#fde8e8',
                        color: doc.doc_prefix === 'TR' ? '#1a56c4' : doc.doc_prefix === 'TA' ? '#856404' : '#a02f22'
                      }}
                    >
                      {doc.doc_type}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-700 max-w-[220px] truncate">{doc.title || '—'}</td>
                  <td className="px-3 py-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-600'}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400 font-mono">{formatDateTime(doc.updated_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

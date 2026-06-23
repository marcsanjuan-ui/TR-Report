// FILE: app/documents/page.tsx
import { fetchDocuments } from '@/lib/actions'
import { DOC_META, STATUS_COLORS, DocType, DocPrefix } from '@/types/documents'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { Search, PlusCircle, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import DeleteDocButton from '@/components/ui/DeleteDocButton'

const PAGE_SIZE = 25

interface Props {
  searchParams: Promise<{ type?: string; prefix?: string; status?: string; q?: string; page?: string }>
}

type DocumentRow = {
  id: string; control_number: string; doc_prefix: DocPrefix | string
  doc_type: DocType | string; title?: string | null; status: string; updated_at: string
  created_by?: string
}

export default async function DocumentsPage({ searchParams }: Props) {
  const sp = await searchParams
  const page   = Math.max(1, parseInt(sp.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  // Fetch one extra to detect if there's a next page
  const docs = (await fetchDocuments({
    type: sp.type as DocType | undefined,
    status: sp.status,
    search: sp.q,
    limit: PAGE_SIZE + 1,
    offset,
  })) as DocumentRow[]

  const hasNext = docs.length > PAGE_SIZE
  const filtered = (sp.prefix
    ? docs.filter(d => d.doc_prefix === sp.prefix)
    : docs
  ).slice(0, PAGE_SIZE)

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (sp.prefix) params.set('prefix', sp.prefix)
    if (sp.status) params.set('status', sp.status)
    if (sp.q)      params.set('q', sp.q)
    if (p > 1)     params.set('page', String(p))
    const qs = params.toString()
    return `/documents${qs ? `?${qs}` : ''}`
  }

  return (
    <div className="p-8 max-w-5xl mx-auto fade-up">
      {/* Header */}
      {/* Back to Dashboard */}
      <Link href="/dashboard" className="back-link inline-flex items-center gap-1.5 text-xs font-medium mb-6">
        ← Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Documents
          </p>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>All Documents</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} document{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Link href="/new" className="btn-primary">
          <PlusCircle size={15} />
          New Document
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <form className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Search control number or title…"
              className="field-input pl-8 text-xs"
            />
          </div>
          <button type="submit" className="btn-primary text-xs px-3 py-2">Search</button>
        </form>

        {/* Prefix pills */}
        <div className="flex gap-1.5">
          {(['', 'TR', 'TA', 'AS'] as const).map(p => {
            const active = sp.prefix === p || (!sp.prefix && !p)
            return (
              <Link
                key={p}
                href={p ? `/documents?prefix=${p}` : '/documents'}
                className="px-3 py-1.5 text-xs font-bold rounded-lg transition-all"
                style={{
                  background: active ? 'var(--brand-blue)' : 'var(--bg-subtle)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: active ? 'var(--brand-blue)' : 'var(--border)',
                }}
              >
                {p || 'All'}
              </Link>
            )
          })}
        </div>

        {/* Status pills */}
        <div className="flex gap-1.5">
          {[
            { key: '', label: 'All' },
            { key: 'draft', label: 'Draft' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'approved', label: 'Approved' },
          ].map(s => {
            const active = sp.status === s.key || (!sp.status && !s.key)
            return (
              <Link
                key={s.key}
                href={`/documents?${s.key ? `status=${s.key}` : ''}${sp.prefix ? `&prefix=${sp.prefix}` : ''}`}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all"
                style={{
                  background: active ? '#d4870a' : 'var(--bg-subtle)',
                  color: active ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: active ? '#d4870a' : 'var(--border)',
                }}
              >
                {s.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={36} className="mx-auto mb-3" style={{ color: 'var(--border)' }} />
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No documents found.</p>
            <Link href="/new" className="text-sm hover:underline mt-1 inline-block" style={{ color: 'var(--brand-blue)' }}>
              Create one →
            </Link>
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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id} className="group">
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
                    <div className="flex flex-col gap-0.5">
                      <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded w-fit ${doc.doc_prefix === 'TR' ? 'pill-tr' : doc.doc_prefix === 'TA' ? 'pill-ta' : 'pill-as'}`}>
                        {doc.doc_type}
                      </span>
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {DOC_META[doc.doc_type as DocType]?.name}
                      </span>
                    </div>
                  </td>
                  <td className="max-w-[200px]">
                    <span className="truncate block text-xs" style={{ color: 'var(--text-primary)' }}>
                      {doc.title || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Untitled</span>}
                    </span>
                  </td>
                  <td><span className={`badge badge-${doc.status}`}>{doc.status}</span></td>
                  <td className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDateTime(doc.updated_at)}
                  </td>
                  <td>
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link href={`/documents/${doc.id}`} className="text-xs font-medium hover:underline" style={{ color: 'var(--brand-blue)' }}>
                        View
                      </Link>
                      <DeleteDocButton id={doc.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {(page > 1 || hasNext) && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Page {page} · showing {filtered.length} document{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="btn-outline flex items-center gap-1 text-xs px-3 py-1.5">
                <ChevronLeft size={12} /> Previous
              </Link>
            )}
            {hasNext && (
              <Link href={pageUrl(page + 1)} className="btn-outline flex items-center gap-1 text-xs px-3 py-1.5">
                Next <ChevronRight size={12} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
// FILE: app/documents/[id]/page.tsx
import { fetchDocument } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { DOC_META } from '@/types/documents'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft, Calendar, Hash } from 'lucide-react'
import StatusChanger from '@/components/ui/StatusChanger'
import ReportGenerator from '@/components/ui/ReportGenerator'

interface Props { params: Promise<{ id: string }> }

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params
  const doc = await fetchDocument(id)
  if (!doc) notFound()

  const meta = DOC_META[doc.doc_type]
  const photos = doc.photos ?? []
  const data = doc.form_data ?? {}

  const prefixClass = doc.doc_prefix === 'TR' ? 'pill-tr' : doc.doc_prefix === 'TA' ? 'pill-ta' : 'pill-as'

  return (
    <div className="p-8 max-w-4xl mx-auto fade-up">
      {/* Back */}
      <Link
        href="/documents"
        className="inline-flex items-center gap-1.5 text-xs font-medium mb-6 back-link"
      >
        <ArrowLeft size={12} /> Back to Documents
      </Link>

      {/* Header card */}
      <div className="card p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded ${prefixClass}`}>
                {doc.doc_type}
              </span>
              <span className="flex items-center gap-1 font-mono text-xs font-bold" style={{ color: 'var(--brand-blue)' }}>
                <Hash size={10} />
                {doc.control_number}
              </span>
              <span className={`badge badge-${doc.status}`}>{doc.status}</span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight mb-2" style={{ color: 'var(--text-primary)' }}>
              {doc.title || 'Untitled Document'}
            </h1>

            {/* Meta row */}
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span className="font-medium">{meta?.name}</span>
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Calendar size={11} />
                Updated {formatDateTime(doc.updated_at)}
              </span>
            </div>
          </div>

          {/* Status changer */}
          <div className="flex-shrink-0">
            <StatusChanger docId={doc.id} currentStatus={doc.status} />
          </div>
        </div>
      </div>

      {/* Form data */}
      <div className="card overflow-hidden mb-6">
        <div className="card-header"><h2>Document Data</h2></div>
        <div className="p-6">
          <DataGrid data={data} />
        </div>
      </div>

      {/* AI Report */}
      <ReportGenerator doc={doc} />

      {/* Photos */}
      {photos.length > 0 && (
        <div className="card overflow-hidden mt-6">
          <div className="card-header">
            <h2>Attachments ({photos.length})</h2>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {(photos as Array<{ id: string; dataUrl: string; name: string; caption: string }>).map((ph, i) => {
              const isImg = ph.dataUrl?.startsWith('data:image')
              return (
                <div key={ph.id ?? i} className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="aspect-[4/3] flex items-center justify-center overflow-hidden" style={{ background: 'var(--bg-subtle)' }}>
                    {isImg
                      ? <img src={ph.dataUrl} alt={ph.name} className="w-full h-full object-cover" />
                      : <div className="text-3xl">📄</div>}
                  </div>
                  <div className="p-2.5">
                    <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{ph.name}</p>
                    {ph.caption && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{ph.caption}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function DataGrid({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(([, v]) => {
    if (v === null || v === undefined || v === '') return false
    if (Array.isArray(v) && v.length === 0) return false
    return true
  })

  if (entries.length === 0) return (
    <p className="text-sm italic" style={{ color: 'var(--text-muted)' }}>No form data recorded.</p>
  )

  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-4">
      {entries.map(([key, val]) => {
        const label = key.replace(/^[a-z]+_/, '').replace(/_/g, ' ').replace(/\w/g, c => c.toUpperCase())
        const isComplex = typeof val === 'object'

        if (isComplex) {
          return (
            <div key={key} className="col-span-2 pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <dt className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>{label}</dt>
              <dd>
                {Array.isArray(val) ? (
                  <ul className="space-y-1">
                    {(val as unknown[]).map((v, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: 'var(--brand-blue)' }} className="mt-0.5">•</span>
                        {typeof v === 'object' && v !== null
                          ? <pre className="text-xs p-2 rounded overflow-x-auto" style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>{JSON.stringify(v, null, 2)}</pre>
                          : String(v)
                        }
                      </li>
                    ))}
                  </ul>
                ) : (
                  <pre className="text-xs p-3 rounded overflow-x-auto" style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                    {JSON.stringify(val, null, 2)}
                  </pre>
                )}
              </dd>
            </div>
          )
        }

        return (
          <div key={key} className="pb-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <dt className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>{label}</dt>
            <dd className="text-sm" style={{ color: 'var(--text-primary)' }}>{String(val)}</dd>
          </div>
        )
      })}
    </div>
  )
}
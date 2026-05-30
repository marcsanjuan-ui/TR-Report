import { fetchDocument } from '@/lib/actions'
import { notFound } from 'next/navigation'
import { DOC_META, STATUS_COLORS } from '@/types/documents'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import StatusChanger from '@/components/ui/StatusChanger'

interface Props { params: Promise<{ id: string }> }

export default async function DocumentDetailPage({ params }: Props) {
  const { id } = await params
  const doc = await fetchDocument(id)
  if (!doc) notFound()

  const meta = DOC_META[doc.doc_type]
  const photos = doc.photos ?? []
  const data = doc.form_data ?? {}

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back + header */}
      <div className="mb-6">
        <Link href="/documents" className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 mb-4 transition-colors">
          <ArrowLeft size={12} /> Back to Documents
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold font-mono px-2 py-0.5 rounded"
                style={{
                  background: doc.doc_prefix === 'TR' ? '#e8f0fe' : doc.doc_prefix === 'TA' ? '#fff3cd' : '#fde8e8',
                  color: doc.doc_prefix === 'TR' ? '#1a56c4' : doc.doc_prefix === 'TA' ? '#856404' : '#a02f22'
                }}
              >
                {doc.doc_type}
              </span>
              <span className="font-mono text-sm text-blue-700 font-bold">{doc.control_number}</span>
            </div>
            <h1 className="text-xl font-bold text-[#1f3864]">{doc.title || 'Untitled Document'}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{meta?.name} · Updated {formatDateTime(doc.updated_at)}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusChanger docId={doc.id} currentStatus={doc.status} />
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[doc.status as keyof typeof STATUS_COLORS] ?? ''}`}>
              {doc.status}
            </span>
          </div>
        </div>
      </div>

      {/* Form data display */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#f8f9fc' }}>
          <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Document Data</h2>
        </div>
        <div className="p-5">
          <DataGrid data={data} />
        </div>
      </div>

      {/* Photos */}
      {photos.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100" style={{ background: '#f8f9fc' }}>
            <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">Attachments ({photos.length})</h2>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {(photos as Array<{ id: string; dataUrl: string; name: string; caption: string }>).map((ph, i) => {
              const isImg = ph.dataUrl?.startsWith('data:image')
              return (
                <div key={ph.id ?? i} className="border border-gray-200 rounded overflow-hidden">
                  <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
                    {isImg
                      ? <img src={ph.dataUrl} alt={ph.name} className="w-full h-full object-cover" />
                      : <div className="text-3xl">📄</div>}
                  </div>
                  <div className="p-2">
                    <p className="text-[9px] text-gray-400 truncate">{ph.name}</p>
                    {ph.caption && <p className="text-[10px] text-gray-600 mt-0.5">{ph.caption}</p>}
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

  if (entries.length === 0) return <p className="text-sm text-gray-400 italic">No form data recorded.</p>

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-3">
      {entries.map(([key, val]) => {
        const label = key.replace(/^[a-z]+_/, '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        const isComplex = typeof val === 'object'

        if (isComplex) {
          return (
            <div key={key} className="col-span-2 border-b border-gray-50 pb-2">
              <dt className="text-xs font-semibold text-gray-500 mb-1">{label}</dt>
              <dd>
                {Array.isArray(val) ? (
                  <ul className="text-xs text-gray-700 space-y-0.5">
                    {(val as unknown[]).map((v, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {typeof v === 'object' && v !== null
                          ? <pre className="text-xs text-gray-600 bg-gray-50 p-1 rounded overflow-x-auto">{JSON.stringify(v, null, 2)}</pre>
                          : String(v)
                        }
                      </li>
                    ))}
                  </ul>
                ) : (
                  <pre className="text-xs text-gray-600 bg-gray-50 p-2 rounded overflow-x-auto">{JSON.stringify(val, null, 2)}</pre>
                )}
              </dd>
            </div>
          )
        }

        return (
          <div key={key} className="border-b border-gray-50 pb-2">
            <dt className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</dt>
            <dd className="text-sm text-gray-800">{String(val)}</dd>
          </div>
        )
      })}
    </div>
  )
}
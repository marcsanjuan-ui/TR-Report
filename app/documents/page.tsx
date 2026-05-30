import { fetchDocuments } from '@/lib/actions'
import { DOC_META, STATUS_COLORS, DocType, DocPrefix } from '@/types/documents'
import { formatDateTime } from '@/lib/utils'
import Link from 'next/link'
import { Search, PlusCircle, FileText } from 'lucide-react'
import DeleteDocButton from '@/components/ui/DeleteDocButton'

interface Props {
  searchParams: Promise<{
    type?: string
    prefix?: string
    status?: string
    q?: string
  }>
}

type DocumentRow = {
  id: string
  control_number: string
  doc_prefix: DocPrefix | string
  doc_type: DocType | string
  title?: string | null
  status: string
  updated_at: string
}

export default async function DocumentsPage({ searchParams }: Props) {
  const sp = await searchParams

  const docs = (await fetchDocuments({
    type: sp.type as DocType | undefined,
    status: sp.status,
    search: sp.q,
    limit: 50,
  })) as DocumentRow[]

  const prefixFilter = sp.prefix

  const filtered: DocumentRow[] = prefixFilter
    ? docs.filter((doc: DocumentRow) => doc.doc_prefix === prefixFilter)
    : docs

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1f3864] tracking-wide uppercase">
            All Documents
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {filtered.length} document{filtered.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <Link
          href="/new"
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold text-white"
          style={{ background: '#2e5490' }}
        >
          <PlusCircle size={15} />
          New Document
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-5 flex flex-wrap gap-3 items-center">
        {/* Search */}
        <form className="flex items-center gap-2 flex-1 min-w-48">
          <div className="relative flex-1">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Search control number or title…"
              className="field-input pl-8 text-xs"
            />
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-semibold rounded text-white"
            style={{ background: '#2e5490' }}
          >
            Search
          </button>
        </form>

        {/* Prefix filter */}
        <div className="flex gap-1">
          {(['', 'TR', 'TA', 'AS'] as const).map((p) => (
            <Link
              key={p}
              href={p ? `/documents?prefix=${p}` : '/documents'}
              className={`px-3 py-1.5 text-xs font-bold rounded transition-colors ${
                prefixFilter === p || (!prefixFilter && !p)
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                prefixFilter === p || (!prefixFilter && !p)
                  ? { background: '#2e5490' }
                  : {}
              }
            >
              {p || 'All'}
            </Link>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-1">
          {[
            { key: '', label: 'All Status' },
            { key: 'draft', label: 'Draft' },
            { key: 'submitted', label: 'Submitted' },
            { key: 'approved', label: 'Approved' },
          ].map((s) => (
            <Link
              key={s.key}
              href={`/documents?${s.key ? `status=${s.key}` : ''}${
                sp.prefix ? `&prefix=${sp.prefix}` : ''
              }`}
              className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors ${
                sp.status === s.key || (!sp.status && !s.key)
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              style={
                sp.status === s.key || (!sp.status && !s.key)
                  ? { background: '#d4870a' }
                  : {}
              }
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-400">No documents found.</p>
            <Link
              href="/new"
              className="text-sm text-blue-500 hover:underline mt-1 inline-block"
            >
              Create one →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr
                className="border-b border-gray-100"
                style={{ background: '#f8f9fc' }}
              >
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Control #
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((doc: DocumentRow) => (
                <tr
                  key={doc.id}
                  className="border-b border-gray-50 hover:bg-blue-50/40 transition-colors group"
                >
                  <td className="px-5 py-3">
                    <Link
                      href={`/documents/${doc.id}`}
                      className="font-mono text-xs text-blue-600 hover:underline"
                    >
                      {doc.control_number}
                    </Link>
                  </td>

                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span
                        className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded w-fit"
                        style={{
                          background:
                            doc.doc_prefix === 'TR'
                              ? '#e8f0fe'
                              : doc.doc_prefix === 'TA'
                                ? '#fff3cd'
                                : '#fde8e8',
                          color:
                            doc.doc_prefix === 'TR'
                              ? '#1a56c4'
                              : doc.doc_prefix === 'TA'
                                ? '#856404'
                                : '#a02f22',
                        }}
                      >
                        {doc.doc_type}
                      </span>

                      <span className="text-[10px] text-gray-400">
                        {DOC_META[doc.doc_type as DocType]?.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-3 text-xs text-gray-700 max-w-[200px] truncate">
                    {doc.title || (
                      <span className="text-gray-300 italic">Untitled</span>
                    )}
                  </td>

                  <td className="px-3 py-3">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        STATUS_COLORS[
                          doc.status as keyof typeof STATUS_COLORS
                        ] ?? 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>

                  <td className="px-3 py-3 text-xs text-gray-400 font-mono">
                    {formatDateTime(doc.updated_at)}
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/documents/${doc.id}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
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
    </div>
  )
}
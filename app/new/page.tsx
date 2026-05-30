import { DOC_META, TR_TYPES, TA_TYPES, AS_TYPES, DocType } from '@/types/documents'
import FormContainer from '@/components/forms/FormContainer'

interface Props {
  searchParams: Promise<{ type?: string }>
}

export default async function NewDocumentPage({ searchParams }: Props) {
  const sp = await searchParams
  const type = sp.type as DocType | undefined

  if (type && DOC_META[type]) {
    return <FormContainer type={type} />
  }

  return <TypeSelector />
}

function TypeSelector() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1f3864] tracking-wide uppercase">New Document</h1>
        <p className="text-sm text-gray-500 mt-1">Select a document type to begin</p>
      </div>

      {/* TR Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2.5 py-1 text-xs font-bold rounded font-mono" style={{ background: '#e8f0fe', color: '#1a56c4' }}>TR</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Technical Records</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TR_TYPES.map(t => <TypeCard key={t} type={t} />)}
        </div>
      </div>

      {/* TA Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2.5 py-1 text-xs font-bold rounded font-mono" style={{ background: '#fff3cd', color: '#856404' }}>TA</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Announcements &amp; Memos</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {TA_TYPES.map(t => <TypeCard key={t} type={t} />)}
        </div>
      </div>

      {/* AS Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-2.5 py-1 text-xs font-bold rounded font-mono" style={{ background: '#fde8e8', color: '#a02f22' }}>AS</span>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">After Sales</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {AS_TYPES.map(t => <TypeCard key={t} type={t} />)}
        </div>
      </div>
    </div>
  )
}

function TypeCard({ type }: { type: DocType }) {
  const meta = DOC_META[type]
  const prefixStyle = {
    TR: { bg: '#e8f0fe', color: '#1a56c4' },
    TA: { bg: '#fff3cd', color: '#856404' },
    AS: { bg: '#fde8e8', color: '#a02f22' },
  }[meta.prefix]

  return (
    <a
      href={`/new?type=${type}`}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 block"
    >
      <span
        className="inline-block text-[10px] font-bold font-mono px-2 py-0.5 rounded mb-2"
        style={{ background: prefixStyle.bg, color: prefixStyle.color }}
      >
        {meta.prefix}
      </span>
      <div className="text-sm font-bold text-[#1f3864] font-mono mb-1">{type}</div>
      <div className="text-xs font-semibold text-gray-800 mb-1">{meta.name}</div>
      <div className="text-xs text-gray-400 leading-relaxed">{meta.desc}</div>
    </a>
  )
}

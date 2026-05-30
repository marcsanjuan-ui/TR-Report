// ─── Document type metadata ───────────────────────────────────────────
export type DocPrefix = 'TR' | 'TA' | 'AS'

export type DocType =
  // TR
  | 'PPL' | 'PRD' | 'PSM' | 'PRV' | 'PTT' | 'PRP' | 'TRP'
  // TA
  | 'TAN' | 'IDM'
  // AS
  | 'CRR' | 'RPR' | 'RFD'

export type DocStatus = 'draft' | 'submitted' | 'approved' | 'archived'

export interface Document {
  id: string
  control_number: string
  doc_type: DocType
  doc_prefix: DocPrefix
  title: string
  status: DocStatus
  form_data: Record<string, unknown>
  photos: PhotoRecord[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface PhotoRecord {
  id: string
  name: string
  caption: string
  ctx: string
  dataUrl: string
}

// ─── Form config ──────────────────────────────────────────────────────
export interface DocMeta {
  type: DocType
  prefix: DocPrefix
  code: string
  name: string
  desc: string
}

export const DOC_META: Record<DocType, DocMeta> = {
  PPL: { type: 'PPL', prefix: 'TR', code: 'PPL', name: 'Project Plan',          desc: 'Must-know planning info for a project' },
  PRD: { type: 'PRD', prefix: 'TR', code: 'PRD', name: 'Production Order',       desc: 'Production with BOM — for store, client, or company' },
  PSM: { type: 'PSM', prefix: 'TR', code: 'PSM', name: 'Project Summary',        desc: 'Milestone updates or post-project wrap-up' },
  PRV: { type: 'PRV', prefix: 'TR', code: 'PRV', name: 'Product Review',         desc: 'Documentation of new, upcoming, or existing products' },
  PTT: { type: 'PTT', prefix: 'TR', code: 'PTT', name: 'Product Testing',        desc: 'Testing records linked to a product review' },
  PRP: { type: 'PRP', prefix: 'TR', code: 'PRP', name: 'Product Report',         desc: 'Post-evaluation — issues, complaints, feedback' },
  TRP: { type: 'TRP', prefix: 'TR', code: 'TRP', name: 'Technical Report',       desc: 'Recurring issues, trend analysis, escalations' },
  TAN: { type: 'TAN', prefix: 'TA', code: 'TAN', name: 'Announcement',           desc: 'Targeted announcements by audience' },
  IDM: { type: 'IDM', prefix: 'TA', code: 'IDM', name: 'Interdepartmental Memo', desc: 'Formal coordination between departments' },
  CRR: { type: 'CRR', prefix: 'AS', code: 'CRR', name: 'Customer Report',        desc: 'Incoming complaint — customer details and issue' },
  RPR: { type: 'RPR', prefix: 'AS', code: 'RPR', name: 'Repair',                 desc: 'Repair record — parts, technician, outcome' },
  RFD: { type: 'RFD', prefix: 'AS', code: 'RFD', name: 'Refund',                 desc: 'Refund request, approval, and processing' },
}

export const TR_TYPES: DocType[] = ['PPL', 'PRD', 'PSM', 'PRV', 'PTT', 'PRP', 'TRP']
export const TA_TYPES: DocType[] = ['TAN', 'IDM']
export const AS_TYPES: DocType[] = ['CRR', 'RPR', 'RFD']

export function getPrefix(type: DocType): DocPrefix {
  if (TR_TYPES.includes(type)) return 'TR'
  if (TA_TYPES.includes(type)) return 'TA'
  return 'AS'
}

export function formatControlNumber(
  prefix: DocPrefix,
  type: DocType,
  seq: number,
  audience?: string
): string {
  const now = new Date()
  const dd = String(now.getDate()).padStart(2, '0')
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const yy = String(now.getFullYear()).slice(-2)
  const seqStr = String(seq).padStart(5, '0')
  if (type === 'TAN') {
    return `TA-${audience || 'ALL'}-${dd}${mm}${yy}-${seqStr}`
  }
  return `${prefix}-${type}-${dd}${mm}${yy}-${seqStr}`
}

export const STATUS_LABELS: Record<DocStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
  archived: 'Archived',
}

export const STATUS_COLORS: Record<DocStatus, string> = {
  draft:     'bg-amber-100 text-amber-800',
  submitted: 'bg-blue-100 text-blue-800',
  approved:  'bg-emerald-100 text-emerald-800',
  archived:  'bg-gray-100 text-gray-600',
}

export const PREFIX_COLORS: Record<DocPrefix, string> = {
  TR: 'bg-blue-100 text-blue-700',
  TA: 'bg-amber-100 text-amber-700',
  AS: 'bg-red-100 text-red-700',
}

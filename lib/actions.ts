'use server'

import { createClient } from '@/lib/supabase/server'
import { DocType, getPrefix, formatControlNumber, Document } from '@/types/documents'
import { revalidatePath } from 'next/cache'

// ─── Generate control number via Supabase sequence ───
export async function generateControlNumber(type: DocType, audience?: string): Promise<string> {
  const supabase = await createClient()
  const prefix = getPrefix(type)
  const key = `${prefix}_${type}`

  // Increment sequence atomically
  const { data, error } = await supabase.rpc('increment_sequence', { seq_key: key })
  const seq = data ?? 1

  return formatControlNumber(prefix, type, seq, audience)
}

// ─── Create document ───
export async function createDocument(params: {
  type: DocType
  controlNumber: string
  title: string
  formData: Record<string, unknown>
  photos: unknown[]
  creatorName?: string
  status?: 'draft' | 'submitted'
}) {
  const supabase = await createClient()

  const prefix = getPrefix(params.type)

  const { data, error } = await supabase
    .from('documents')
    .insert({
      control_number: params.controlNumber,
      doc_type: params.type,
      doc_prefix: prefix,
      title: params.title,
      form_data: params.formData,
      photos: params.photos,
      created_by: String(params.creatorName ?? 'Unknown').slice(0, 100),
      status: params.status ?? 'draft',
    })
    .select()
    .single()

  if (error) throw error
  revalidatePath('/documents')
  return data
}

// ─── Update document ───
export async function updateDocument(id: string, params: {
  title?: string
  formData?: Record<string, unknown>
  photos?: unknown[]
  status?: string
}) {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}
  if (params.title !== undefined) updates.title = params.title
  if (params.formData !== undefined) updates.form_data = params.formData
  if (params.photos !== undefined) updates.photos = params.photos
  if (params.status !== undefined) updates.status = params.status

  const { data, error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/documents')
  revalidatePath(`/documents/${id}`)
  return data
}

// ─── Fetch all documents (list) ───
export async function fetchDocuments(params?: {
  type?: DocType
  status?: string
  search?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('documents')
    .select('id, control_number, doc_type, doc_prefix, title, status, created_at, updated_at, created_by, photos')
    .order('created_at', { ascending: false })

  if (params?.type) query = query.eq('doc_type', params.type)
  if (params?.status) query = query.eq('status', params.status)
  if (params?.search) query = query.or(`title.ilike.%${params.search}%,control_number.ilike.%${params.search}%`)
  if (params?.limit) query = query.limit(params.limit)
  if (params?.offset) query = query.range(params.offset, (params.offset + (params.limit || 20)) - 1)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

// ─── Fetch single document ───
export async function fetchDocument(id: string): Promise<Document | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

// ─── Delete document ───
export async function deleteDocument(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/documents')
}

// ─── Stats for dashboard ───
export async function fetchStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .select('doc_prefix, status')

  if (error) return { total: 0, byPrefix: {}, byStatus: {} }

  const total = data.length
  const byPrefix: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  data.forEach(d => {
    byPrefix[d.doc_prefix] = (byPrefix[d.doc_prefix] || 0) + 1
    byStatus[d.status] = (byStatus[d.status] || 0) + 1
  })

  return { total, byPrefix, byStatus }
}

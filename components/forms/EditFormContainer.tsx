'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Document, DOC_META } from '@/types/documents'
import { updateDocument } from '@/lib/actions'
import { FORM_CONFIGS, FormConfig } from './formConfigs'
import StepForm from './StepForm'
import DocForm from './DocForm'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'

interface Props { doc: Document }

export default function EditFormContainer({ doc }: Props) {
  const router = useRouter()
  const meta = DOC_META[doc.doc_type]
  const config: FormConfig = FORM_CONFIGS[doc.doc_type]

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>(
    (doc.form_data as Record<string, unknown>) ?? {}
  )
  const [photos, setPhotos] = useState<unknown[]>(doc.photos ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const updateField = useCallback((id: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }, [])

  const isStepForm = config.type === 'step'
  const totalSteps = isStepForm ? (config.steps?.length ?? 1) : 1

  async function handleSave() {
    setSaving(true)
    setError('')
    try {
      const titleKey = getTitleKey(doc.doc_type)
      const title = (formData[titleKey] as string) || doc.control_number

      await updateDocument(doc.id, { title, formData, photos })
      router.push(`/documents/${doc.id}`)
      router.refresh()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <div
        className="sticky top-0 z-30 border-b px-6 py-3 flex items-center justify-between"
        style={{ background: '#1f3864', borderColor: '#2a4a7a' }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/documents/${doc.id}`)}
            className="text-xs text-blue-300 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft size={12} /> Back
          </button>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Edit — {meta.name}
            </h2>
            <p className="text-xs font-mono" style={{ color: '#8fa3cc' }}>
              {doc.control_number}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {error && <span className="text-xs text-red-300">{error}</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-1.5 text-xs font-semibold rounded text-white flex items-center gap-1.5 transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ background: '#2a7a4b' }}
          >
            {saving ? <Loader2 size={12} className="spin" /> : <Save size={12} />}
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Form body */}
      <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
        {isStepForm ? (
          <StepForm
            config={config}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            formData={formData}
            onFieldChange={updateField}
            photos={photos}
            onPhotosChange={setPhotos}
            type={doc.doc_type}
          />
        ) : (
          <DocForm
            config={config}
            formData={formData}
            onFieldChange={updateField}
            photos={photos}
            onPhotosChange={setPhotos}
            type={doc.doc_type}
          />
        )}
      </div>

      {/* Bottom nav for step forms */}
      {isStepForm && (
        <div
          className="sticky bottom-0 border-t px-6 py-3 flex items-center gap-3"
          style={{ background: '#1a2744', borderColor: '#24366a' }}
        >
          <span className="text-xs mr-auto font-mono" style={{ color: '#8fa3cc' }}>
            Step {currentStep + 1} / {totalSteps}
          </span>
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-white/20 text-white hover:bg-white/10 disabled:opacity-30"
          >
            ‹ Prev
          </button>
          {currentStep < totalSteps - 1 ? (
            <button
              onClick={() => setCurrentStep(s => Math.min(totalSteps - 1, s + 1))}
              className="px-4 py-1.5 text-xs font-semibold rounded text-white"
              style={{ background: '#d4870a' }}
            >
              Next ›
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold rounded text-white"
              style={{ background: '#2a7a4b' }}
            >
              {saving ? 'Saving…' : 'Save Changes ✓'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function getTitleKey(type: string): string {
  const map: Record<string, string> = {
    PPL: 'ppl_name', PRD: 'prd_proj_name', PSM: 'psm_proj_name',
    PRV: 'prv_name', PTT: 'ptt_prod_name', PRP: 'prp_prod_name',
    TRP: 'trp_prod_name', TAN: 'tan_title', IDM: 'idm_subject',
    CRR: 'crr_cust_name', RPR: 'rpr_cust_name', RFD: 'rfd_cust_name',
  }
  return map[type] ?? 'title'
}

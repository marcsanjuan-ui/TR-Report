'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DocType, DOC_META } from '@/types/documents'
import { createDocument, generateControlNumber } from '@/lib/actions'
import { FORM_CONFIGS, FormConfig } from './formConfigs'
import StepForm from './StepForm'
import DocForm from './DocForm'

interface Props { type: DocType }

export default function FormContainer({ type }: Props) {
  const router = useRouter()
  const meta = DOC_META[type]
  const config: FormConfig = FORM_CONFIGS[type]

  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<Record<string, unknown>>({})
  const [photos, setPhotos] = useState<unknown[]>([])
  const [controlNumber, setControlNumber] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Generate control number on mount
  useEffect(() => {
    generateControlNumber(type).then(setControlNumber)
  }, [type])

  // Auto-save to localStorage
  useEffect(() => {
    if (Object.keys(formData).length === 0) return
    localStorage.setItem(`draft_${type}`, JSON.stringify({ formData, photos }))
    setSaved(false)
  }, [formData, photos, type])

  // Restore from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`draft_${type}`)
    if (saved) {
      try {
        const { formData: fd, photos: ph } = JSON.parse(saved)
        setFormData(fd || {})
        setPhotos(ph || [])
      } catch {}
    }
  }, [type])

  const updateField = useCallback((id: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }, [])

  const isStepForm = config.type === 'step'
  const totalSteps = isStepForm ? (config.steps?.length ?? 1) : 1

  async function handleSave(status: 'draft' | 'submitted' = 'draft') {
    setSaving(true)
    setError('')
    try {
      const titleKey = getTitleKey(type)
      const title = (formData[titleKey] as string) || controlNumber

      const doc = await createDocument({
        type,
        controlNumber,
        title,
        formData,
        photos,
      })

      // Update status if submitting
      if (status === 'submitted') {
        // Could call updateDocument here
      }

      localStorage.removeItem(`draft_${type}`)
      router.push(`/documents/${doc.id}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top header */}
      <div className="sticky top-0 z-30 border-b px-6 py-3 flex items-center justify-between" style={{ background: '#1f3864', borderColor: '#2a4a7a' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/new')} className="text-xs text-blue-300 hover:text-white">← Back</button>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">{meta.name}</h2>
            <p className="text-xs" style={{ color: '#8fa3cc', fontFamily: 'IBM Plex Mono' }}>{meta.prefix} · Technical Record</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {controlNumber && (
            <span
              className="text-xs px-3 py-1 rounded font-mono"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#c8d8f8' }}
            >
              {controlNumber}
            </span>
          )}
          {error && <span className="text-xs text-red-300">{error}</span>}
          <button
            onClick={() => handleSave('draft')}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-semibold rounded border border-white/20 text-white hover:bg-white/10 transition-colors"
          >
            {saving ? 'Saving…' : '⬇ Save Draft'}
          </button>
          <button
            onClick={() => handleSave('submitted')}
            disabled={saving}
            className="px-3 py-1.5 text-xs font-semibold rounded text-white transition-colors hover:opacity-90"
            style={{ background: '#d4870a' }}
          >
            Submit →
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
            type={type}
          />
        ) : (
          <DocForm
            config={config}
            formData={formData}
            onFieldChange={updateField}
            photos={photos}
            onPhotosChange={setPhotos}
            type={type}
          />
        )}
      </div>

      {/* Bottom action bar */}
      {isStepForm && (
        <div className="sticky bottom-0 border-t px-6 py-3 flex items-center gap-3 no-print" style={{ background: '#1a2744', borderColor: '#24366a' }}>
          <span className="text-xs mr-auto font-mono" style={{ color: '#8fa3cc' }}>
            Step {currentStep + 1} / {totalSteps} · {controlNumber}
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
              onClick={() => handleSave('submitted')}
              disabled={saving}
              className="px-4 py-1.5 text-xs font-semibold rounded text-white"
              style={{ background: '#2a7a4b' }}
            >
              {saving ? 'Saving…' : 'Finish ✓'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function getTitleKey(type: DocType): string {
  const map: Partial<Record<DocType, string>> = {
    PPL: 'ppl_name', PRD: 'prd_proj_name', PSM: 'psm_proj_name',
    PRV: 'prv_name', PTT: 'ptt_prod_name', PRP: 'prp_prod_name',
    TRP: 'trp_prod_name', TAN: 'tan_title', IDM: 'idm_subject',
    CRR: 'crr_cust_name', RPR: 'rpr_cust_name', RFD: 'rfd_cust_name',
  }
  return map[type] ?? 'title'
}

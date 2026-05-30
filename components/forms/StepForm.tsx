'use client'

import { DocType } from '@/types/documents'
import { FormConfig } from './formConfigs'
import FieldRenderer from './FieldRenderer'
import BomTable from './BomTable'

interface Props {
  config: FormConfig
  currentStep: number
  onStepChange: (n: number) => void
  formData: Record<string, unknown>
  onFieldChange: (id: string, value: unknown) => void
  photos: unknown[]
  onPhotosChange: (p: unknown[]) => void
  type: DocType
}

export default function StepForm({ config, currentStep, onStepChange, formData, onFieldChange, photos, onPhotosChange, type }: Props) {
  const steps = config.steps ?? []
  const step = steps[currentStep]
  if (!step) return null

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Step pills nav */}
      <div className="flex border-b border-gray-100 bg-gray-50 overflow-x-auto">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => onStepChange(i)}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition-all whitespace-nowrap border-b-2 ${
              i === currentStep
                ? 'border-amber-500 text-[#1f3864]'
                : i < currentStep
                ? 'border-emerald-500 text-gray-500'
                : 'border-transparent text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
              i === currentStep ? 'bg-blue-700 text-white' : i < currentStep ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < currentStep ? '✓' : i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* Step content */}
      <div className="p-6">
        {step.sections.map((section, si) => (
          <div key={si} className="mb-8 last:mb-0">
            {section.title && (
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider px-3 py-1.5 rounded-sm mb-4" style={{ background: '#eef2fa', borderLeft: '3px solid #4472c4' }}>
                {section.title}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              {section.fields.map(field => (
                <div key={field.id} className={field.span === 2 ? 'col-span-2' : ''}>
                  <FieldRenderer
                    field={field}
                    value={formData[field.id]}
                    onChange={v => onFieldChange(field.id, v)}
                    photos={photos}
                    onPhotosChange={onPhotosChange}
                    ctx={field.id}
                    formData={formData}
                    onFormDataChange={onFieldChange}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

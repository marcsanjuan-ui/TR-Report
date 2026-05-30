'use client'

import { DocType } from '@/types/documents'
import { FormConfig } from './formConfigs'
import FieldRenderer from './FieldRenderer'

interface Props {
  config: FormConfig
  formData: Record<string, unknown>
  onFieldChange: (id: string, value: unknown) => void
  photos: unknown[]
  onPhotosChange: (p: unknown[]) => void
  type: DocType
}

export default function DocForm({ config, formData, onFieldChange, photos, onPhotosChange, type }: Props) {
  const sections = config.sections ?? []

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 space-y-8">
        {sections.map((section, si) => (
          <div key={si}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-lg font-bold text-[#1a2744] font-mono">{String(si + 1).padStart(2, '0')}</span>
              <h3 className="text-base font-bold text-[#1f3864] border-b border-[#d9e1f2] flex-1 pb-2">{section.title}</h3>
            </div>
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

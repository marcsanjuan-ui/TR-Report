'use client'

import { FieldDef } from './formConfigs'
import BomTable from './BomTable'
import PsmBomTable from './PsmBomTable'
import RprBomTable from './RprBomTable'
import TrpContainTable from './TrpContainTable'
import PhotoUpload from './PhotoUpload'

interface Props {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
  photos: unknown[]
  onPhotosChange: (p: unknown[]) => void
  ctx: string
  formData: Record<string, unknown>
  onFormDataChange: (id: string, v: unknown) => void
}

export default function FieldRenderer({ field, value, onChange, photos, onPhotosChange, ctx, formData, onFormDataChange }: Props) {
  const { type, id, label, required, placeholder, options, readOnly, hint } = field

  const Label = () => (
    <label className="block text-xs font-semibold text-gray-600 mb-1" style={{ letterSpacing: '.03em' }}>
      {label}{required && <span className="text-red-500 ml-0.5">★</span>}
    </label>
  )

  if (type === 'bom-table') {
    return (
      <div>
        <Label />
        <BomTable
          id={id}
          rows={(value as never[]) || []}
          onChange={onChange}
          addonRows={(formData[id + '_addon'] as never[]) || []}
          onAddonChange={v => onFormDataChange(id + '_addon', v)}
        />
      </div>
    )
  }

  if (type === 'addon-table') return null // handled by bom-table

  if (type === 'psm-bom-table') {
    return (
      <div>
        <Label />
        <PsmBomTable rows={(value as unknown[]) || []} onChange={onChange} />
      </div>
    )
  }

  if (type === 'rpr-bom-table') {
    return (
      <div>
        <Label />
        <RprBomTable rows={(value as unknown[]) || []} onChange={onChange} />
      </div>
    )
  }

  if (type === 'trp-contain-table') {
    return (
      <div>
        <Label />
        <TrpContainTable rows={(value as unknown[]) || []} onChange={onChange} />
      </div>
    )
  }

  if (type === 'file') {
    return (
      <div>
        <Label />
        <PhotoUpload ctx={ctx} photos={photos} onPhotosChange={onPhotosChange} />
      </div>
    )
  }

  if (type === 'checkbox-group') {
    const checked = (value as string[]) || []
    return (
      <div>
        <Label />
        <div className="grid grid-cols-2 gap-2">
          {(options || []).map(opt => (
            <label key={opt} className="flex items-start gap-2 p-2 border border-gray-200 rounded cursor-pointer hover:bg-blue-50 transition-colors">
              <input
                type="checkbox"
                className="mt-0.5 accent-blue-600"
                checked={checked.includes(opt)}
                onChange={e => {
                  const next = e.target.checked
                    ? [...checked, opt]
                    : checked.filter(x => x !== opt)
                  onChange(next)
                }}
              />
              <span className="text-xs text-gray-700 leading-snug">{opt}</span>
            </label>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'reference') {
    return (
      <div>
        <Label />
        <div className="relative">
          <input
            className="field-input pr-14"
            value={(value as string) || ''}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {field.referenceType && (
            <span
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded"
              style={{ background: '#eef2fa', border: '1px solid #d9e1f2', color: '#2e5490' }}
            >
              {field.referenceType}
            </span>
          )}
        </div>
        {hint && <p className="text-xs italic text-gray-400 mt-1">{hint}</p>}
      </div>
    )
  }

  if (type === 'select') {
    return (
      <div>
        <Label />
        <select
          className="field-input"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          style={{ cursor: 'pointer' }}
        >
          <option value="">— Select —</option>
          {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        {hint && <p className="text-xs italic text-gray-400 mt-1">{hint}</p>}
      </div>
    )
  }

  if (type === 'textarea') {
    return (
      <div>
        <Label />
        <textarea
          className="field-input"
          rows={4}
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ resize: 'vertical', lineHeight: 1.6 }}
        />
        {hint && <p className="text-xs italic text-gray-400 mt-1">{hint}</p>}
      </div>
    )
  }

  if (type === 'date') {
    return (
      <div>
        <Label />
        <input
          type="date"
          className="field-input"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          readOnly={readOnly}
        />
      </div>
    )
  }

  if (type === 'number') {
    return (
      <div>
        <Label />
        <input
          type="number"
          className="field-input"
          value={(value as string) || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          min={0}
          step="0.01"
          readOnly={readOnly}
          style={readOnly ? { background: '#f4f5f7', cursor: 'not-allowed' } : {}}
        />
        {hint && <p className="text-xs italic text-gray-400 mt-1">{hint}</p>}
      </div>
    )
  }

  // Default: text
  return (
    <div>
      <Label />
      <input
        type="text"
        className="field-input"
        value={(value as string) || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        readOnly={readOnly}
        style={readOnly ? { background: '#f4f5f7', cursor: 'not-allowed' } : {}}
      />
      {hint && <p className="text-xs italic text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}



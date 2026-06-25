'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface PsmRow { id: string; item: string; sku: string; estQty: number; actQty: number; unit: string; estCost: number; actCost: number; notes: string }

const newRow = (): PsmRow => ({ id: Math.random().toString(36).slice(2), item: '', sku: '', estQty: 0, actQty: 0, unit: 'pcs', estCost: 0, actCost: 0, notes: '' })
const UNITS = ['pcs', 'kg', 'm', 'L', 'set', 'lot']

export default function PsmBomTable({ rows, onChange }: { rows: unknown[]; onChange: (r: unknown[]) => void }) {
  const [local, setLocal] = useState<PsmRow[]>(rows.length > 0 ? rows as PsmRow[] : [newRow()])
  useEffect(() => { onChange(local) }, [local, onChange])

  const update = (i: number, field: keyof PsmRow, val: unknown) =>
    setLocal(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const estTotal = local.reduce((s, r) => s + Number(r.estQty) * Number(r.estCost), 0)
  const actTotal = local.reduce((s, r) => s + Number(r.actQty) * Number(r.actCost), 0)
  const variance = actTotal - estTotal

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1f3864' }}>
              {['Item', 'SKU', 'Est Qty', 'Act Qty', 'Unit', 'Est Cost', 'Act Cost', 'Variance', 'Notes', ''].map(h => (
                <th key={h} className="px-2 py-2 text-left text-white font-semibold text-[10px] tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {local.map((r, i) => {
              const est = Number(r.estQty) * Number(r.estCost)
              const act = Number(r.actQty) * Number(r.actCost)
              const v = act - est
              return (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="px-1"><input className="bom-input w-28" value={r.item} onChange={e => update(i, 'item', e.target.value)} placeholder="Item" /></td>
                  <td className="px-1"><input className="bom-input w-20" value={r.sku} onChange={e => update(i, 'sku', e.target.value)} placeholder="SKU" /></td>
                  <td className="px-1"><input className="bom-input w-12" type="number" min="0" value={r.estQty || ''} onChange={e => update(i, 'estQty', e.target.value)} /></td>
                  <td className="px-1"><input className="bom-input w-12" type="number" min="0" value={r.actQty || ''} onChange={e => update(i, 'actQty', e.target.value)} /></td>
                  <td className="px-1">
                    <select className="bom-input w-14" value={r.unit} onChange={e => update(i, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-1"><input className="bom-input w-20" type="number" min="0" step="0.01" value={r.estCost || ''} onChange={e => update(i, 'estCost', e.target.value)} /></td>
                  <td className="px-1"><input className="bom-input w-20" type="number" min="0" step="0.01" value={r.actCost || ''} onChange={e => update(i, 'actCost', e.target.value)} /></td>
                  <td className="px-2 font-mono text-[10px] whitespace-nowrap" style={{ color: v > 0 ? '#c8392b' : v < 0 ? '#2a7a4b' : '#666', background: '#f4f5f7' }}>
                    {v !== 0 ? (v > 0 ? '+' : '') + v.toFixed(2) : '—'}
                  </td>
                  <td className="px-1"><input className="bom-input w-24" value={r.notes} onChange={e => update(i, 'notes', e.target.value)} placeholder="Notes" /></td>
                  <td className="px-1"><button onClick={() => setLocal(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => setLocal(p => [...p, newRow()])} className="text-xs font-semibold text-blue-600 px-3 py-1.5 border border-dashed border-blue-300 rounded hover:bg-blue-50">+ Add Item</button>
      <div className="flex justify-end gap-6 px-4 py-2 rounded border text-xs" style={{ background: '#eef2fa', borderColor: '#d9e1f2' }}>
        <div><span className="text-gray-500 font-semibold">Est Total: </span><span className="font-mono font-bold text-[#1f3864]">{formatCurrency(estTotal)}</span></div>
        <div><span className="text-gray-500 font-semibold">Act Total: </span><span className="font-mono font-bold text-[#1f3864]">{formatCurrency(actTotal)}</span></div>
        <div><span className="text-gray-500 font-semibold">Variance: </span><span className="font-mono font-bold" style={{ color: variance > 0 ? '#c8392b' : variance < 0 ? '#2a7a4b' : '#1f3864' }}>{variance >= 0 ? '+' : ''}{formatCurrency(variance)}</span></div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface RprRow { id: string; part: string; sku: string; qty: number; unit: string; cost: number }
const newRow = (): RprRow => ({ id: Math.random().toString(36).slice(2), part: '', sku: '', qty: 0, unit: 'pcs', cost: 0 })

export default function RprBomTable({ rows, onChange }: { rows: unknown[]; onChange: (r: unknown[]) => void }) {
  const [local, setLocal] = useState<RprRow[]>(rows.length > 0 ? rows as RprRow[] : [newRow()])
  useEffect(() => { onChange(local) }, [local])

  const update = (i: number, field: keyof RprRow, val: unknown) =>
    setLocal(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  const total = local.reduce((s, r) => s + Number(r.qty) * Number(r.cost), 0)

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1f3864' }}>
              {['Part Name', 'SKU', 'Qty', 'Unit', 'Cost (PHP)', 'Total', ''].map(h => (
                <th key={h} className="px-2 py-2 text-left text-white font-semibold text-[10px] tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {local.map((r, i) => {
              const t = Number(r.qty) * Number(r.cost)
              return (
                <tr key={r.id} className="border-b border-gray-100">
                  <td className="px-1"><input className="bom-input w-32" value={r.part} onChange={e => update(i, 'part', e.target.value)} placeholder="Part name" /></td>
                  <td className="px-1"><input className="bom-input w-24" value={r.sku} onChange={e => update(i, 'sku', e.target.value)} placeholder="SKU" /></td>
                  <td className="px-1"><input className="bom-input w-14" type="number" min="0" value={r.qty || ''} onChange={e => update(i, 'qty', e.target.value)} /></td>
                  <td className="px-1">
                    <select className="bom-input w-16" value={r.unit} onChange={e => update(i, 'unit', e.target.value)}>
                      {['pcs', 'set', 'lot'].map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-1"><input className="bom-input w-24" type="number" min="0" step="0.01" value={r.cost || ''} onChange={e => update(i, 'cost', e.target.value)} /></td>
                  <td className="px-2 font-mono text-[10px]" style={{ background: '#f4f5f7' }}>{t > 0 ? t.toFixed(2) : '—'}</td>
                  <td className="px-1"><button onClick={() => setLocal(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => setLocal(p => [...p, newRow()])} className="text-xs font-semibold text-blue-600 px-3 py-1.5 border border-dashed border-blue-300 rounded hover:bg-blue-50">+ Add Part</button>
      <div className="flex justify-end px-4 py-2 rounded border text-xs" style={{ background: '#eef2fa', borderColor: '#d9e1f2' }}>
        <span className="text-gray-500 font-semibold mr-2">Parts Total: </span>
        <span className="font-mono font-bold text-[#1f3864]">{formatCurrency(total)}</span>
      </div>
    </div>
  )
}

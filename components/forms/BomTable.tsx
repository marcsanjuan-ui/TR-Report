'use client'

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'

interface BomRow { id: string; name: string; sku: string; qty: number; unit: string; cost: number; notes: string }
interface AddonRow { id: string; desc: string; amount: number }

interface Props {
  id: string
  rows: BomRow[]
  onChange: (rows: BomRow[]) => void
  addonRows: AddonRow[]
  onAddonChange: (rows: AddonRow[]) => void
}

const newBomRow = (): BomRow => ({ id: Math.random().toString(36).slice(2), name: '', sku: '', qty: 0, unit: 'pcs', cost: 0, notes: '' })
const newAddon = (): AddonRow => ({ id: Math.random().toString(36).slice(2), desc: '', amount: 0 })

const UNITS = ['pcs', 'kg', 'm', 'L', 'set', 'lot']

export default function BomTable({ id, rows, onChange, addonRows, onAddonChange }: Props) {
  const [localRows, setLocalRows] = useState<BomRow[]>(rows.length > 0 ? rows : [newBomRow()])
  const [localAddons, setLocalAddons] = useState<AddonRow[]>(addonRows.length > 0 ? addonRows : [])

  useEffect(() => { onChange(localRows) }, [localRows, onChange])
  useEffect(() => { onAddonChange(localAddons) }, [localAddons, onAddonChange])

  const updateRow = (i: number, field: keyof BomRow, value: unknown) => {
    setLocalRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  const updateAddon = (i: number, field: keyof AddonRow, value: unknown) => {
    setLocalAddons(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }

  const bomSub = localRows.reduce((s, r) => s + (Number(r.qty) * Number(r.cost)), 0)
  const addonSub = localAddons.reduce((s, a) => s + Number(a.amount), 0)
  const grand = bomSub + addonSub

  return (
    <div className="space-y-4">
      {/* BOM table */}
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1f3864' }}>
              {['Item Name', 'SKU', 'Qty', 'Unit', 'Unit Cost (PHP)', 'Total', 'Notes', ''].map(h => (
                <th key={h} className="px-2 py-2 text-left text-white font-semibold text-[10px] tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {localRows.map((row, i) => {
              const total = Number(row.qty) * Number(row.cost)
              return (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-amber-50/30">
                  <td className="px-1 py-1"><input className="bom-input w-36" value={row.name} onChange={e => updateRow(i, 'name', e.target.value)} placeholder="Item name" /></td>
                  <td className="px-1 py-1"><input className="bom-input w-24" value={row.sku} onChange={e => updateRow(i, 'sku', e.target.value)} placeholder="SKU" /></td>
                  <td className="px-1 py-1"><input className="bom-input w-14" type="number" min="0" value={row.qty || ''} onChange={e => updateRow(i, 'qty', e.target.value)} placeholder="0" /></td>
                  <td className="px-1 py-1">
                    <select className="bom-input w-16" value={row.unit} onChange={e => updateRow(i, 'unit', e.target.value)}>
                      {UNITS.map(u => <option key={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="px-1 py-1"><input className="bom-input w-24" type="number" min="0" step="0.01" value={row.cost || ''} onChange={e => updateRow(i, 'cost', e.target.value)} placeholder="0.00" /></td>
                  <td className="px-2 py-1 font-mono text-[11px] text-gray-500 whitespace-nowrap" style={{ background: '#f4f5f7' }}>
                    {total > 0 ? total.toFixed(2) : '—'}
                  </td>
                  <td className="px-1 py-1"><input className="bom-input w-28" value={row.notes} onChange={e => updateRow(i, 'notes', e.target.value)} placeholder="Notes" /></td>
                  <td className="px-1 py-1">
                    <button onClick={() => setLocalRows(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs px-1.5 py-0.5 rounded hover:bg-red-50">✕</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <button onClick={() => setLocalRows(p => [...p, newBomRow()])} className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors">
        + Add Item
      </button>

      {/* Addon table */}
      <div className="pt-2">
        <div className="text-xs font-bold text-blue-700 uppercase tracking-wider px-3 py-1.5 rounded-sm mb-3" style={{ background: '#eef2fa', borderLeft: '3px solid #4472c4' }}>
          Pricing / Add-ons
        </div>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: '#1f3864' }}>
                <th className="px-2 py-2 text-left text-white font-semibold text-[10px] tracking-wider">Description</th>
                <th className="px-2 py-2 text-left text-white font-semibold text-[10px] tracking-wider">Amount (PHP)</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {localAddons.map((a, i) => (
                <tr key={a.id} className="border-b border-gray-100">
                  <td className="px-1 py-1"><input className="bom-input" value={a.desc} onChange={e => updateAddon(i, 'desc', e.target.value)} placeholder="Description" /></td>
                  <td className="px-1 py-1"><input className="bom-input w-28" type="number" min="0" step="0.01" value={a.amount || ''} onChange={e => updateAddon(i, 'amount', e.target.value)} placeholder="0.00" /></td>
                  <td className="px-1 py-1"><button onClick={() => setLocalAddons(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs px-1 rounded">✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button onClick={() => setLocalAddons(p => [...p, newAddon()])} className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 border border-dashed border-blue-300 rounded hover:bg-blue-50 transition-colors">
          + Add Custom Item
        </button>
      </div>

      {/* Totals */}
      <div className="flex justify-end gap-6 px-4 py-3 rounded border text-xs" style={{ background: '#eef2fa', borderColor: '#d9e1f2' }}>
        <div><span className="text-gray-500 font-semibold">BOM Subtotal: </span><span className="font-mono font-bold text-[#1f3864]">{formatCurrency(bomSub)}</span></div>
        <div><span className="text-gray-500 font-semibold">Add-ons: </span><span className="font-mono font-bold text-[#1f3864]">{formatCurrency(addonSub)}</span></div>
        <div><span className="text-gray-500 font-semibold">Grand Total: </span><span className="font-mono font-bold text-[#1f3864] text-sm">{formatCurrency(grand)}</span></div>
      </div>
    </div>
  )
}

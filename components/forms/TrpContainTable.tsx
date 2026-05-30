'use client'

import { useState, useEffect } from 'react'

interface ContainRow { id: string; action: string; date: string; owner: string; status: string }
const newRow = (): ContainRow => ({ id: Math.random().toString(36).slice(2), action: '', date: '', owner: '', status: 'In Progress' })
const STATUSES = ['In Progress', 'Complete', 'Planned', 'Cancelled']

export default function TrpContainTable({ rows, onChange }: { rows: unknown[]; onChange: (r: unknown[]) => void }) {
  const [local, setLocal] = useState<ContainRow[]>(
    rows.length > 0 ? rows as ContainRow[] : [newRow(), newRow(), newRow()]
  )
  useEffect(() => { onChange(local) }, [local])

  const update = (i: number, field: keyof ContainRow, val: string) =>
    setLocal(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r))

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="w-full text-xs">
          <thead>
            <tr style={{ background: '#1f3864' }}>
              <th className="px-2 py-2 text-white text-[10px] font-semibold text-center w-8">#</th>
              <th className="px-2 py-2 text-left text-white text-[10px] font-semibold">Action Taken</th>
              <th className="px-2 py-2 text-left text-white text-[10px] font-semibold w-28">Date</th>
              <th className="px-2 py-2 text-left text-white text-[10px] font-semibold w-32">Owner</th>
              <th className="px-2 py-2 text-left text-white text-[10px] font-semibold w-28">Status</th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {local.map((r, i) => (
              <tr key={r.id} className="border-b border-gray-100">
                <td className="px-2 py-1 text-center font-bold text-gray-400 text-[10px]">{i + 1}</td>
                <td className="px-1 py-1"><input className="bom-input" value={r.action} onChange={e => update(i, 'action', e.target.value)} placeholder="Action taken" /></td>
                <td className="px-1 py-1"><input className="bom-input" type="date" value={r.date} onChange={e => update(i, 'date', e.target.value)} /></td>
                <td className="px-1 py-1"><input className="bom-input" value={r.owner} onChange={e => update(i, 'owner', e.target.value)} placeholder="Name / Role" /></td>
                <td className="px-1 py-1">
                  <select className="bom-input" value={r.status} onChange={e => update(i, 'status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1"><button onClick={() => setLocal(p => p.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 text-xs px-1">✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button onClick={() => setLocal(p => [...p, newRow()])} className="text-xs font-semibold text-blue-600 px-3 py-1.5 border border-dashed border-blue-300 rounded hover:bg-blue-50">+ Add Action</button>
    </div>
  )
}

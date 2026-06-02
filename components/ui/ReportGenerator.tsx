'use client'

import { useState } from 'react'
import { Document } from '@/types/documents'
import { FileText, Loader2, Copy, Check } from 'lucide-react'

export default function ReportGenerator({ doc }: { doc: Document }) {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  async function generate() {
    setLoading(true)
    setError('')
    setReport('')

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doc }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setReport(data.report)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: '#f8f9fc' }}>
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">AI Report</h2>
        <div className="flex items-center gap-2">
          {report && (
            <button
              onClick={copy}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded text-white font-semibold transition-colors"
            style={{ background: loading ? '#7a9bd4' : '#2e5490' }}
          >
            {loading
              ? <><Loader2 size={12} className="animate-spin" /> Generating…</>
              : <><FileText size={12} /> {report ? 'Regenerate' : 'Generate Report'}</>
            }
          </button>
        </div>
      </div>

      <div className="p-5">
        {error && (
          <div className="text-xs px-3 py-2 rounded mb-3" style={{ background: '#fde8e8', color: '#c8392b', border: '1px solid #f5c6c2' }}>
            {error}
          </div>
        )}
        {!report && !loading && !error && (
          <p className="text-sm text-gray-400 italic">Click "Generate Report" to create a formal report using Ollama (llama3.2). Make sure Ollama is running locally.</p>
        )}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Loader2 size={14} className="animate-spin" /> Generating report…
          </div>
        )}
        {report && (
          <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">{report}</pre>
        )}
      </div>
    </div>
  )
}
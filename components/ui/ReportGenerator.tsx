// FILE: components/ui/ReportGenerator.tsx
'use client'

import { useState, useRef } from 'react'
import { Document } from '@/types/documents'
import { FileText, Loader2, Copy, Check, Download, RefreshCw } from 'lucide-react'

export default function ReportGenerator({ doc }: { doc: Document }) {
  const [report, setReport]       = useState('')
  const [loading, setLoading]     = useState(false)
  const [streaming, setStreaming] = useState(false)
  const [error, setError]         = useState('')
  const [copied, setCopied]       = useState(false)
  const [downloading, setDownloading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function generate() {
    // Cancel any in-flight request
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setStreaming(false)
    setError('')
    setReport('')

    try {
      const res = await fetch('/api/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({ doc }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? `Server error ${res.status}`)
      }

      // Stream the response token-by-token from the readable body
      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response body')

      setLoading(false)
      setStreaming(true)

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        // The API returns a single JSON object — accumulate and parse when complete
        try {
          const parsed = JSON.parse(buffer)
          if (parsed.error) throw new Error(parsed.error)
          const text = (parsed.report as string)
            .replace(/₱/g, 'PHP ')
            .replace(/\$/g, 'PHP ')
          setReport(text)
          buffer = ''
        } catch {
          // Partial JSON — keep accumulating
        }
      }

    } catch (e: unknown) {
      if (e instanceof Error && e.name === 'AbortError') return
      setError(e instanceof Error ? e.message : 'Failed to generate report')
    } finally {
      setLoading(false)
      setStreaming(false)
    }
  }

  function cancel() {
    abortRef.current?.abort()
    setLoading(false)
    setStreaming(false)
  }

  async function copy() {
    await navigator.clipboard.writeText(report)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function downloadPdf() {
    setDownloading(true)
    try {
      const { jsPDF } = await import('jspdf')

      // ── Colours ─────────────────────────────────────────────────────
      const C = {
        navy:      [31,  56, 100] as [number,number,number],
        navyDark:  [20,  40,  75] as [number,number,number],
        blue:      [46,  84, 144] as [number,number,number],
        bluePale:  [232,240,254]  as [number,number,number],
        teal:      [0,  128, 128] as [number,number,number],
        tealPale:  [224,247,247]  as [number,number,number],
        amber:     [133,100,  4]  as [number,number,number],
        amberPale: [255,243,205]  as [number,number,number],
        red:       [160, 47,  34] as [number,number,number],
        redPale:   [253,232,232]  as [number,number,number],
        gray:      [100,100,100]  as [number,number,number],
        grayLight: [245,246,250]  as [number,number,number],
        grayMid:   [220,225,235]  as [number,number,number],
        white:     [255,255,255]  as [number,number,number],
        text:      [35,  35,  45] as [number,number,number],
        textMid:   [80,  80,  90] as [number,number,number],
        textLight: [130,130,140]  as [number,number,number],
        rowAlt:    [248,249,253]  as [number,number,number],
        green:     [22, 120,  80] as [number,number,number],
        greenPale: [220,248,238]  as [number,number,number],
      }

      const prefixAccent: [number,number,number] =
        doc.doc_prefix === 'TR' ? C.blue :
        doc.doc_prefix === 'TA' ? C.amber : C.red
      const prefixPale: [number,number,number] =
        doc.doc_prefix === 'TR' ? C.bluePale :
        doc.doc_prefix === 'TA' ? C.amberPale : C.redPale

      // ── Page setup ──────────────────────────────────────────────────
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const PW = 210, PH = 297
      const ML = 16, MR = 16, MT = 16, MB = 16
      const CW = PW - ML - MR

      const photos = (doc.photos ?? []) as Array<{id:string;dataUrl:string;name:string;caption:string}>
      const imagePhotos = photos.filter(p => p.dataUrl?.startsWith('data:image'))
      const totalPages = imagePhotos.length > 0 ? 2 : 1

      function sanitize(s: string): string {
        return s
          .replace(/₱/g, 'PHP ')
          .replace(/[$]/g, 'PHP ')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2013\u2014]/g, '-')
          .replace(/[\u2500-\u257F\u2550-\u256C\u2580-\u259F]/g, '')
          .replace(/[^\x00-\x7F]/g, '')
      }

      function drawPageFrame(pageNum: number) {
        pdf.setFillColor(...C.navyDark)
        pdf.rect(0, 0, PW, 13, 'F')
        pdf.setFillColor(...C.navy)
        pdf.rect(0, 11, PW, 2, 'F')
        pdf.setFillColor(...prefixAccent)
        pdf.rect(0, 0, 4, 13, 'F')

        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(7)
        pdf.setTextColor(...C.white)
        pdf.text('JASSEN HARRIS INDUSTRIES CORPORATION', ML + 2, 5.5)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(6.2)
        pdf.setTextColor(180, 200, 230)
        pdf.text('Makerlab Technical Department  -  Confidential', ML + 2, 9.5)

        pdf.setFillColor(...prefixAccent)
        pdf.roundedRect(PW - MR - 22, 2, 22, 9, 1.5, 1.5, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(6.5)
        pdf.setTextColor(...C.white)
        pdf.text(`Page ${pageNum} / ${totalPages}`, PW - MR - 11, 7.2, { align: 'center' })

        pdf.setFillColor(...C.grayLight)
        pdf.rect(0, PH - 10, PW, 10, 'F')
        pdf.setDrawColor(...C.grayMid)
        pdf.setLineWidth(0.25)
        pdf.line(0, PH - 10, PW, PH - 10)

        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(6)
        pdf.setTextColor(...C.textLight)
        const date = new Date(doc.created_at).toLocaleDateString('en-PH', {year:'numeric',month:'long',day:'numeric'})
        pdf.text(`${doc.control_number}  -  ${doc.doc_type}  -  ${date}`, ML, PH - 4.5)
        pdf.setFont('helvetica', 'italic')
        pdf.text('This document was generated with AI assistance and is for internal use only.', PW - MR, PH - 4.5, { align: 'right' })
        pdf.setTextColor(...C.text)
      }

      function sectionHeading(label: string, y: number): number {
        pdf.setFillColor(...C.navy)
        pdf.rect(ML, y, CW, 7, 'F')
        pdf.setFillColor(...prefixAccent)
        pdf.rect(ML, y, 3, 7, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(7.5)
        pdf.setTextColor(...C.white)
        pdf.text(label.toUpperCase(), ML + 6, y + 4.8)
        pdf.setTextColor(...C.text)
        return y + 7 + 3
      }

      function kvTable(rows: [string, string][], y: number): number {
        const keyW = 58
        const valW = CW - keyW
        const lineH = 4.5
        const padV = 4

        const filteredRows = rows.filter(([k, v]) =>
          !(k.trim().toUpperCase() === 'FIELD NAME' && v.trim().toLowerCase() === 'value')
        )

        const startY = y
        filteredRows.forEach(([k, v], i) => {
          pdf.setFontSize(7.5)
          const vLines = pdf.splitTextToSize(sanitize(v), valW - 8)
          const rowH = Math.max(vLines.length * lineH + padV * 2, 8)

          pdf.setFillColor(...(i % 2 === 0 ? C.white : C.rowAlt))
          pdf.rect(ML, y, CW, rowH, 'F')
          pdf.setFillColor(235, 239, 248)
          pdf.rect(ML, y, keyW, rowH, 'F')
          pdf.setDrawColor(...prefixAccent)
          pdf.setLineWidth(0.4)
          pdf.line(ML + keyW, y, ML + keyW, y + rowH)
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(7)
          pdf.setTextColor(...C.navy)
          pdf.text(sanitize(k), ML + keyW - 4, y + rowH / 2 + 2.2, { align: 'right' })
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(7.5)
          pdf.setTextColor(...C.text)
          vLines.forEach((line: string, li: number) => {
            pdf.text(line, ML + keyW + 4, y + padV + 3 + li * lineH)
          })
          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.15)
          pdf.line(ML, y + rowH, ML + CW, y + rowH)
          y += rowH
        })

        pdf.setDrawColor(...C.grayMid)
        pdf.setLineWidth(0.3)
        pdf.rect(ML, startY, CW, y - startY)
        return y + 4
      }

      function proseParagraph(text: string, y: number, maxY: number): number {
        pdf.setFillColor(...C.grayLight)
        const lines = pdf.splitTextToSize(sanitize(text.trim()), CW - 8)
        const blockH = Math.max(lines.length * 4.8 + 6, 14)
        pdf.rect(ML, y, CW, blockH, 'F')
        pdf.setDrawColor(...prefixAccent)
        pdf.setLineWidth(0.6)
        pdf.line(ML, y, ML, y + blockH)
        pdf.setDrawColor(...C.grayMid)
        pdf.setLineWidth(0.15)
        pdf.rect(ML, y, CW, blockH)
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        pdf.setTextColor(...C.text)
        let ty = y + 5
        for (const ln of lines) {
          if (ty + 4.8 > maxY) break
          pdf.text(ln, ML + 5, ty)
          ty += 4.8
        }
        return y + blockH + 4
      }

      function bomTable(rows: string[][], y: number, maxY: number): number {
        const cols = ['#', 'SKU', 'Description', 'Qty', 'Unit', 'Unit Cost']
        const colW = [8, 22, CW - 8 - 22 - 14 - 16 - 20, 14, 16, 20]
        const rowH = 6.5
        const headerH = 7

        pdf.setFillColor(...C.blue)
        pdf.rect(ML, y, CW, headerH, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(6.8)
        pdf.setTextColor(...C.white)
        let cx = ML + 2
        cols.forEach((c, i) => {
          pdf.text(c, cx, y + 4.8)
          cx += colW[i]
        })

        y += headerH
        rows.forEach((row, ri) => {
          if (y + rowH > maxY) return
          pdf.setFillColor(...(ri % 2 === 0 ? C.white : C.rowAlt))
          pdf.rect(ML, y, CW, rowH, 'F')
          const isTotalRow = ri === rows.length - 1 && row[0] === ''
          pdf.setFont('helvetica', isTotalRow ? 'bold' : 'normal')
          pdf.setFontSize(7.2)
          const tcol = isTotalRow ? C.navy : C.text
          pdf.setTextColor(...tcol)
          let dx = ML + 2
          row.forEach((cell, ci) => {
            const txt = pdf.splitTextToSize(sanitize(String(cell ?? '')), colW[ci] - 2)
            pdf.text(txt[0] ?? '', dx, y + 4.3)
            dx += colW[ci]
          })
          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.15)
          pdf.line(ML, y + rowH, ML + CW, y + rowH)
          y += rowH
        })
        pdf.setDrawColor(...C.blue)
        pdf.setLineWidth(0.3)
        pdf.rect(ML, y - rows.length * rowH - headerH, CW, rows.length * rowH + headerH)
        return y + 5
      }

      type Section = { title: string; lines: string[] }

      function parseReport(raw: string): Section[] {
        const sections: Section[] = []
        let current: Section | null = null
        for (const rawLine of raw.split('\n')) {
          const line = rawLine.trimEnd()
          const m = line.match(/^(I{1,3}V?|VI{0,3}|IX|X)\.\s+(.+)$/i)
          if (m) {
            if (current) sections.push(current)
            current = { title: `${m[1]}. ${m[2].trim()}`, lines: [] }
          } else if (current) {
            if (/^[=-]{4,}$/.test(line.trim())) continue
            current.lines.push(line)
          }
        }
        if (current) sections.push(current)
        return sections
      }

      function parseKV(lines: string[]): [string, string][] {
        return lines
          .map(l => {
            const m = l.match(/^(.+?)\s{2,}:\s+(.*)$/) || l.match(/^(.+?)\s*:\s+(.+)$/)
            if (m) return [m[1].trim(), m[2].trim()] as [string, string]
            return null
          })
          .filter(Boolean) as [string, string][]
      }

      function parseBOM(lines: string[]): string[][] {
        const rows: string[][] = []
        for (const l of lines) {
          if (/^[#-\s]+$/.test(l)) continue
          if (/^#\s+SKU/i.test(l)) continue
          const parts = l.split(/\s{2,}/).map(s => s.trim()).filter(Boolean)
          if (parts.length >= 3) rows.push(parts)
        }
        return rows
      }

      function parseHeaderMeta(raw: string): [string, string][] {
        const pairs: [string, string][] = []
        for (const line of raw.split('\n')) {
          if (/^(I{1,3}V?|VI{0,3}|IX|X)\.\s+/i.test(line)) break
          if (/^[=-]{4,}$/.test(line.trim())) continue
          const m = line.match(/^([A-Z][A-Z\s\/]{2,})\s*:\s+(.+)$/)
          if (m) pairs.push([m[1].trim(), m[2].trim()])
        }
        return pairs
      }

      const cleanReport = sanitize(report)
      const sections = parseReport(cleanReport)
      const headerMeta = parseHeaderMeta(cleanReport)

      drawPageFrame(1)

      let y = MT + 4

      const statusColor: [number,number,number] =
        doc.status === 'approved' ? C.green :
        doc.status === 'submitted' ? C.blue :
        doc.status === 'archived' ? C.gray : C.amber
      const statusPale: [number,number,number] =
        doc.status === 'approved' ? C.greenPale :
        doc.status === 'submitted' ? C.bluePale :
        doc.status === 'archived' ? C.grayLight : C.amberPale

      const rightX = ML + CW

      pdf.setFillColor(...prefixPale)
      pdf.roundedRect(rightX - 20, y, 20, 6, 1.5, 1.5, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6.5)
      pdf.setTextColor(...prefixAccent)
      pdf.text(doc.doc_type, rightX - 10, y + 4.1, { align: 'center' })

      pdf.setFont('courier', 'bold')
      pdf.setFontSize(7.5)
      pdf.setTextColor(...C.blue)
      pdf.text(doc.control_number, rightX, y + 4.1 + 6, { align: 'right' })

      pdf.setFillColor(...prefixAccent)
      pdf.rect(ML, y, 3, 24, 'F')

      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(...C.navy)
      const titleLines = pdf.splitTextToSize(sanitize(doc.title || 'Untitled Document'), CW * 0.65)
      pdf.text(titleLines, ML + 6, y + 7)

      const titleBlockH = titleLines.length * 7 + 2
      pdf.setFillColor(...statusPale)
      pdf.roundedRect(ML + 6, y + titleBlockH + 1, 22, 5.5, 1.2, 1.2, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6.5)
      pdf.setTextColor(...statusColor)
      pdf.text(doc.status.toUpperCase(), ML + 17, y + titleBlockH + 5.2, { align: 'center' })

      y += titleBlockH + 14

      const maxY = PH - MB - 12

      if (headerMeta.length > 0) {
        y = sectionHeading('Document Information', y)
        y = kvTable(headerMeta, y)
      }

      for (const sec of sections) {
        if (y + 20 > maxY) break

        const isBom = /bill of materials|parts.*costs/i.test(sec.title)
        const isKV  = !isBom && sec.lines.some(l => /^.{3,30}\s{2,}:\s+/.test(l))

        y = sectionHeading(sec.title, y)

        if (isBom) {
          const tableRows = parseBOM(sec.lines)
          if (tableRows.length > 0) {
            y = bomTable(tableRows, y, maxY) ?? y
          } else {
            const noMat = sec.lines.filter(l => l.trim() && !/^[-=]{3,}/.test(l)).join(' ').trim()
            y = proseParagraph(noMat || 'No materials listed.', y, maxY)
          }
        } else if (isKV) {
          const kvRows = parseKV(sec.lines)
          if (kvRows.length > 0) y = kvTable(kvRows, y)
          const prose = sec.lines.filter(l => {
            const m1 = l.match(/^(.+?)\s{2,}:\s+(.*)$/)
            const m2 = l.match(/^(.+?)\s*:\s+(.+)$/)
            return !m1 && !m2 && l.trim() && !/^[-=]{3,}/.test(l)
          }).join(' ')
          if (prose.trim()) y = proseParagraph(prose, y, maxY)
        } else {
          const prose = sec.lines.filter(l => l.trim() && !/^[-=]{3,}/.test(l)).join(' ')
          if (prose.trim()) y = proseParagraph(prose, y, maxY)
        }
      }

      if (imagePhotos.length > 0) {
        pdf.addPage()
        drawPageFrame(2)

        let py = MT + 4
        py = sectionHeading(`Attachments  (${imagePhotos.length} photo${imagePhotos.length > 1 ? 's' : ''})`, py)

        const cols = imagePhotos.length === 1 ? 1 : 2
        const gutter = 5
        const imgW = cols === 1 ? CW * 0.7 : (CW - (cols - 1) * gutter) / cols
        const imgH = imgW * 0.75
        const capH = 10

        imagePhotos.forEach((ph, idx) => {
          const col = idx % cols
          const row = Math.floor(idx / cols)
          const x = cols === 1 ? ML + (CW - imgW) / 2 : ML + col * (imgW + gutter)
          const baseY = py + row * (imgH + capH + 5)

          if (baseY + imgH + capH > PH - MB - 12) return

          pdf.setFillColor(200, 205, 215)
          pdf.rect(x + 0.8, baseY + 0.8, imgW, imgH, 'F')

          try {
            const fmt = ph.dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
            pdf.addImage(ph.dataUrl, fmt, x, baseY, imgW, imgH)
          } catch {
            pdf.setFillColor(...C.grayLight)
            pdf.rect(x, baseY, imgW, imgH, 'F')
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7)
            pdf.setTextColor(...C.textLight)
            pdf.text('Image unavailable', x + imgW / 2, baseY + imgH / 2, { align: 'center' })
          }

          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.3)
          pdf.rect(x, baseY, imgW, imgH)

          pdf.setFillColor(245, 247, 252)
          pdf.rect(x, baseY + imgH, imgW, capH, 'F')
          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.15)
          pdf.rect(x, baseY + imgH, imgW, capH)

          pdf.setFillColor(...prefixAccent)
          pdf.roundedRect(x + 1.5, baseY + imgH + 1.5, 10, 4, 1, 1, 'F')
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(5.5)
          pdf.setTextColor(...C.white)
          pdf.text(`#${idx + 1}`, x + 6.5, baseY + imgH + 4.2, { align: 'center' })

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(6.5)
          pdf.setTextColor(...C.text)
          const nameT = pdf.splitTextToSize(sanitize(ph.name || `Photo ${idx + 1}`), imgW - 16)
          pdf.text(nameT[0], x + 14, baseY + imgH + 4.2)

          if (ph.caption) {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(6)
            pdf.setTextColor(...C.textMid)
            const capT = pdf.splitTextToSize(sanitize(ph.caption), imgW - 4)
            pdf.text(capT[0], x + 2, baseY + imgH + 8.2)
          }
        })
      }

      const filename = `${doc.control_number}_${doc.doc_type}_Report.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_')
      pdf.save(filename)

    } catch (e) {
      console.error('PDF generation failed:', e)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  const isActive = loading || streaming

  return (
    <div className="card overflow-hidden mb-6">
      <div className="card-header">
        <div>
          <h2>AI Report</h2>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
            Powered by Ollama · model: <code style={{ fontFamily: 'var(--font-mono)' }}>{process.env.NEXT_PUBLIC_OLLAMA_MODEL ?? 'llama3.2'}</code>
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {report && !isActive && (
            <>
              <button onClick={copy} className="btn-outline" style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="btn-outline"
                style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5, opacity: downloading ? 0.6 : 1 }}
              >
                {downloading ? <Loader2 size={12} className="spin" /> : <Download size={12} />}
                {downloading ? 'Exporting…' : 'Download PDF'}
              </button>
            </>
          )}
          {isActive ? (
            <button
              onClick={cancel}
              className="btn-outline"
              style={{ fontSize: 12, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5, color: 'var(--status-draft-text)' }}
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={generate}
              className="btn-primary"
              style={{ fontSize: 12, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              {report ? <RefreshCw size={12} /> : <FileText size={12} />}
              {report ? 'Regenerate' : 'Generate Report'}
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {error && (
          <div style={{ fontSize: 12, padding: '8px 12px', borderRadius: 6, marginBottom: 12, background: 'var(--status-draft-bg)', color: 'var(--status-draft-text)', border: '1px solid var(--status-draft-border)' }}>
            ⚠ {error}
          </div>
        )}
        {!report && !isActive && !error && (
          <p style={{ fontSize: 13, fontStyle: 'italic', color: 'var(--text-muted)' }}>
            Click "Generate Report" to create a formal report. Make sure Ollama is running: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>ollama serve</code>
          </p>
        )}
        {isActive && !report && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
            <Loader2 size={14} className="spin" /> Waiting for Ollama…
          </div>
        )}
        {report && (
          <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', margin: 0 }}>
            {report}
            {streaming && <span className="spin" style={{ display: 'inline-block', marginLeft: 4 }}>▋</span>}
          </pre>
        )}
      </div>
    </div>
  )
}

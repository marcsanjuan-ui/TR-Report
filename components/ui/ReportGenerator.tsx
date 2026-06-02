'use client'

import { useState } from 'react'
import { Document } from '@/types/documents'
import { FileText, Loader2, Copy, Check, Download } from 'lucide-react'

export default function ReportGenerator({ doc }: { doc: Document }) {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)

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
      setReport(data.report.replace(/₱/g, 'PHP ').replace(/\$/g, 'PHP '))
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
      const CONTENT_TOP = 13 + MT   // below header bar
      const CONTENT_BOT = PH - MB - 12  // above footer bar

      const photos = (doc.photos ?? []) as Array<{id:string;dataUrl:string;name:string;caption:string}>
      const imagePhotos = photos.filter(p => p.dataUrl?.startsWith('data:image'))

      // Dynamic page counter — we don't know total pages upfront, use placeholder
      let currentPage = 1
      const pageNumPlaceholder: { page: number; x: number; y: number }[] = []

      // ── Sanitize for jsPDF latin fonts ────────────────────────────────
      function sanitize(s: string): string {
        return (s ?? '')
          .replace(/₱/g, 'PHP ')
          .replace(/[$]/g, 'PHP ')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2013\u2014]/g, '-')
          .replace(/[\u2500-\u257F\u2550-\u256C\u2580-\u259F]/g, '')
          .replace(/[^\x00-\x7F]/g, '')
      }

      // ── Draw header/footer on current page ───────────────────────────
      function drawPageFrame() {
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

        // Page badge — record position for later total-page fill-in
        pdf.setFillColor(...prefixAccent)
        pdf.roundedRect(PW - MR - 22, 2, 22, 9, 1.5, 1.5, 'F')
        pageNumPlaceholder.push({ page: currentPage, x: PW - MR - 11, y: 7.2 })

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

      // ── Add a new content page ────────────────────────────────────────
      function newPage(): number {
        pdf.addPage()
        currentPage++
        drawPageFrame()
        return CONTENT_TOP
      }

      // ── Ensure enough vertical space; break page if needed ───────────
      function ensureSpace(y: number, needed: number): number {
        if (y + needed > CONTENT_BOT) return newPage()
        return y
      }

      function sectionHeading(label: string, y: number): number {
        y = ensureSpace(y, 10)
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

      // ── kvTable: wraps values, breaks across pages row-by-row ────────
      function kvTable(rows: [string, string][], y: number): number {
        const keyW = 58
        const valW = CW - keyW
        const lineH = 4.5
        const padV  = 2.8
        const minH  = 6.5

        // Pre-compute wrapped lines per row
        const wrappedRows = rows.map(([k, v]) => {
          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(7.5)
          const lines: string[] = pdf.splitTextToSize(sanitize(v), valW - 8)
          const rowH = Math.max(lines.length * lineH + padV * 2, minH)
          return { k, lines, rowH }
        })

        wrappedRows.forEach(({ k, lines, rowH }, i) => {
          // Page break before this row if it won't fit
          y = ensureSpace(y, rowH)

          pdf.setFillColor(...(i % 2 === 0 ? C.white : C.rowAlt))
          pdf.rect(ML, y, CW, rowH, 'F')

          pdf.setFillColor(235, 239, 248)
          pdf.rect(ML, y, keyW, rowH, 'F')

          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(7)
          pdf.setTextColor(...C.navy)
          pdf.text(sanitize(k), ML + keyW - 3, y + rowH / 2 + 2.2, { align: 'right' })

          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.3)
          pdf.line(ML + keyW, y, ML + keyW, y + rowH)

          pdf.setFont('helvetica', 'normal')
          pdf.setFontSize(7.5)
          pdf.setTextColor(...C.text)
          lines.forEach((line: string, li: number) => {
            pdf.text(line, ML + keyW + 4, y + padV + lineH * li + lineH * 0.85)
          })

          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.15)
          pdf.line(ML, y + rowH, ML + CW, y + rowH)

          y += rowH
        })

        return y + 4
      }

      // ── proseParagraph: splits across pages line by line ─────────────
      function proseParagraph(text: string, y: number): number {
        pdf.setFont('helvetica', 'normal')
        pdf.setFontSize(8)
        const lines = pdf.splitTextToSize(sanitize(text.trim()), CW - 10)
        if (!lines.length) return y

        const lineH = 4.8
        const padTop = 4
        const padBot = 4

        // Draw the block background before writing — must fit at least first line
        // We'll draw line-by-line with page breaks, using a left accent bar per chunk
        let chunkStart = 0

        while (chunkStart < lines.length) {
          // Collect lines that fit on this page
          const availH = CONTENT_BOT - y
          const maxLinesOnPage = Math.max(1, Math.floor((availH - padTop - padBot) / lineH))
          const chunk = lines.slice(chunkStart, chunkStart + maxLinesOnPage)
          const blockH = chunk.length * lineH + padTop + padBot

          pdf.setFillColor(...C.grayLight)
          pdf.rect(ML, y, CW, blockH, 'F')
          pdf.setDrawColor(...prefixAccent)
          pdf.setLineWidth(0.6)
          pdf.line(ML, y, ML, y + blockH)
          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.15)
          pdf.rect(ML, y, CW, blockH)

          pdf.setTextColor(...C.text)
          chunk.forEach((ln: string, li: number) => {
            pdf.text(ln, ML + 5, y + padTop + lineH * li + lineH * 0.75)
          })

          y += blockH + 3
          chunkStart += chunk.length

          if (chunkStart < lines.length) {
            y = newPage()
          }
        }

        return y + 1
      }

      // ── bomTable: dynamic row height, page-break aware ───────────────
      function bomTable(rows: string[][], y: number): number {
        const cols = ['#', 'SKU', 'Description', 'Qty', 'Unit', 'Unit Cost']
        const colW = [8, 22, CW - 8 - 22 - 14 - 16 - 20, 14, 16, 20]
        const lineH = 4.5
        const padV  = 2.8
        const minH  = 6.5
        const headerH = 7

        // Helper to draw the BOM header row (repeated on page break)
        function drawBomHeader(hy: number) {
          pdf.setFillColor(...C.blue)
          pdf.rect(ML, hy, CW, headerH, 'F')
          pdf.setFont('helvetica', 'bold')
          pdf.setFontSize(6.8)
          pdf.setTextColor(...C.white)
          let cx = ML + 2
          cols.forEach((c, i) => {
            pdf.text(c, cx, hy + 4.8)
            cx += colW[i]
          })
        }

        y = ensureSpace(y, headerH + minH)
        drawBomHeader(y)
        y += headerH

        rows.forEach((row, ri) => {
          // Pre-compute row height
          let maxLines = 1
          row.forEach((cell, ci) => {
            pdf.setFont('helvetica', 'normal')
            pdf.setFontSize(7.2)
            const wrapped: string[] = pdf.splitTextToSize(sanitize(String(cell ?? '')), colW[ci] - 3)
            if (wrapped.length > maxLines) maxLines = wrapped.length
          })
          const isTotalRow = ri === rows.length - 1 && row[0] === ''
          const rowH = isTotalRow ? minH : Math.max(maxLines * lineH + padV * 2, minH)

          // Page break — redraw header on new page
          if (y + rowH > CONTENT_BOT) {
            y = newPage()
            drawBomHeader(y)
            y += headerH
          }

          pdf.setFillColor(...(ri % 2 === 0 ? C.white : C.rowAlt))
          pdf.rect(ML, y, CW, rowH, 'F')

          pdf.setFont('helvetica', isTotalRow ? 'bold' : 'normal')
          pdf.setFontSize(7.2)
          pdf.setTextColor(...(isTotalRow ? C.navy : C.text))

          let dx = ML + 2
          row.forEach((cell, ci) => {
            const wrapped: string[] = pdf.splitTextToSize(sanitize(String(cell ?? '')), colW[ci] - 3)
            wrapped.forEach((line: string, li: number) => {
              pdf.text(line, dx, y + padV + lineH * li + lineH * 0.85)
            })
            dx += colW[ci]
          })

          pdf.setDrawColor(...C.grayMid)
          pdf.setLineWidth(0.15)
          pdf.line(ML, y + rowH, ML + CW, y + rowH)
          y += rowH
        })

        return y + 5
      }

      // ── Parse report text ─────────────────────────────────────────────
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

      // ── PAGE 1 — Draw frame + title block ────────────────────────────
      drawPageFrame()

      let y = CONTENT_TOP - MB + 4  // just below header bar

      // Status + prefix colours
      const statusColor: [number,number,number] =
        doc.status === 'approved' ? C.green :
        doc.status === 'submitted' ? C.blue :
        doc.status === 'archived' ? C.gray : C.amber
      const statusPale: [number,number,number] =
        doc.status === 'approved' ? C.greenPale :
        doc.status === 'submitted' ? C.bluePale :
        doc.status === 'archived' ? C.grayLight : C.amberPale

      const rightX = ML + CW

      // Doc type badge
      pdf.setFillColor(...prefixPale)
      pdf.roundedRect(rightX - 20, y, 20, 6, 1.5, 1.5, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6.5)
      pdf.setTextColor(...prefixAccent)
      pdf.text(doc.doc_type, rightX - 10, y + 4.1, { align: 'center' })

      // Control number
      pdf.setFont('courier', 'bold')
      pdf.setFontSize(7.5)
      pdf.setTextColor(...C.blue)
      pdf.text(doc.control_number, rightX, y + 10.5, { align: 'right' })

      // Left accent bar
      pdf.setFillColor(...prefixAccent)
      pdf.rect(ML, y, 3, 24, 'F')

      // Title
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(18)
      pdf.setTextColor(...C.navy)
      const titleLines = pdf.splitTextToSize(sanitize(doc.title || 'Untitled Document'), CW * 0.65)
      pdf.text(titleLines, ML + 6, y + 7)

      // Status badge
      const titleBlockH = titleLines.length * 7 + 2
      pdf.setFillColor(...statusPale)
      pdf.roundedRect(ML + 6, y + titleBlockH + 1, 22, 5.5, 1.2, 1.2, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(6.5)
      pdf.setTextColor(...statusColor)
      pdf.text(doc.status.toUpperCase(), ML + 17, y + titleBlockH + 5.2, { align: 'center' })

      y += titleBlockH + 14

      // ── Render document meta header ───────────────────────────────────
      if (headerMeta.length > 0) {
        y = sectionHeading('Document Information', y)
        y = kvTable(headerMeta, y)
      }

      // ── Render report sections ────────────────────────────────────────
      for (const sec of sections) {
        const isBom = /bill of materials|parts.*costs/i.test(sec.title)
        const isKV  = !isBom && sec.lines.some(l => /^.{3,30}\s{2,}:\s+/.test(l))

        y = sectionHeading(sec.title, y)

        if (isBom) {
          const tableRows = parseBOM(sec.lines)
          if (tableRows.length > 0) {
            y = bomTable(tableRows, y)
          } else {
            const noMat = sec.lines.filter(l => l.trim() && !/^[-=]{3,}/.test(l)).join(' ').trim()
            y = proseParagraph(noMat || 'No materials listed.', y)
          }
        } else if (isKV) {
          const kvRows = parseKV(sec.lines)
          if (kvRows.length > 0) y = kvTable(kvRows, y)
          const prose = sec.lines.filter(l => {
            const m1 = l.match(/^(.+?)\s{2,}:\s+(.*)$/)
            const m2 = l.match(/^(.+?)\s*:\s+(.+)$/)
            return !m1 && !m2 && l.trim() && !/^[-=]{3,}/.test(l)
          }).join(' ')
          if (prose.trim()) y = proseParagraph(prose, y)
        } else {
          const prose = sec.lines.filter(l => l.trim() && !/^[-=]{3,}/.test(l)).join(' ')
          if (prose.trim()) y = proseParagraph(prose, y)
        }
      }

      // ── Photos section ────────────────────────────────────────────────
      if (imagePhotos.length > 0) {
        y = newPage()
        y = sectionHeading(`Attachments  (${imagePhotos.length} photo${imagePhotos.length > 1 ? 's' : ''})`, y)

        const cols = imagePhotos.length === 1 ? 1 : 2
        const gutter = 5
        const imgW = cols === 1 ? CW * 0.7 : (CW - (cols - 1) * gutter) / cols
        const imgH = imgW * 0.75
        const capH = 10

        imagePhotos.forEach((ph, idx) => {
          const col = idx % cols
          // New page when a left-column image won't fit
          if (col === 0) {
            y = ensureSpace(y, imgH + capH + 5)
          }
          const x = cols === 1 ? ML + (CW - imgW) / 2 : ML + col * (imgW + gutter)
          const baseY = y

          // Advance y only after completing a full row
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

          // Advance y after right column (or single column)
          if (cols === 1 || col === cols - 1 || idx === imagePhotos.length - 1) {
            y += imgH + capH + 5
          }
        })
      }

      // ── Back-fill page numbers now that we know the total ─────────────
      const totalPages = currentPage
      pageNumPlaceholder.forEach(({ page, x, y: py }) => {
        pdf.setPage(page)
        // Re-paint the badge background so old text is covered
        pdf.setFillColor(...prefixAccent)
        pdf.roundedRect(PW - MR - 22, 2, 22, 9, 1.5, 1.5, 'F')
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(6.5)
        pdf.setTextColor(...C.white)
        pdf.text(`Page ${page} / ${totalPages}`, x, py, { align: 'center' })
      })

      const filename = `${doc.control_number}_${doc.doc_type}_Report.pdf`.replace(/[^a-zA-Z0-9_.-]/g, '_')
      pdf.save(filename)

    } catch (e) {
      console.error('PDF generation failed:', e)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ background: '#f8f9fc' }}>
        <h2 className="text-xs font-bold text-gray-600 uppercase tracking-wider">AI Report</h2>
        <div className="flex items-center gap-2">
          {report && (
            <>
              <button
                onClick={copy}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={downloadPdf}
                disabled={downloading}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors"
                style={{
                  borderColor: downloading ? '#c8d8f0' : '#2e5490',
                  color: downloading ? '#7a9bd4' : '#2e5490',
                  background: 'white',
                }}
              >
                {downloading
                  ? <><Loader2 size={12} className="animate-spin" /> Exporting…</>
                  : <><Download size={12} /> Download PDF</>
                }
              </button>
            </>
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
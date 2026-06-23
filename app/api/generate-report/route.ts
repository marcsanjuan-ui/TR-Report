import { NextResponse } from 'next/server'
import { DOC_META, DocType } from '@/types/documents'

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL    ?? 'llama3.2'
const OLLAMA_TIMEOUT  = parseInt(process.env.OLLAMA_TIMEOUT_MS ?? '120000', 10)

export async function POST(request: Request) {
  const { doc } = await request.json()
  const meta   = DOC_META[doc.doc_type as DocType]
  const prefix = doc.doc_prefix as 'TR' | 'TA' | 'AS'

  const date = new Date(doc.created_at).toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  // ── Photo context for the prompt ──────────────────────────────────────────
  type PhotoRecord = { id: string; name: string; caption: string; ctx: string; dataUrl: string }
  const photos = (doc.photos ?? []) as PhotoRecord[]
  const photoContext = photos.length > 0
    ? `\nATTACHMENTS (${photos.length} file${photos.length > 1 ? 's' : ''}):\n` +
      photos.map((p, i) =>
        `  [${i + 1}] ${p.name}${p.caption ? ` — "${p.caption}"` : ''}${p.ctx ? ` (context: ${p.ctx})` : ''}`
      ).join('\n')
    : ''

  // ── Templates ─────────────────────────────────────────────────────────────
  const trTemplate = `
JASSEN HARRIS INDUSTRIES CORPORATION
Technical Department — Makerlab
${'═'.repeat(60)}

DOCUMENT TYPE    : ${doc.doc_type} — ${meta?.name}
CONTROL NUMBER   : ${doc.control_number}
TITLE            : ${doc.title || 'Untitled'}
STATUS           : ${doc.status.toUpperCase()}
DATE             : ${date}

${'─'.repeat(60)}
I. OVERVIEW
${'─'.repeat(60)}
Write a 2-3 sentence professional summary of what this document covers based on the form data.

${'─'.repeat(60)}
II. DETAILS
${'─'.repeat(60)}
List all non-BOM fields from the form data as labeled rows:
FIELD NAME       : value

${'─'.repeat(60)}
III. BILL OF MATERIALS
${'─'.repeat(60)}
If bom or bom_addon fields exist, render them as ASCII tables:

#   SKU         NAME            QTY    UNIT    COST
─── ─────────── ─────────────── ────── ─────── ────────
(rows here)
                                         TOTAL: 0.00

If no BOM data exists, write: No materials listed.

${'─'.repeat(60)}
IV. REMARKS
${'─'.repeat(60)}
Summarize any notes, specs, or additional context from the form data.

${'─'.repeat(60)}
V. STATUS SUMMARY
${'─'.repeat(60)}
State the current status and suggest logical next steps.

${'═'.repeat(60)}
Prepared by : Technical Department
Date        : ${date}
${'═'.repeat(60)}`

  const taTemplate = `
JASSEN HARRIS INDUSTRIES CORPORATION
${'═'.repeat(60)}

MEMORANDUM / ANNOUNCEMENT

TO          : (extract from form data or write "All Staff")
FROM        : Technical Department — Makerlab
DATE        : ${date}
RE          : ${doc.title || 'Untitled'}
REF NO      : ${doc.control_number}

${'─'.repeat(60)}
I. PURPOSE
${'─'.repeat(60)}
State the purpose of this announcement or memo based on form data.

${'─'.repeat(60)}
II. BODY
${'─'.repeat(60)}
Write the full content of the announcement or memo based on all form fields.

${'─'.repeat(60)}
III. ACTION REQUIRED
${'─'.repeat(60)}
State what recipients are expected to do, if anything.

${'═'.repeat(60)}
Issued by   : Technical Department
Date        : ${date}
${'═'.repeat(60)}`

  const asTemplate = `
JASSEN HARRIS INDUSTRIES CORPORATION
After Sales Department
${'═'.repeat(60)}

DOCUMENT TYPE    : ${doc.doc_type} — ${meta?.name}
CONTROL NUMBER   : ${doc.control_number}
TITLE            : ${doc.title || 'Untitled'}
STATUS           : ${doc.status.toUpperCase()}
DATE             : ${date}

${'─'.repeat(60)}
I. CUSTOMER INFORMATION
${'─'.repeat(60)}
Extract and list customer name, contact, and relevant details from form data.

${'─'.repeat(60)}
II. ISSUE / REQUEST DETAILS
${'─'.repeat(60)}
Describe the complaint, repair request, or refund reason from form data.

${'─'.repeat(60)}
III. RESOLUTION / ACTION TAKEN
${'─'.repeat(60)}
Describe what was done or is being done to resolve the issue.

${'─'.repeat(60)}
IV. PARTS / COSTS
${'─'.repeat(60)}
If parts or cost fields exist, render as ASCII table:

#   PART NAME       QTY    UNIT    COST
─── ─────────────── ────── ─────── ────────
(rows here)
                            TOTAL: 0.00

If none, write: No parts or costs recorded.

${'─'.repeat(60)}
V. OUTCOME
${'─'.repeat(60)}
State the final outcome or current status of the case.

${'═'.repeat(60)}
Handled by  : After Sales Department
Date        : ${date}
${'═'.repeat(60)}`

  const template = prefix === 'TR' ? trTemplate : prefix === 'TA' ? taTemplate : asTemplate

  const prompt = `You are a formal document writer for Jassen Harris Industries Corporation (JHIC / Makerlab).

Fill in the following report template using ONLY the data provided below.
Follow the template EXACTLY — do not add, remove, or reorder sections.
Do not use markdown, asterisks, or any symbols not already in the template.
Use ASCII tables exactly as shown in the template for any tabular data.
Replace all placeholder instructions in parentheses with actual content derived from the form data.
Calculate totals for BOM tables by multiplying qty x cost per row.
If attachments are listed below, reference them by name in the relevant section.

TEMPLATE:
${template}

FORM DATA:
${JSON.stringify(doc.form_data, null, 2)}${photoContext}`

  // ── Fetch with timeout ────────────────────────────────────────────────────
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT)

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
      }),
    })

    clearTimeout(timer)

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new Error(`Ollama returned ${response.status}${text ? `: ${text}` : ''}`)
    }

    const data = await response.json()
    return NextResponse.json({ report: data.response })

  } catch (err: unknown) {
    clearTimeout(timer)

    const isAbort  = err instanceof Error && err.name === 'AbortError'
    const isConn   = err instanceof TypeError && err.message.includes('fetch')

    const message = isAbort
      ? `Request timed out after ${OLLAMA_TIMEOUT / 1000}s. Try a faster model or increase OLLAMA_TIMEOUT_MS.`
      : isConn
      ? `Could not reach Ollama at ${OLLAMA_BASE_URL}. Make sure it is running: ollama serve`
      : err instanceof Error ? err.message : 'Unknown error'

    return NextResponse.json({ error: message }, { status: 503 })
  }
}

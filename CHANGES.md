# TR-Report — Fix Changelog

## `app/api/generate-report/route.ts`
- **Switched from `/api/chat` to `/api/generate`** — the correct Ollama endpoint for single-turn prompts
- **Model pulled from `OLLAMA_MODEL` env var** instead of hardcoded `llama3.2`
- **Base URL pulled from `OLLAMA_BASE_URL` env var** instead of hardcoded `localhost:11434`
- **`AbortController` timeout** — request now aborts after `OLLAMA_TIMEOUT_MS` ms (default 2 min) with a clear error message
- **Photo captions and context included in the prompt** — LLM now knows about attached files by name/caption/ctx
- Better error messages distinguish timeout vs connection failure vs Ollama error response

## `components/ui/ReportGenerator.tsx`
- **Streaming display** — report text appears as soon as the JSON response arrives, with a blinking cursor while loading
- **Cancel button** — lets you abort a slow generation mid-flight
- **Model name shown** in the card header (reads from `NEXT_PUBLIC_OLLAMA_MODEL` env)
- **Regenerate icon** changed to `RefreshCw` to distinguish from first-time generation
- **Error prefixed with ⚠** for clarity

## `app/documents/page.tsx`
- **Pagination added** — 25 documents per page with Previous/Next links
- Accepts `?page=N` query param, preserves existing filters across page navigation
- Shows current page number and count

## `package.json`
- **`lucide-react` fixed** from `^1.17.0` (non-existent) to `^0.383.0`
- **`openai` removed** — was installed but unused (dead dependency)

## `.env.local`
- **New file** with documented env vars:
  - `OLLAMA_MODEL` — model name (default: `llama3.2`)
  - `OLLAMA_BASE_URL` — Ollama server URL (default: `http://localhost:11434`)
  - `OLLAMA_TIMEOUT_MS` — request timeout in ms (default: `120000`)

## `lib/actions.ts`
- `fetchDocuments` now includes `photos` in the select — used for document list display

# TR-Report — User Manual

**Jassen Harris Industries Corporation (JHIC / Makerlab)**
Internal Document Management System

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Dashboard](#2-dashboard)
3. [Creating a Document](#3-creating-a-document)
4. [Document Types Reference](#4-document-types-reference)
5. [Filling Out Forms](#5-filling-out-forms)
6. [Managing Documents](#6-managing-documents)
7. [AI Report Generation](#7-ai-report-generation)
8. [Exporting to PDF](#8-exporting-to-pdf)
9. [Document Statuses](#9-document-statuses)
10. [Control Numbers Explained](#10-control-numbers-explained)
11. [Tips & Best Practices](#11-tips--best-practices)

---

## 1. Getting Started

When you open TR-Report for the first time, you will be asked to **enter your name**. This name is attached to every document you create so records stay traceable.

- Your name is saved in the browser — you only need to enter it once per device.
- To change your name, clear your browser's local storage or ask your admin to reset it.
- There is no password. The system is for internal LAN use only.

Once your name is set, you will be taken to the **Dashboard**.

---

## 2. Dashboard

The Dashboard gives you a quick overview of your document activity:

- **Recent Documents** — your latest created or updated documents
- **Document Counts by Status** — how many are Draft, Submitted, Approved, or Archived
- **Quick Create** — shortcut buttons to start a new document by type

Use the **Sidebar** on the left to navigate between:

| Item | Description |
|------|-------------|
| Dashboard | Overview and stats |
| Documents | Full list of all documents |
| New Document | Start a new document |

---

## 3. Creating a Document

1. Click **New Document** in the sidebar, or use a Quick Create button on the Dashboard.
2. Select the document type you need (see [Section 4](#4-document-types-reference) for descriptions).
3. Fill out the form — required fields are marked with an asterisk `*`.
4. Click **Submit** (step forms) or **Save** (doc forms) when done.

The system will automatically assign a **Control Number** to the document upon creation.

> **Tip:** You can save a document as Draft and come back to finish it later.

---

## 4. Document Types Reference

Documents are organized under three prefixes:

### TR — Technical Department

| Code | Name | When to Use |
|------|------|-------------|
| **PPL** | Project Plan | Starting a new project — captures client, deadline, specs, and estimated BOM |
| **PRD** | Production Order | Releasing a project to production — links to a PPL, includes actual BOM |
| **PSM** | Project Summary | Milestone update or post-project wrap-up — compares actual vs estimated BOM |
| **PRV** | Product Review | Documenting a new, upcoming, or existing product — specs, pricing, recommendation |
| **PTT** | Product Testing | Recording test results for a product — links to a PRV |
| **PRP** | Product Report | Logging post-evaluation issues — complaints, field feedback, quality problems |
| **TRP** | Technical Report | Escalated recurring issues — root cause analysis, trend data, containment actions |

### TA — Announcements

| Code | Name | When to Use |
|------|------|-------------|
| **TAN** | Announcement | Publishing a targeted announcement to a specific audience |
| **IDM** | Interdepartmental Memo | Formal coordination or requests between departments |

### AS — After Sales

| Code | Name | When to Use |
|------|------|-------------|
| **CRR** | Customer Report | Logging an incoming customer complaint or return request |
| **RPR** | Repair Report | Recording what was done during a repair — links to a CRR |
| **RFD** | Refund | Processing a refund request — links to a CRR and optionally an RPR |

---

## 5. Filling Out Forms

TR-Report has two form layouts depending on the document type:

### Step Forms (PPL, PRD, PSM, IDM, CRR, RPR, RFD)

These break the form into multiple steps. Navigate using the **Next** and **Back** buttons at the bottom of each step. You cannot skip required fields to advance to the next step.

### Doc Forms (PRV, PTT, PRP, TRP, TAN)

These show all sections on a single scrollable page. All sections are visible at once.

---

### Field Types

| Field | Description |
|-------|-------------|
| **Text** | Short single-line input |
| **Textarea** | Multi-line text — for descriptions, notes, specifications |
| **Date** | Date picker |
| **Number** | Numeric input (e.g. costs, quantities) |
| **Select** | Dropdown — choose one option |
| **Checkbox Group** | Multi-select — tick all that apply |
| **Reference** | Link to another document by control number (e.g. `TR-PPL-240626-00001`) |
| **File / Photo** | Upload photos or attachments |
| **BOM Table** | Bill of Materials — add rows for SKU, name, quantity, unit, cost |
| **Addon Table** | Custom pricing items — additional charges or line items |

---

### Bill of Materials (BOM)

The BOM table is used in PPL, PRD, RPR, and PSM documents.

- Click **Add Row** to add a material or part.
- Fill in: SKU, Item Name, Quantity, Unit, and Unit Cost (PHP).
- The total is calculated automatically.
- In **PSM**, you compare estimated BOM from the PPL against actual quantities and costs.
- In **RPR**, the BOM tracks parts used during repair.

---

### Photo Attachments

For any document with a **File** field:

1. Click the file field to open the photo upload area.
2. Upload one or more images.
3. Add an optional **Caption** and **Context** note per photo — these are used by the AI when generating reports.
4. Photos are displayed in the document view and included in PDF exports.

> **Note:** Keep photos reasonably sized. Very large images will slow down saving and PDF export.

---

### Reference Fields

Some documents link to others using a Reference field. For example:
- A **PRD** links to a **PPL** using `TR-PPL-DDMMYY-NNNNN`
- An **RPR** links to a **CRR** using `AS-CRR-DDMMYY-NNNNN`

Type or paste the full control number of the linked document. The system will validate it.

---

## 6. Managing Documents

### Documents List

Go to **Documents** in the sidebar to see all documents. You can:

- **Filter by prefix** (TR / TA / AS) using the tabs at the top
- **Filter by status** using the status dropdown
- **Search** by title or control number using the search bar
- **Navigate pages** using the Previous / Next buttons at the bottom (25 documents per page)

### Viewing a Document

Click any document row to open its detail view. The detail page shows:

- Full control number, document type, status, and creation info
- All filled-in form fields in a readable layout
- Attached photos
- AI Report section (see [Section 7](#7-ai-report-generation))

### Editing a Document

> Currently, documents are not editable after submission. Create a new document or contact your admin if a correction is needed.

### Deleting a Document

On the document detail page, a **Delete** button is available. Deletion is permanent — confirm before proceeding.

### Changing Status

On the document detail page, click **Change Status** to move the document through its lifecycle:

| Status | Meaning |
|--------|---------|
| **Draft** | Work in progress — not yet submitted |
| **Submitted** | Submitted for review or approval |
| **Approved** | Reviewed and approved |
| **Archived** | Closed, no longer active |

---

## 7. AI Report Generation

Every document has an **AI Report** section at the bottom of its detail page. This uses your locally running Ollama model to generate a formal report from the document's form data.

### How to Generate a Report

1. Open a document.
2. Scroll to the **AI Report** card.
3. Click **Generate Report**.
4. Wait for Ollama to process — the report streams in as it is generated.
5. Once complete, you can **Copy** the text or **Download as PDF**.

### Requirements

- Ollama must be running on the server: `ollama serve`
- The model (`llama3.2` by default) must be pulled: `ollama pull llama3.2`
- Generation time depends on your machine's CPU/GPU — typically 30 seconds to 2 minutes

### Cancelling

Click **Cancel** during generation to stop it at any time.

### Regenerating

Click **Regenerate** to run it again. Useful if the output is incomplete or not what you need.

> **Tip:** Fill in as many fields as possible before generating — especially the Notes, Specifications, and Descriptions. The more context you give, the better the report output.

---

## 8. Exporting to PDF

After generating an AI report:

1. Click **Download PDF** in the AI Report card.
2. The PDF downloads automatically with a filename like `TR-PPL-240626-00001_PPL_Report.pdf`.

### What the PDF Includes

- JHIC / Makerlab header with document type badge and control number
- Document title and status
- All report sections formatted as labeled tables or prose blocks
- Bill of Materials as a formatted table with totals
- A second page with all attached photos (if any), with captions

---

## 9. Document Statuses

| Status | Color | Meaning |
|--------|-------|---------|
| Draft | Amber | Being filled out — not yet final |
| Submitted | Blue | Completed and submitted for review |
| Approved | Green | Reviewed and signed off |
| Archived | Gray | Closed or superseded |

Change status from the document detail page using the **Change Status** button.

---

## 10. Control Numbers Explained

Every document gets a unique control number generated at creation time.

### Format

```
PREFIX-TYPE-DDMMYY-NNNNN
```

| Part | Example | Description |
|------|---------|-------------|
| PREFIX | `TR` | Department prefix (TR, TA, AS) |
| TYPE | `PPL` | Document type code |
| DDMMYY | `240626` | Date created (day-month-year) |
| NNNNN | `00001` | Sequential number (per type) |

### Examples

| Control Number | Meaning |
|----------------|---------|
| `TR-PPL-240626-00001` | 1st Project Plan, created June 24, 2026 |
| `AS-CRR-240626-00003` | 3rd Customer Report, created June 24, 2026 |
| `TA-ALL-240626-00001` | 1st Announcement to All Staff, June 24, 2026 |

> Announcements (TAN) use the audience instead of the type code: `TA-ALL`, `TA-VIP`, `TA-B2B`, etc.

---

## 11. Tips & Best Practices

**Complete the BOM carefully.**
The AI report pulls quantities and costs directly from the BOM table. Incomplete or zero-value rows will appear in the generated report.

**Use Reference fields.**
Linking PRD → PPL → PSM keeps the project paper trail intact and helps the AI understand context across documents.

**Add photo captions.**
When attaching photos, fill in the Caption and Context fields. The AI includes these in the report narrative.

**Change status promptly.**
Move documents from Draft → Submitted → Approved as they progress. This keeps the Documents list accurate and makes it easier for the team to see what needs attention.

**Use the search bar.**
You can search by title or control number. Searching `TR-PPL` will show all Project Plans. Searching a client name will surface related documents.

**Keep Ollama running.**
If the Generate Report button returns an error saying it cannot reach Ollama, open a terminal and run `ollama serve`. You can leave this running in the background all day.

**One document per event.**
Avoid cramming multiple projects or issues into one document. Use the reference fields to link related documents instead.

---

*TR-Report — Internal Use Only — Jassen Harris Industries Corporation*

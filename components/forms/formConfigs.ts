import { DocType } from '@/types/documents'

export type FieldType = 'text' | 'date' | 'number' | 'select' | 'textarea' | 'reference' | 'file' | 'checkbox-group' | 'bom-table' | 'addon-table' | 'psm-bom-table' | 'rpr-bom-table' | 'trp-contain-table' | 'metrics'

export interface FieldDef {
  id: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  options?: string[]
  referenceType?: string
  readOnly?: boolean
  span?: 2
  hint?: string
}

export interface SectionDef {
  title: string
  fields: FieldDef[]
}

export interface StepDef {
  label: string
  sections: SectionDef[]
}

export interface FormConfig {
  type: 'step' | 'doc'
  steps?: StepDef[]
  sections?: SectionDef[]
}

// ─── PPL ─────────────────────────────────────────────────────────────
const PPL: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'Project Basics',
      sections: [{
        title: 'Project Basics',
        fields: [
          { id: 'ppl_name', label: 'Project Name / Title', type: 'text', required: true, span: 2, placeholder: 'Full project title' },
          { id: 'ppl_client', label: 'Client Name', type: 'text', required: true, placeholder: 'Client or company name' },
          { id: 'ppl_order_date', label: 'Date of Order', type: 'date', required: true },
          { id: 'ppl_deadline', label: 'Deadline', type: 'date', required: true },
          { id: 'ppl_priority', label: 'Priority', type: 'select', required: true, options: ['Urgent', 'Standard'] },
          { id: 'ppl_assigned', label: 'Assigned Team / Person', type: 'text', required: true, span: 2, placeholder: 'Team name or person responsible' },
        ]
      }]
    },
    {
      label: 'Specifications',
      sections: [{
        title: 'Specifications',
        fields: [
          { id: 'ppl_specs', label: 'Specifications', type: 'textarea', required: true, span: 2, placeholder: 'Full project specifications, requirements, and constraints…' },
          { id: 'ppl_notes', label: 'Notes / Special Instructions', type: 'textarea', span: 2, placeholder: 'Any special handling, client preferences, or additional context…' },
          { id: 'ppl_docs', label: 'Documents Given', type: 'file', span: 2 },
        ]
      }]
    },
    {
      label: 'BOM & Pricing',
      sections: [
        { title: 'Estimated BOM', fields: [{ id: 'ppl_bom', label: 'Bill of Materials', type: 'bom-table', span: 2 }] },
        { title: 'Estimated Pricing', fields: [{ id: 'ppl_addon', label: 'Custom Pricing Items', type: 'addon-table', span: 2 }] },
      ]
    },
  ]
}

// ─── PRD ─────────────────────────────────────────────────────────────
const PRD: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'Project Reference',
      sections: [{
        title: 'Link to Project',
        fields: [
          { id: 'prd_ppl_ref', label: 'PPL Control Number', type: 'reference', required: true, referenceType: 'PPL', placeholder: 'TR-PPL-DDMMYY-00001' },
          { id: 'prd_psm_ref', label: 'PSM Reference (optional)', type: 'reference', referenceType: 'PSM', placeholder: 'TR-PSM-DDMMYY-00001' },
          { id: 'prd_proj_name', label: 'Project Name', type: 'text', placeholder: 'Pulled from PPL…' },
          { id: 'prd_client', label: 'Client', type: 'text', placeholder: 'Pulled from PPL…' },
          { id: 'prd_date', label: 'Production Order Date', type: 'date', required: true },
          { id: 'prd_priority', label: 'Priority', type: 'select', required: true, options: ['Urgent', 'Standard'] },
          { id: 'prd_target', label: 'Target Completion Date', type: 'date', required: true },
          { id: 'prd_assigned', label: 'Assigned To', type: 'text', required: true, placeholder: 'Person or team responsible' },
        ]
      }]
    },
    {
      label: 'Bill of Materials',
      sections: [
        { title: 'Bill of Materials', fields: [{ id: 'prd_bom', label: 'BOM', type: 'bom-table', span: 2 }] },
        { title: 'Pricing', fields: [{ id: 'prd_addon', label: 'Custom Pricing Items', type: 'addon-table', span: 2 }] },
      ]
    },
    {
      label: 'Production Details',
      sections: [{
        title: 'Specifications & Notes',
        fields: [
          { id: 'prd_specs', label: 'Specifications (from PPL — editable)', type: 'textarea', span: 2, placeholder: 'Production specifications…' },
          { id: 'prd_notes', label: 'Special Instructions / Notes', type: 'textarea', span: 2, placeholder: 'Any special production notes…' },
          { id: 'prd_files', label: 'Attachments', type: 'file', span: 2 },
        ]
      }]
    },
  ]
}

// ─── PSM ─────────────────────────────────────────────────────────────
const PSM: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'References',
      sections: [{
        title: 'Link to Project & Production',
        fields: [
          { id: 'psm_ppl_ref', label: 'PPL Control Number', type: 'reference', required: true, referenceType: 'PPL', placeholder: 'TR-PPL-DDMMYY-00001' },
          { id: 'psm_prd_ref', label: 'PRD Control Number', type: 'reference', required: true, referenceType: 'PRD', placeholder: 'TR-PRD-DDMMYY-00001' },
          { id: 'psm_proj_name', label: 'Project Name', type: 'text', placeholder: 'Pulled from PPL…' },
          { id: 'psm_client', label: 'Client', type: 'text', placeholder: 'Pulled from PPL…' },
          { id: 'psm_period_start', label: 'Period Covered — Start', type: 'date', required: true },
          { id: 'psm_period_end', label: 'Period Covered — End', type: 'date', required: true },
        ]
      }]
    },
    {
      label: 'BOM Comparison',
      sections: [{ title: 'Actual BOM vs Estimate', fields: [{ id: 'psm_bom', label: 'BOM Comparison', type: 'psm-bom-table', span: 2 }] }]
    },
    {
      label: 'Summary & Sign-off',
      sections: [{
        title: 'Summary',
        fields: [
          { id: 'psm_status', label: 'Overall Status', type: 'select', required: true, options: ['On Track', 'Delayed', 'Completed', 'On Hold', 'Cancelled'] },
          { id: 'psm_date_completed', label: 'Date Completed', type: 'date' },
          { id: 'psm_delivered', label: 'Delivered to Client', type: 'select', options: ['Yes', 'No', 'Partial'] },
          { id: 'psm_delivery_date', label: 'Delivery Date', type: 'date' },
          { id: 'psm_approved_by', label: 'Approved By', type: 'text', placeholder: 'Full name, title' },
          { id: 'psm_summary', label: 'Summary / Notes', type: 'textarea', required: true, span: 2, placeholder: 'Overall project summary…' },
          { id: 'psm_issues', label: 'Issues Encountered', type: 'textarea', span: 2, placeholder: 'Any issues, delays, or deviations…' },
          { id: 'psm_files', label: 'Attachments', type: 'file', span: 2 },
        ]
      }]
    },
  ]
}

// ─── IDM ─────────────────────────────────────────────────────────────
const IDM: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'Recipient',
      sections: [{
        title: 'Recipient Details',
        fields: [
          { id: 'idm_to_dept', label: 'To — Department', type: 'text', required: true, placeholder: 'Receiving department name' },
          { id: 'idm_to_person', label: 'To — Person', type: 'text', required: true, placeholder: 'Full name, title' },
          { id: 'idm_req_type', label: 'Request Type', type: 'select', required: true, options: ['Request for Action', 'Request for Information', 'Coordination', 'Approval Request', 'Other'] },
          { id: 'idm_priority', label: 'Priority', type: 'select', required: true, options: ['Urgent', 'High', 'Normal', 'Low'] },
        ]
      }]
    },
    {
      label: 'Subject & Description',
      sections: [{
        title: 'Content',
        fields: [
          { id: 'idm_subject', label: 'Subject', type: 'text', required: true, span: 2, placeholder: 'Brief subject line' },
          { id: 'idm_desc', label: 'Description', type: 'textarea', required: true, span: 2, placeholder: 'Full description of the request or coordination needed…' },
        ]
      }]
    },
    {
      label: 'Response & Attachments',
      sections: [{
        title: 'Response',
        fields: [
          { id: 'idm_response_date', label: 'Expected Response Date', type: 'date', required: true },
          { id: 'idm_ref_doc', label: 'Related Document (optional)', type: 'reference', referenceType: 'REF', placeholder: 'Control number' },
          { id: 'idm_files', label: 'Attachments', type: 'file', span: 2 },
        ]
      }]
    },
  ]
}

// ─── CRR ─────────────────────────────────────────────────────────────
const CRR: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'Customer Details',
      sections: [{
        title: 'Customer Information',
        fields: [
          { id: 'crr_cust_name', label: 'Customer Name', type: 'text', required: true, placeholder: 'Full name' },
          { id: 'crr_contact', label: 'Contact Number', type: 'text', placeholder: 'Phone or email' },
          { id: 'crr_purchase_date', label: 'Purchase Date', type: 'date' },
          { id: 'crr_channel', label: 'Purchase Channel', type: 'select', required: true, options: ['In-store', 'Online', 'B2B / Corporate', 'Other'] },
          { id: 'crr_warranty', label: 'Warranty Status', type: 'select', required: true, options: ['Within Warranty', 'Expired', 'No Warranty', 'Unknown'] },
          { id: 'crr_date_reported', label: 'Date Reported', type: 'date', required: true },
        ]
      }]
    },
    {
      label: 'Product & Issue',
      sections: [{
        title: 'Product & Issue',
        fields: [
          { id: 'crr_prod_name', label: 'Product Name', type: 'text', required: true, placeholder: 'Full product name' },
          { id: 'crr_sku', label: 'SKU', type: 'text', placeholder: 'SKU or part number' },
          { id: 'crr_batch', label: 'Batch / Lot Number', type: 'text', placeholder: 'Batch or lot if known' },
          { id: 'crr_serial', label: 'Serial Number', type: 'text', placeholder: 'Unit serial number' },
          { id: 'crr_issue', label: 'Issue Description', type: 'textarea', required: true, span: 2, placeholder: 'Describe the customer\'s complaint or issue in detail…' },
          { id: 'crr_assessment', label: 'Initial Assessment', type: 'textarea', span: 2, placeholder: 'Technician or staff initial assessment…' },
          { id: 'crr_action', label: 'Recommended Action', type: 'select', span: 2, options: ['Proceed to Repair', 'Proceed to Refund', 'Replace Unit', 'No Action — User Error', 'Escalate to Technical', 'Pending Assessment'] },
        ]
      }]
    },
    {
      label: 'Attachments',
      sections: [{ title: 'Attachments', fields: [{ id: 'crr_files', label: 'Photos of unit, receipt, etc.', type: 'file', span: 2 }] }]
    },
  ]
}

// ─── RPR ─────────────────────────────────────────────────────────────
const RPR: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'Reference',
      sections: [{
        title: 'Link to Customer Report',
        fields: [
          { id: 'rpr_crr_ref', label: 'CRR Control Number', type: 'reference', required: true, referenceType: 'CRR', placeholder: 'AS-CRR-DDMMYY-00001' },
          { id: 'rpr_cust_name', label: 'Customer Name (auto-fill)', type: 'text', placeholder: 'Pulled from CRR…' },
          { id: 'rpr_prod_name', label: 'Product Name (auto-fill)', type: 'text', placeholder: 'Pulled from CRR…' },
          { id: 'rpr_sku', label: 'SKU (auto-fill)', type: 'text', placeholder: 'Pulled from CRR…' },
          { id: 'rpr_date', label: 'Repair Date', type: 'date', required: true },
          { id: 'rpr_tech', label: 'Technician', type: 'text', required: true, placeholder: 'Technician full name' },
        ]
      }]
    },
    {
      label: 'Repair Details',
      sections: [
        { title: 'Parts Used', fields: [{ id: 'rpr_bom', label: 'Parts', type: 'rpr-bom-table', span: 2 }] },
        { title: 'Notes', fields: [{ id: 'rpr_notes', label: 'Repair Notes', type: 'textarea', required: true, span: 2, placeholder: 'Describe what was done, what was found, parts replaced…' }] },
      ]
    },
    {
      label: 'Outcome & Attachments',
      sections: [{
        title: 'Outcome',
        fields: [
          { id: 'rpr_outcome', label: 'Outcome', type: 'select', required: true, options: ['Resolved — Unit Returned', 'Unresolved — Escalated', 'Unresolved — Proceed to Refund', 'Partially Resolved'] },
          { id: 'rpr_return_date', label: 'Date Returned to Customer', type: 'date' },
          { id: 'rpr_labor', label: 'Labor Cost (PHP)', type: 'number', placeholder: '0.00' },
          { id: 'rpr_total_cost', label: 'Total Repair Cost (PHP)', type: 'number', readOnly: true, placeholder: 'Auto-calculated' },
          { id: 'rpr_files', label: 'Attachments', type: 'file', span: 2 },
        ]
      }]
    },
  ]
}

// ─── RFD ─────────────────────────────────────────────────────────────
const RFD: FormConfig = {
  type: 'step',
  steps: [
    {
      label: 'Reference',
      sections: [{
        title: 'Link to Customer Report',
        fields: [
          { id: 'rfd_crr_ref', label: 'CRR Control Number', type: 'reference', required: true, referenceType: 'CRR', placeholder: 'AS-CRR-DDMMYY-00001' },
          { id: 'rfd_rpr_ref', label: 'RPR Reference (if applicable)', type: 'reference', referenceType: 'RPR', placeholder: 'AS-RPR-DDMMYY-00001' },
          { id: 'rfd_cust_name', label: 'Customer Name (auto-fill)', type: 'text', placeholder: 'Pulled from CRR…' },
          { id: 'rfd_prod_name', label: 'Product Name (auto-fill)', type: 'text', placeholder: 'Pulled from CRR…' },
        ]
      }]
    },
    {
      label: 'Refund Details',
      sections: [{
        title: 'Refund Information',
        fields: [
          { id: 'rfd_amount', label: 'Refund Amount (PHP)', type: 'number', required: true, placeholder: '0.00' },
          { id: 'rfd_method', label: 'Refund Method', type: 'select', required: true, options: ['Cash', 'Bank Transfer', 'Store Credit', 'Replacement Unit', 'Other'] },
          { id: 'rfd_date_req', label: 'Date Requested', type: 'date', required: true },
          { id: 'rfd_date_proc', label: 'Date Processed', type: 'date' },
          { id: 'rfd_reason', label: 'Reason for Refund', type: 'textarea', required: true, span: 2, placeholder: 'Reason for the refund…' },
        ]
      }]
    },
    {
      label: 'Approval & Notes',
      sections: [{
        title: 'Approval',
        fields: [
          { id: 'rfd_approved_by', label: 'Approved By', type: 'text', required: true, placeholder: 'Full name, title' },
          { id: 'rfd_approval_date', label: 'Approval Date', type: 'date' },
          { id: 'rfd_notes', label: 'Notes', type: 'textarea', span: 2, placeholder: 'Any additional notes about this refund…' },
          { id: 'rfd_files', label: 'Attachments', type: 'file', span: 2 },
        ]
      }]
    },
  ]
}

// ─── PRV (doc form) ───────────────────────────────────────────────────
const PRV: FormConfig = {
  type: 'doc',
  sections: [
    {
      title: 'Product Basics',
      fields: [
        { id: 'prv_name', label: 'Product Name', type: 'text', required: true, placeholder: 'Full commercial name' },
        { id: 'prv_sku', label: 'SKU / Part Number', type: 'text', required: true, placeholder: 'Exact SKU' },
        { id: 'prv_type', label: 'Review Type', type: 'select', required: true, options: ['New Product', 'Upcoming Product', 'Existing Product'] },
        { id: 'prv_brand', label: 'Brand / Manufacturer', type: 'text', placeholder: 'Brand or manufacturer name' },
        { id: 'prv_date', label: 'Date of Review', type: 'date', required: true },
        { id: 'prv_reviewer', label: 'Reviewed By', type: 'text', required: true, placeholder: 'Full name, title' },
      ]
    },
    {
      title: 'Product Details',
      fields: [
        { id: 'prv_desc', label: 'Description', type: 'textarea', span: 2, placeholder: 'Product description…' },
        { id: 'prv_specs', label: 'Specifications', type: 'textarea', span: 2, placeholder: 'Technical specifications…' },
        { id: 'prv_market', label: 'Target Market / Segment', type: 'select', options: ['Consumer Retail', 'SMB', 'Enterprise', 'All Segments'] },
        { id: 'prv_price', label: 'Pricing (PHP)', type: 'number', placeholder: '0.00' },
        { id: 'prv_files', label: 'Documents / References', type: 'file', span: 2 },
      ]
    },
    {
      title: 'Findings & Recommendation',
      fields: [
        { id: 'prv_strengths', label: 'Strengths', type: 'textarea', span: 2, placeholder: 'Key strengths of the product…' },
        { id: 'prv_weaknesses', label: 'Weaknesses', type: 'textarea', span: 2, placeholder: 'Identified weaknesses or concerns…' },
        { id: 'prv_assessment', label: 'Overall Assessment', type: 'textarea', span: 2, placeholder: 'Overall evaluation summary…' },
        { id: 'prv_recommendation', label: 'Recommendation', type: 'select', required: true, options: ['Approve', 'Conditional Approval', 'Reject', 'Further Review Needed'] },
        { id: 'prv_notes', label: 'Notes / Special Considerations', type: 'textarea', span: 2, placeholder: 'Additional notes…' },
      ]
    },
  ]
}

// ─── PTT (doc form) ───────────────────────────────────────────────────
const PTT: FormConfig = {
  type: 'doc',
  sections: [
    {
      title: 'Product Reference',
      fields: [
        { id: 'ptt_prv_ref', label: 'PRV Control Number', type: 'reference', required: true, referenceType: 'PRV', placeholder: 'TR-PRV-DDMMYY-00001' },
        { id: 'ptt_prod_name', label: 'Product Name (auto-fill)', type: 'text', placeholder: 'Pulled from PRV…' },
        { id: 'ptt_sku', label: 'SKU (auto-fill)', type: 'text', placeholder: 'Pulled from PRV…' },
        { id: 'ptt_brand', label: 'Brand (auto-fill)', type: 'text', placeholder: 'Pulled from PRV…' },
        { id: 'ptt_test_type', label: 'Test Type', type: 'select', required: true, options: ['Functional Test', 'Stress Test', 'Safety Test', 'Performance Test', 'Compatibility Test', 'Other'] },
        { id: 'ptt_equipment', label: 'Equipment Used', type: 'text', placeholder: 'Test equipment or tools used' },
        { id: 'ptt_date', label: 'Test Date', type: 'date', required: true },
        { id: 'ptt_tester', label: 'Tested By', type: 'text', required: true, placeholder: 'Full name, title' },
      ]
    },
    {
      title: 'Test Conditions & Criteria',
      fields: [
        { id: 'ptt_conditions', label: 'Test Conditions', type: 'textarea', required: true, span: 2, placeholder: 'Environmental and operational conditions during testing…' },
        { id: 'ptt_criteria', label: 'Pass / Fail Criteria', type: 'textarea', required: true, span: 2, placeholder: 'Define what constitutes pass or fail for each test…' },
        { id: 'ptt_procedure', label: 'Test Procedure / Steps', type: 'textarea', span: 2, placeholder: 'Step-by-step test procedure followed…' },
      ]
    },
    {
      title: 'Results & Conclusion',
      fields: [
        { id: 'ptt_results', label: 'Test Results', type: 'textarea', required: true, span: 2, placeholder: 'Detailed results of each test performed…' },
        { id: 'ptt_overall', label: 'Overall Result', type: 'select', required: true, options: ['Pass', 'Fail', 'Conditional Pass', 'Inconclusive'] },
        { id: 'ptt_conclusion', label: 'Conclusion & Recommendation', type: 'textarea', span: 2, placeholder: 'Summary conclusion and recommendations…' },
        { id: 'ptt_files', label: 'Attachments', type: 'file', span: 2 },
      ]
    },
  ]
}

// ─── PRP (doc form) ───────────────────────────────────────────────────
const PRP: FormConfig = {
  type: 'doc',
  sections: [
    {
      title: 'Product Reference',
      fields: [
        { id: 'prp_prod_name', label: 'Product Name', type: 'text', required: true, placeholder: 'Full product name' },
        { id: 'prp_sku', label: 'SKU', type: 'text', required: true, placeholder: 'SKU or part number' },
        { id: 'prp_issue_type', label: 'Issue Type', type: 'select', required: true, options: ['Customer Complaint', 'Field Feedback', 'Post-Evaluation Finding', 'Quality Issue', 'Other'] },
        { id: 'prp_severity', label: 'Severity', type: 'select', required: true, options: ['Critical', 'Major', 'Minor'] },
        { id: 'prp_ref', label: 'Related PRV / PTT', type: 'reference', referenceType: 'REF', placeholder: 'TR-PRV or TR-PTT control number' },
        { id: 'prp_date', label: 'Date of Report', type: 'date', required: true },
      ]
    },
    {
      title: 'Issue Description & Impact',
      fields: [
        { id: 'prp_desc', label: 'Issue Description', type: 'textarea', required: true, span: 2, placeholder: 'Detailed description of the issue…' },
        { id: 'prp_impact', label: 'Impact Assessment', type: 'textarea', required: true, span: 2, placeholder: 'Business, safety, or customer impact…' },
        { id: 'prp_evidence', label: 'Evidence Available', type: 'checkbox-group', span: 2, options: ['Customer complaint records', 'Photographs / video', 'Lab test results', 'Returned unit available'] },
        { id: 'prp_files', label: 'Attachments', type: 'file', span: 2 },
      ]
    },
    {
      title: 'Recommended Action',
      fields: [
        { id: 'prp_action', label: 'Recommended Action', type: 'textarea', required: true, span: 2, placeholder: 'What action is recommended to resolve this issue…' },
        { id: 'prp_escalate', label: 'Escalate to Technical Report?', type: 'select', options: ['Yes — Create TRP', 'No — Handle at PRP level', 'Monitor — Escalate if recurs'] },
        { id: 'prp_notes', label: 'Additional Notes', type: 'textarea', span: 2, placeholder: 'Any additional context or notes…' },
      ]
    },
  ]
}

// ─── TRP (doc form) ───────────────────────────────────────────────────
const TRP: FormConfig = {
  type: 'doc',
  sections: [
    {
      title: 'Product Identification',
      fields: [
        { id: 'trp_prod_name', label: 'Product Name', type: 'text', required: true, placeholder: 'Full commercial name' },
        { id: 'trp_sku', label: 'SKU', type: 'text', required: true, placeholder: 'Exact SKU' },
        { id: 'trp_batch', label: 'Batch / Lot Number(s)', type: 'text', required: true, placeholder: 'All affected batches — semicolon separated' },
        { id: 'trp_fw', label: 'Firmware / Software Version', type: 'text', placeholder: 'e.g. v2.3.1-release' },
        { id: 'trp_prp_ref', label: 'Related PRP', type: 'reference', referenceType: 'PRP', placeholder: 'TR-PRP-DDMMYY-00001' },
        { id: 'trp_severity', label: 'Severity', type: 'select', required: true, options: ['Critical', 'Major', 'Minor'] },
      ]
    },
    {
      title: 'Issue Summary',
      fields: [
        { id: 'trp_problem', label: 'Problem Statement', type: 'textarea', required: true, span: 2, placeholder: 'Bottom-line problem statement — what is failing, which product, since when, business impact…' },
        { id: 'trp_fm', label: 'Failure Mode', type: 'text', placeholder: 'Short failure mode title' },
        { id: 'trp_fm_cat', label: 'Failure Category', type: 'select', options: ['Mechanical', 'Electrical', 'Firmware/Software', 'Cosmetic', 'Packaging', 'Supply Chain', 'Other'] },
        { id: 'trp_first_obs', label: 'First Observed Date', type: 'date' },
        { id: 'trp_most_recent', label: 'Most Recent Incident Date', type: 'date' },
        { id: 'trp_fm_desc', label: 'Failure Description', type: 'textarea', required: true, span: 2, placeholder: 'Precise technical description of what fails and how…' },
        { id: 'trp_triggers', label: 'Trigger Conditions', type: 'textarea', span: 2, placeholder: 'Conditions that reproduce the failure…' },
      ]
    },
    {
      title: 'Trend Data',
      fields: [
        { id: 'trp_incidents', label: 'Total Confirmed Incidents', type: 'number', required: true, placeholder: '0' },
        { id: 'trp_units', label: 'Units Deployed', type: 'number', required: true, placeholder: '0' },
        { id: 'trp_win_start', label: 'Window Start', type: 'date' },
        { id: 'trp_win_end', label: 'Window End', type: 'date' },
        { id: 'trp_trend', label: 'Trend Direction', type: 'select', options: ['Increasing', 'Stable', 'Decreasing', 'Insufficient Data'] },
      ]
    },
    {
      title: 'Root Cause Analysis',
      fields: [
        { id: 'trp_rca_status', label: 'RCA Status', type: 'select', required: true, options: ['Confirmed', 'Probable Hypothesis', 'Under Investigation', 'Unknown'] },
        { id: 'trp_rca_cause', label: 'Suspected Root Cause', type: 'textarea', span: 2, placeholder: 'State the most likely cause and evidence basis…' },
        { id: 'trp_rca_factors', label: 'Contributing Factors', type: 'textarea', span: 2, placeholder: 'Secondary conditions that amplify the failure…' },
        { id: 'trp_methods', label: 'Analysis Methods Applied', type: 'checkbox-group', span: 2, options: ['Visual Inspection', 'Functional / Bench Testing', '5-Why Analysis', 'Fishbone / Ishikawa', '8D Problem Solving', 'FMEA', 'Statistical Process Control', 'Other'] },
      ]
    },
    {
      title: 'Actions Taken',
      fields: [
        { id: 'trp_contain', label: 'Containment Actions', type: 'trp-contain-table', span: 2 },
        { id: 'trp_req_actions', label: 'Requested Actions', type: 'checkbox-group', span: 2, options: [
          'Formal Root Cause Analysis (8D) — With defined completion timeline',
          'Engineering Analysis of Returned Units — Units available for shipment',
          'Firmware / Software Patch — Specify fix scope and target date',
          'Full Unit Replacement (RMA) — Specify unit count',
          'Batch Hold at Origin — Before next shipment',
          'Design Engineering Change Order — Describe proposed scope',
          'Credit Note / Compensation — Reference PO and unit count',
          'Formal CAPA Documentation — With milestones and owners',
        ]},
        { id: 'trp_files', label: 'Attachments', type: 'file', span: 2 },
      ]
    },
  ]
}

// ─── TAN (doc form) ───────────────────────────────────────────────────
const TAN: FormConfig = {
  type: 'doc',
  sections: [
    {
      title: 'Announcement Details',
      fields: [
        { id: 'tan_title', label: 'Title', type: 'text', required: true, span: 2, placeholder: 'Announcement title' },
        { id: 'tan_audience', label: 'Audience', type: 'select', required: true, options: ['All / General', 'Accounting', 'Marketing', 'B2B / Reseller', 'VIP', 'Other (TBD)'] },
        { id: 'tan_eff_date', label: 'Effective Date', type: 'date', required: true },
      ]
    },
    {
      title: 'Announcement Body',
      fields: [{ id: 'tan_body', label: 'Content', type: 'textarea', required: true, span: 2, placeholder: 'Write the full announcement here…' }]
    },
    {
      title: 'Attachments',
      fields: [{ id: 'tan_files', label: 'Attachments', type: 'file', span: 2 }]
    },
  ]
}

// ─── Export ───────────────────────────────────────────────────────────
export const FORM_CONFIGS: Record<DocType, FormConfig> = {
  PPL, PRD, PSM, IDM, CRR, RPR, RFD,
  PRV, PTT, PRP, TRP, TAN,
}

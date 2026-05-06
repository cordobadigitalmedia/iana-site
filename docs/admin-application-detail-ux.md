# Admin application detail – UX plan (workflow-based tabs + collapsibles)

## Application workflow (summary)

1. **Preliminary**: Applicant submits one or more preliminary applications (Education, Personal, Business). Admin reviews form data and documents, sets status (Not Now / Pending / Invite for Full Application), may email applicant. **No checklist** – guarantor, references, interview, and loan approval do not apply.
2. **Final**: After invite, applicant submits Final Interest-Free Loan Application. Admin uses **checklist** (guarantor & references received/approved, interview, loan approved), reviews form data and documents, guarantor & reference responses, notes, and may email applicant.

---

## Proposed layout: Tabs by workflow stage + Collapsibles

### 1. Page header

- **Back to list** (button).
- **Applicant name** as primary title (or “Applicant” if no name).

### 2. Tabs – by workflow stage (not per application)

- **Tab 1: Preliminaries** – All preliminary submissions for this applicant. Checklist and Guarantor & references do **not** appear here (they are final-only).
- **Tab 2: Final application** – Shown only when the applicant has a final submission. Contains checklist, guarantor & references, and full detail.
- **Default tab**: If the URL `[id]` is a final application → open “Final application”. If `[id]` is a preliminary → open “Preliminaries”.

### 3. Preliminaries tab content

- **One collapsible per** preliminary application (e.g. “Preliminary – Education (2/9/2026)”).
- Inside each collapsible, an **accordion** with:
  - **Overview** – status, submitted date, email, update status.
  - **Email applicant** – templates (invite / pending / not now).
  - **Form data** – copyable fields, CSV export.
  - **Application documents** – document preview links.
  - **Notes & comments**.
- **No Checklist**, **no Guarantor & references** in this tab.

### 4. Final application tab content

- If there is a final submission: **one accordion** with:
  - **Overview** – status, submitted date, email, update status.
  - **Email applicant** – templates.
  - **Checklist** – guarantor/refs approved, interview date/notes, loan approved.
  - **Form data** – copyable fields, CSV export.
  - **Application documents** – document preview links.
  - **Guarantor & references** – response links and documents.
  - **Notes & comments**.
- If no final application: show “No final application submitted.”

### 5. URL and edge cases

- **URL**: Keep `/admin/applications/[id]`. The `id` decides which tab is active on load.
- **Only preliminaries**: Show both tabs; “Final application” tab shows “No final application submitted.”
- **Reviewer role**: Same layout; edit actions (status, email, checklist, add note) remain hidden as today.

---

## Summary

| Layer        | Role for reviewers |
|-------------|--------------------|
| **Tabs**    | **Preliminaries** vs **Final application** – matches workflow; checklist only in Final. |
| **Collapsibles** | In Preliminaries: one per preliminary (type + date). In both: accordion sections (overview, form, documents, notes; Final adds checklist + guarantor & refs). |

Result: applicant-centric page, workflow-aligned tabs (no checklist in preliminaries), and scannable sections via collapsibles.

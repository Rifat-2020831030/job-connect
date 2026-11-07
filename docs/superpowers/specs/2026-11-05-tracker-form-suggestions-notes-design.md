# Design Document: Job Tracker Form Suggestions, Validation, Optional Deadline, & Notes Flow

## Intent & Why
Enhance the user experience of the Application Tracker's "Add External Job" modal and notes management. When tracking external opportunities, users should get intelligent title and company autocompletion based on existing data, clear visual cues for required fields with helpful validation errors, flexibility to omit deadlines when job postings lack them, and a matured, single continuous note workflow from creation to tracking review.

## Goals
1. **Title & Company Autocomplete**:
   - Provide a fast suggestion endpoint (`GET /api/users/:id/tracker-suggestions?field=title|company&q=<query>`).
   - Titles are suggested exclusively from `external_jobs`.
   - Companies are suggested from both `jobs` and `external_jobs`.
   - Ensure MongoDB indexes exist: `{ title: 1 }` on `external_jobs`, and `{ company: 1 }` on both `jobs` and `external_jobs`.
2. **Mandatory Fields & Validation Cues**:
   - Distinct red asterisk (`*`) for mandatory fields in `AddExternalJobModal`: `Job URL` in Step 1; `Job Title`, `Company Name`, and `Platform` in Step 2.
   - Interactive validation states on touch/blur or invalid submit attempt (red border, red focus ring, and inline validation helper message below field).
3. **Optional Deadline**:
   - Make `deadline` explicitly optional in backend creation (`tracker-controller.js`) and validation schemas.
   - Remove required styling from the `deadline` input in `AddExternalJobModal`.
4. **Matured Single Continuous Notes Flow**:
   - Allow adding an initial note directly in `AddExternalJobModal` (Step 2).
   - In `TrackerNotesModal`: display note character count, last updated timestamp, improved editing UI, and clean save state.
   - In `TrackerTable`: show a note preview on hovering over the Notes badge.

## Non-Goals & Anti-Goals
- **Non-goal**: Multi-entry timestamped notes list (user specified to keep the note as a single continuous note).
- **Non-goal**: Indexing titles on internal `jobs` collection (user specified title index on `external_jobs` only).
- **Anti-goal**: Breaking existing tracked jobs schema or history tracking state machine.
- **Anti-goal**: Blocking the UI with synchronous/un-debounced search requests.

## Approaches Considered
- **Approach A (Selected)**: Dynamic Indexed Suggestions + Polished Integrated Notes.
  - Dedicated endpoint querying indexed MongoDB fields with prefix regex (escaped regex, case-insensitive, limit 8).
  - Custom combobox/suggestion dropdown in Next.js frontend with keyboard navigation and click-away support.
  - Comprehensive inline field validation states with red asterisks and error messages.
  - Notes field added to the external job modal and enriched `TrackerNotesModal` with metadata and table preview.
- **Approach B**: HTML5 `<datalist>` Preload + Minimal Validation.
  - Preload all company/job titles and use native `<datalist>`.
  - Trade-off: Lacks loading state, inconsistent browser rendering, and doesn't scale as data grows. Rejected.

## Detailed Architecture & Implementation

### 1. Database Indexes
- Indexes are managed directly at the database level:
  - `external_jobs`: Atlas Search index with autocomplete on `title` (supports mid-phrase matching and fuzzy tolerance).
  - `external_jobs`: `{ company: 1 }` (normal B-tree index).
  - `jobs`: `{ company: 1 }` (normal B-tree index).
- No runtime index creation script in application code.

### 2. Backend (`server`)
- **Controller (`tracker-controller.js`)**:
  - Update `getTrackerSuggestions`:
    - Reads query parameters: `field` (`"title"` | `"company"`) and `q` (string, trimmed).
    - If `q` is empty or shorter than 1 character, returns empty array `[]`.
    - If `field === "title"`: queries `external_jobs.find({ title: { $regex: ^regex, $options: "i" } }).project({ title: 1 }).limit(15)`, deduplicates and returns top 8.
    - If `field === "company"`: queries both `jobs` and `external_jobs` matching `company: { $regex: ^regex, $options: "i" }`, merges, case-normalizes/deduplicates, and returns top 8.
  - Update `addTrackedJob`:
    - Remove `deadline` from required fields check:
      Change `const givenReq = title && company && platform && deadline;` to `const givenReq = title && company && platform;`.
    - If `deadline` is omitted or empty string, store as `null` or omit.
    - Persist `notes` if provided in body.
- **Validation (`validators.js`)**:
  - Ensure `addTrackedJobSchema` accepts `deadline: z.string().nullable().optional()`.
  - Add `trackerSuggestionsSchema` for query validation (`field: z.enum(["title", "company"])`, `q: z.string().optional()`).

### 3. Frontend (`client_v2`)
- **`AddExternalJobModal.tsx`**:
  - Input field validation tracking: `touched` state and inline error messages for `url` (Step 1), `title`, `company`, `platform` (Step 2).
  - Red asterisk (`*`) beside mandatory labels; `Deadline (Optional)` clearly labeled without asterisk.
  - Autocomplete suggestion popovers for `Job Title` and `Company Name`:
    - Debounced fetch to `/api/users/:id/tracker-suggestions?field=...&q=...`.
    - Suggestion list dropdown with selection on click or keyboard Enter/tab.
    - Dismiss on click outside or blur.
  - Optional `Notes` textarea in Step 2:
    - Pre-populates initial note in `POST /users/:id/tracked-jobs`.
- **`TrackerNotesModal.tsx`**:
  - Displays "Last edited" timestamp (`formatDateTime(job.updatedAt)`).
  - Clean textarea with word/character count and placeholder prompts.
  - Clear unsaved changes indicator and save status.
- **`TrackerTable.tsx`**:
  - Add hover tooltip / snippet for `Notes` badge so users can quickly preview notes without opening the modal.

## What's Left to Builder
- Implement index initialization helper.
- Update server routes and controllers.
- Update frontend components (`AddExternalJobModal`, `TrackerNotesModal`, `TrackerTable`).
- Verify with unit tests / manual API curl verification and build check (`npm run build` in `client_v2`).

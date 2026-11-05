# Job Tracker Form Suggestions, Validation, Optional Deadline, & Notes Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement indexed autocomplete suggestions for external job title and company, form validation with red asterisks and invalidation cues, an optional deadline field, and a matured single continuous notes flow in the application tracker.

**Architecture:**
- **Backend:** Indexes `{ title: 1 }` on `external_jobs` and `{ company: 1 }` on `jobs` & `external_jobs` are managed directly at the database level. Update `GET /api/users/:id/tracker-suggestions` to support `field=title|company` and query `q`. Update `addTrackedJob` to remove deadline as a mandatory requirement and persist optional initial notes.
- **Frontend:** Build a reusable, accessible suggestions combobox popover in `AddExternalJobModal`. Add red asterisks and inline invalidation cues (`touched` state, red border, helper messages) for mandatory fields. Add initial note capture to `AddExternalJobModal`, improve `TrackerNotesModal` with timestamps and better UI, and add a hover note preview in `TrackerTable`.

**Tech Stack:** Express 5, Node.js 24, MongoDB Driver 7, Next.js 16 (App Router), React 19, Tailwind CSS 4, Lucide React, Sonner.

**Spec:** `docs/superpowers/specs/2026-11-05-tracker-form-suggestions-notes-design.md`

## Global Constraints
- Only work in `client_v2` for the frontend (do not touch `client`).
- Never read or inspect `.env` or environment files.
- Title index on `external_jobs` only; company suggestions query both `jobs` and `external_jobs`.
- Keep notes as a single continuous note string (no multi-entry array breaking existing schemas).
- All changes must pass build (`npm run build` in `client_v2`) and tests without regressions.

## Review Focus
1. Empty/short query behavior: Suggestions endpoint with `q=""` or whitespace must return empty array without database load or regex error.
2. Case-insensitivity and regex escaping: Special characters in title/company search (e.g. `C++`, `A&T`, `(Remote)`) must not break regex queries.
3. Submitting external job without deadline: Empty string or omitted deadline must successfully insert without 400 Bad Request.
4. Blur vs Submit validation cues: Fields should not show jarring red errors before the user has either blurred the input or clicked Next/Save.
5. Notes persistence: Notes provided at external job creation must be properly saved in `job_track.notes` and visible immediately in `TrackerTable` and `TrackerNotesModal`.

---

### Task 1: Server: Autocomplete Suggestions Endpoint

**Files:**
- Modify: `server/src/controller/tracker-controller.js:469-494`
- Modify: `server/src/utils/validators.js:180-245`
- Modify: `server/src/routers/users.js:50-55`
- Test: `server/tests/tracker-suggestions.test.js`

**Interfaces:**
- Consumes: `getDB` from `server/src/db/database.js`, `escapeRegex` from `server/src/controller/job-controller/shared.js` (indexes on `external_jobs.title`, `external_jobs.company`, and `jobs.company` managed on database level)
- Produces: `getTrackerSuggestions(req, res)` handling query params `{ field: "title" | "company", q?: string }` returning `{ status: 1, data: string[] }`

- [ ] **Step 1: Write the failing test for tracker suggestions validation & helpers**

```javascript
// server/tests/tracker-suggestions.test.js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { escapeRegex } from "../src/controller/job-controller/shared.js";
import { trackerSuggestionsSchema } from "../src/utils/validators.js";

describe("tracker suggestions validation & helpers", () => {
  test("validates field as title or company", () => {
    const validTitle = trackerSuggestionsSchema.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
      query: { field: "title", q: "react" }
    });
    assert.strictEqual(validTitle.success, true);

    const validCompany = trackerSuggestionsSchema.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
      query: { field: "company", q: "google" }
    });
    assert.strictEqual(validCompany.success, true);

    const invalidField = trackerSuggestionsSchema.safeParse({
      params: { id: "507f1f77bcf86cd799439011" },
      query: { field: "invalid", q: "test" }
    });
    assert.strictEqual(invalidField.success, false);
  });

  test("escapes regex characters safely", () => {
    assert.strictEqual(escapeRegex("C++ Engineer (Senior)"), "C\\+\\+ Engineer \\(Senior\\)");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\server'; node --test tests/tracker-suggestions.test.js"`
Expected: FAIL (cannot find `trackerSuggestionsSchema`)

- [ ] **Step 3: Update `validators.js`, `tracker-controller.js`, and `users.js`**

- In `validators.js`: add `trackerSuggestionsSchema` with `params: { id: objectId("User ID") }`, `query: z.object({ field: z.enum(["title", "company"]), q: z.string().optional() })`.
- In `tracker-controller.js`:
  - In `getTrackerSuggestions`:
    - Extract `field` and `q` from `req.query`.
    - If `!q || !q.trim()`: return `res.status(200).json({ status: 1, data: [] })`.
    - Sanitized regex: `new RegExp("^" + escapeRegex(q.trim()), "i")`.
    - If `field === "title"`: query `external_jobs.find({ title: regex }, { projection: { title: 1, _id: 0 } }).limit(20).toArray()`, deduplicate case-insensitively, limit to 8 results, return `res.status(200).json({ status: 1, data: titles })`.
    - If `field === "company"`: query both `jobs.find({ company: regex }, { projection: { company: 1, _id: 0 } }).limit(20).toArray()` and `external_jobs.find({ company: regex }, { projection: { company: 1, _id: 0 } }).limit(20).toArray()`, combine, deduplicate, limit to 8 results, return `res.status(200).json({ status: 1, data: companies })`.
- In `users.js`: mount `validate(trackerSuggestionsSchema)` on `router.get("/:id/tracker-suggestions", ...)`.

- [ ] **Step 4: Run test to verify it passes**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\server'; node --test tests/tracker-suggestions.test.js"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C "d:\Programming\Project\jobs finder" add server/src/controller/tracker-controller.js server/src/utils/validators.js server/src/routers/users.js server/tests/tracker-suggestions.test.js
git -C "d:\Programming\Project\jobs finder" commit -m "feat(server): add title and company suggestion endpoint"
```

---

### Task 2: Server: Make Deadline Optional & Support Initial Notes in `addTrackedJob`

**Files:**
- Modify: `server/src/controller/tracker-controller.js:220-255`
- Modify: `server/src/utils/validators.js:201-224`
- Test: `server/tests/add-external-job.test.js`

**Interfaces:**
- Consumes: `addTrackedJobSchema` in `validators.js`, `addTrackedJob` in `tracker-controller.js`
- Produces: External jobs can be added without deadline; notes passed in body are stored in the tracked job document.

- [ ] **Step 1: Write test for external job validation without deadline**

```javascript
// server/tests/add-external-job.test.js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { addTrackedJobSchema } from "../src/utils/validators.js";

describe("addTrackedJobSchema validation", () => {
  test("allows external job without deadline", () => {
    const payload = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        type: "EXTERNAL",
        url: "https://example.com/careers/456",
        title: "Frontend Engineer",
        company: "Acme Corp",
        platform: "LinkedIn",
        notes: "Applied via referral"
      }
    };
    const result = addTrackedJobSchema.safeParse(payload);
    assert.strictEqual(result.success, true);
  });

  test("allows external job with empty or null deadline", () => {
    const payload = {
      params: { id: "507f1f77bcf86cd799439011" },
      body: {
        type: "EXTERNAL",
        url: "https://example.com/careers/456",
        title: "Frontend Engineer",
        company: "Acme Corp",
        platform: "LinkedIn",
        deadline: null
      }
    };
    const result = addTrackedJobSchema.safeParse(payload);
    assert.strictEqual(result.success, true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails if `deadline: null` fails schema**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\server'; node --test tests/add-external-job.test.js"`
Expected: Check current schema behavior on null/empty deadline.

- [ ] **Step 3: Update `validators.js` and `tracker-controller.js`**

- In `validators.js`:
  Update `deadline: z.string().nullable().optional()`.
- In `tracker-controller.js`:
  Change:
  ```javascript
  const givenReq = title && company && platform && deadline;
  ```
  to:
  ```javascript
  const givenReq = title && company && platform;
  ```
  Ensure `deadline: deadline || null` when inserting into `external_jobs`.
  Ensure `notes: notes || ""` is properly stored in `newTrack`.

- [ ] **Step 4: Run test to verify it passes**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\server'; node --test tests/add-external-job.test.js"`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git -C "d:\Programming\Project\jobs finder" add server/src/controller/tracker-controller.js server/src/utils/validators.js server/tests/add-external-job.test.js
git -C "d:\Programming\Project\jobs finder" commit -m "feat(server): make external job deadline optional and ensure notes support"
```

---

### Task 3: Client: Mandatory Field Cues & Validation in `AddExternalJobModal`

**Files:**
- Modify: `client_v2/src/components/tracker/AddExternalJobModal.tsx`

**Interfaces:**
- Consumes: Tailwind classes for error states (`border-red-500 focus:ring-red-500 text-red-900 bg-red-50/20`)
- Produces: Red asterisks on required fields, inline error messages on touched or failed submit, optional label on deadline.

- [ ] **Step 1: Define field error state and validation helper in `AddExternalJobModal.tsx`**

- Add state for `errors: Record<string, string>` and `touched: Record<string, boolean>`.
- In Step 1:
  - Label: `Job URL <span className="text-red-500">*</span>`
  - URL validation: must start with `http://` or `https://` and have valid domain structure.
  - On blur or next click, if invalid, set `errors.url = "Please enter a valid URL (e.g. https://...)"` and show red border with helper text underneath.
- In Step 2:
  - Labels:
    - `Job Title <span className="text-red-500">*</span>`
    - `Company Name <span className="text-red-500">*</span>`
    - `Platform <span className="text-red-500">*</span>`
    - `Deadline <span className="text-xs text-gray-400 font-normal">(Optional)</span>`
    - `Application Time <span className="text-xs text-gray-400 font-normal">(Optional)</span>`
    - `CV Link <span className="text-xs text-gray-400 font-normal">(Optional)</span>`
  - On blur of `title`, `company`, `platform`, if empty, set appropriate error.
  - In `handleSave`, validate all mandatory fields. If invalid, mark all touched, focus first error, and prevent submit.

- [ ] **Step 2: Verify `deadline` is optional in client save payload**

Ensure `deadline: deadline || undefined` is sent, and `handleSave` does not block on empty deadline.

- [ ] **Step 3: Test client build**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\client_v2'; npm run lint"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git -C "d:\Programming\Project\jobs finder" add client_v2/src/components/tracker/AddExternalJobModal.tsx
git -C "d:\Programming\Project\jobs finder" commit -m "feat(tracker): add mandatory cues, inline errors, and optional deadline"
```

---

### Task 4: Client: Dynamic Autocomplete Combobox for Title & Company

**Files:**
- Create: `client_v2/src/components/tracker/SuggestionInput.tsx`
- Modify: `client_v2/src/components/tracker/AddExternalJobModal.tsx`

**Interfaces:**
- Consumes: `/api/users/:id/tracker-suggestions?field=title|company&q=...` via `fetchWithAuth`
- Produces: `<SuggestionInput />` component supporting free-form input, debounced live suggestions, keyboard navigation (ArrowUp, ArrowDown, Enter, Escape), and outside-click dismiss.

- [ ] **Step 1: Implement `client_v2/src/components/tracker/SuggestionInput.tsx`**

Features:
- Props: `value`, `onChange`, `onBlur`, `field: "title" | "company"`, `placeholder`, `disabled`, `error`, `hasLock`, `onUnlock`.
- Debounces input changes (200ms) and fetches `/users/${userId}/tracker-suggestions?field=${field}&q=${encodeURIComponent(query)}`.
- Renders absolute dropdown below the input if suggestions exist and dropdown is open.
- Supports keyboard navigation:
  - ArrowDown / ArrowUp to move highlight index.
  - Enter to select highlighted suggestion and close dropdown.
  - Escape to close dropdown.
- Highlights matching prefix in suggestion item.
- Handles outside click with `useEffect` document listener.

- [ ] **Step 2: Integrate `SuggestionInput` into `AddExternalJobModal.tsx` for Title and Company**

Replace plain inputs for `title` and `company` with `<SuggestionInput />`.
Ensure field locking and unlock behavior from Step 1 autofill continue to work seamlessly.

- [ ] **Step 3: Test client lint & type-check**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\client_v2'; npm run lint"`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git -C "d:\Programming\Project\jobs finder" add client_v2/src/components/tracker/SuggestionInput.tsx client_v2/src/components/tracker/AddExternalJobModal.tsx
git -C "d:\Programming\Project\jobs finder" commit -m "feat(tracker): add dynamic autocomplete combobox for title and company"
```

---

### Task 5: Client: Matured Single Continuous Notes Flow

**Files:**
- Modify: `client_v2/src/components/tracker/AddExternalJobModal.tsx`
- Modify: `client_v2/src/components/tracker/TrackerNotesModal.tsx`
- Modify: `client_v2/src/components/tracker/TrackerTable.tsx`

**Interfaces:**
- Consumes: `notes` string in `TrackedJob`
- Produces: Initial note capture on job addition, rich editing UI with character count and last-updated metadata in `TrackerNotesModal`, and note preview tooltip on hover in `TrackerTable`.

- [ ] **Step 1: Add Notes textarea to `AddExternalJobModal.tsx`**

- Add state `notes: string` in `AddExternalJobModal`.
- Add collapsible or standard input section:
  ```tsx
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1">
      Notes <span className="text-xs text-gray-400 font-normal">(Optional)</span>
    </label>
    <textarea
      rows={3}
      placeholder="Add notes about your application, referral details, or thoughts..."
      className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
      value={notes}
      onChange={(e) => setNotes(e.target.value)}
    />
  </div>
  ```
- Include `notes: notes || undefined` in the POST payload to `/users/:id/tracked-jobs`.

- [ ] **Step 2: Mature `TrackerNotesModal.tsx`**

- Add "Last updated" header metadata: `Last updated: {formatDateTime(job.updatedAt)}`.
- Add character/word count indicator at bottom right of textarea.
- Add an "Unsaved changes" indicator when local note differs from `job.notes`.
- Add a "Discard changes" button when dirty to restore original note.
- Enhance placeholder to provide helpful structure (e.g. "Add notes about your application, recruiter contacts, interview questions, or follow-ups...").

- [ ] **Step 3: Mature notes preview in `TrackerTable.tsx`**

- In the Job Title cell where `job.notes` badge is displayed:
  - When hovering the `Notes` badge, display a small floating preview tooltip containing the first 100 characters of the note.
  - Clicking the badge directly opens `onOpenNotes(job)`.

- [ ] **Step 4: Verify client build**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\client_v2'; npm run build"`
Expected: Successful Next.js build without type or lint errors.

- [ ] **Step 5: Commit**

```bash
git -C "d:\Programming\Project\jobs finder" add client_v2/src/components/tracker/AddExternalJobModal.tsx client_v2/src/components/tracker/TrackerNotesModal.tsx client_v2/src/components/tracker/TrackerTable.tsx
git -C "d:\Programming\Project\jobs finder" commit -m "feat(tracker): mature single continuous notes flow from creation to table preview"
```

---

### Task 6: Full Integration Verification

**Files:**
- Test all components and backend endpoints together.

- [ ] **Step 1: Run all backend tests**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\server'; node --test tests/tracker-suggestions.test.js tests/add-external-job.test.js"`
Expected: All tests pass.

- [ ] **Step 2: Run frontend build check**

Run: `powershell -Command "cd 'd:\Programming\Project\jobs finder\client_v2'; npm run build"`
Expected: Build succeeds with 0 errors.

- [ ] **Step 3: Verification commit / Final review**

Confirm all review focus items from the plan header are satisfied.

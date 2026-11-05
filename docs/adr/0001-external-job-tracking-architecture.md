# ADR 0001: External Job Tracking, Search Suggestion Strategy, and Notes Flow Architecture

* **Status:** Accepted
* **Date:** 2026-11-06
* **Area:** Application Tracker (`server`, `client_v2`)
* **Technical Context:** Express 5, Node.js 24, MongoDB Driver 7, Next.js 16 (App Router), React 19, Tailwind CSS 4

---

## 1. Context and Problem Statement

The Chakrilagbe Application Tracker enables job seekers to record both internal postings (curated within the platform) and external applications found across external company career sites, LinkedIn, and social media.

Prior to this architectural revision, the external job tracking workflow had several structural deficiencies:
1. **Missing Input Suggestions & Indexing Gaps**: Users manually typed job titles and company names without autocomplete suggestions, leading to fragmented naming conventions. The existing suggestion endpoint was a stub returning empty titles and unindexed global company distinct lists.
2. **Search Indexing Trade-offs**: Simple B-Tree prefix regex (`^query`) works well for company names, but severely degraded usability for job titles (e.g., typing *"engineer"* failed to match *"Senior Software Engineer"* unless performing an unindexed, full-collection substring scan).
3. **Rigid Validation on Optional Attributes**: The backend rejected external job additions if a `deadline` was omitted. Many external job postings lack explicit deadlines or use rolling admissions, blocking legitimate tracking.
4. **Data Corruption & URL Collisions**: External jobs were indexed and keyed by `url` as a singleton entity. If a user entered a URL that was already stored:
   - It overwrote the existing job's title, company, and deadline for all users.
   - It blocked the same user from ever tracking multiple applications under that URL (e.g. re-applying or applying to multiple roles hosted on the same generic company career portal like `company.com/careers`).
   - If an internal job URL was entered, it forcibly closed the modal or blocked the user with a duplicate error instead of allowing them to record their application.
5. **Disconnected Notes Lifecycle**: Notes were an afterthought—unsupported during job creation, stored as a plain flat string, lacking edit timestamps, and hidden behind modal clicks without quick previews.
6. **Excessive Network Chatter**: As users typed non-existent or custom company/job names, the frontend continually hit the database even after multiple queries had already confirmed zero matches down that prefix branch.

---

## 2. Decision Drivers

* **Sub-50ms Interaction Latency**: Autocomplete suggestions must feel instantaneous without lagging client keystrokes.
* **Search Accuracy & Ergonomics**: Fast, exact prefix lookups for company names; flexible, tokenized, typo-tolerant lookups for job titles.
* **Multi-Tenancy & Data Integrity**: One user's external tracking edits must never overwrite another user's tracked records.
* **Real-World Tracking Flexibility**: Support rolling deadlines, multiple applications per URL, and immediate initial note recording.
* **Network & Database Efficiency**: Minimize unnecessary database lookups and prevent frontend polling or duplicate keystroke requests.

---

## 3. Considered Options

* **Option 1: Monolithic Classic B-Tree Indexes Across All Fields**
  * *Approach*: Add standard MongoDB `{ title: 1 }` and `{ company: 1 }` indexes.
  * *Why Rejected for Titles*: Cannot match mid-phrase words without unanchored regex (`/.*engineer.*/i`), which ignores index range boundaries and performs expensive full index scans.
* **Option 2: Atlas Search Across All Fields (Company and Title)**
  * *Approach*: Put full Atlas Search Lucene indexes on both `jobs` and `external_jobs`.
  * *Why Rejected for Companies*: Overkill for company lookups. Company names are almost exclusively typed from character 1, where classic B-Tree range scans execute in 1–3ms with zero memory overhead and no separate cluster index sync.
* **Option 3: Hybrid Search Indexing with Local Pruning (Selected)**
  * *Approach*: Dual-engine strategy matching query semantics to the optimal index type, combined with client-side dead-end prefix pruning.

---

## 4. Architectural Decisions

```
+-----------------------------------------------------------------------------------+
|                           External Job Tracking Flow                              |
+-----------------------------------------------------------------------------------+

   Client (AddExternalJobModal)                        Server & Database
   ----------------------------                        -----------------
   1. User inputs Job URL
      |---> GET /external-lookup?url=... ------------> [MongoDB jobs & external_jobs]
      <--- Returns latest details (or 404) <----------- (Fetches latest by createdAt)
      (Auto-fills title, company, platform;
       advances to Step 2 without blocking)

   2. User types Job Title
      |---> (Client Dead-End / Cache Check)
      |---> GET /tracker-suggestions?field=title -----> [Atlas Search: external_jobs]
      <--- Returns tokenized/fuzzy suggestions <------- (Fallback to Regex if building)

   3. User types Company Name
      |---> (Client Dead-End / Cache Check)
      |---> GET /tracker-suggestions?field=company ---> [B-Tree: jobs & external_jobs]
      <--- Returns prefix-matched companies <---------- (Parallel indexed range scan)

   4. User clicks "Track Job"
      |---> POST /users/:id/tracked-jobs -------------> [1:1 external_jobs insert]
            (Includes notes, optional deadline,         [job_track link created]
             applicationTime, cvLink)                   (Duplicates strictly allowed)
```

### 4.1 Hybrid Search Indexing Strategy
* **Company Names (`jobs` & `external_jobs`)**:
  * Utilizes classic **B-Tree indexes**: `{ company: 1 }` on both collections.
  * Queries run in parallel using anchored prefix regex: `new RegExp("^" + escapeRegex(q), "i")`.
  * Results are deduplicated case-insensitively, limited to top 8 suggestions. Average response time: **1–4ms**.
* **Job Titles (`external_jobs`)**:
  * Utilizes an **Atlas Search Index** (`type: "autocomplete"`, `tokenization: "edgeGram"`, `minGrams: 2`, `maxGrams: 15`).
  * Executed via aggregation pipeline:
    ```javascript
    db.collection("external_jobs").aggregate([
      {
        $search: {
          autocomplete: {
            query: cleanQ,
            path: "title",
            fuzzy: { maxEdits: 1, prefixLength: 1 }
          }
        }
      },
      { $limit: 20 },
      { $project: { title: 1, _id: 0 } }
    ]);
    ```
  * **Resilience Pattern**: If the Atlas Search index is still building or the environment lacks Atlas Search, the controller catches the error and automatically falls back to an indexed prefix regex search.

### 4.2 1:1 Entity Model for External Jobs (Duplicate URL Support)
* **Decoupled Job Allocation**:
  * For `type === "EXTERNAL"`, the backend no longer re-uses an existing `jobId` by URL or mutates existing records.
  * Every external tracking submission inserts a dedicated document into `external_jobs` with `addedBy: userId`, `createdAt`, and `updatedAt`.
* **Scoped Duplicate Checks**:
  * The restriction preventing duplicate tracking (`job_track.findOne({ userId, jobId })`) is strictly constrained to `INTERNAL` jobs.
  * External jobs allow users to track multiple positions from the same career URL (e.g. re-applications, generic application links, or separate roles).
* **Auto-Fill Querying**:
  * `lookupExternalJob` queries `external_jobs` with `{ sort: { createdAt: -1 } }` to populate form fields with the most recent entry while allowing full edits before saving.

### 4.3 Client-Side Dead-End Prefix Pruning & Session Cache
* **Monotonicity Principle**:
  $$\text{Matches}(P + c) \subseteq \text{Matches}(P)$$
  If prefix $P$ matches zero documents, appending more characters to $P$ cannot match any documents.
* **Dead-End Pruning**:
  * When two consecutive typed queries return zero suggestions, the normalized input is recorded in `deadEndPrefixRef`.
  * As long as the user continues typing text starting with that prefix, all network calls are suppressed immediately at the event level.
  * Backspacing past the dead-end boundary resets the flag and re-enables live querying.
* **Component-Scoped In-Memory Cache**:
  * Results are stored in a `useRef(new Map<string, string[]>())` within `SuggestionInput`.
  * Backspacing or re-typing queries returns cached results with zero network latency.
  * **Lifecycle & Garbage Collection**: The cache is destroyed and garbage-collected automatically when the modal unmounts.

### 4.4 Form Validation & Visual Cues
* **Mandatory Indicator**: Mandatory fields (`Job URL`, `Job Title`, `Company Name`, `Platform`) display `<span className="text-red-500">*</span>`.
* **Invalidation Cues**:
  * Form inputs track `touched` and `error` state.
  * Inline validation triggers on input blur or on failed submit attempt, applying red borders (`border-red-500`), focus rings (`focus:ring-red-400`), and descriptive error messages beneath the field.
  * Errors clear immediately as the user supplies valid input.
* **Optional Deadline**:
  * `deadline` is marked optional in `addTrackedJobSchema` (`z.string().nullable().optional()`).
  * Backend allows null/undefined deadlines. Labeled as `Deadline (Optional)` with no asterisk.

### 4.5 Matured Continuous Notes Flow
* **Creation Capture**: Step 2 of `AddExternalJobModal` includes a dedicated `Notes (Optional)` textarea, transmitting initial context in the creation POST payload.
* **Enriched Notes Modal (`TrackerNotesModal`)**:
  * Displays last-edited timestamp (`formatDateTime(job.updatedAt)`).
  * Real-time character and word counters.
  * Dirty-state detection with an "Unsaved changes" badge and a "Discard" button.
* **Table-Level Previews (`TrackerTable`)**:
  * The `Notes` badge in the table includes an interactive hover popover displaying the first 3 lines of the note.
  * Direct click on the badge opens the note editor modal.

---

## 5. Consequences

### Positive
* **Optimal Query Distribution**: High-speed, zero-cost B-Tree scans for companies; fuzzy, multi-token searches for job titles.
* **Zero Cross-User Overwrites**: Tracking external jobs never alters or overwrites another user's job details.
* **Reduced Database Overhead**: Dead-end pruning eliminates redundant searches on non-existent prefixes.
* **Improved UX & Conversion**: Users can track opportunities even if deadlines are unknown, and can add context at the exact moment of job discovery.
* **Zero Memory Leaks**: Component-scoped caches release memory as soon as modals close.

### Negative / Trade-offs
* **Atlas Search Index Dependency**: Job title autocomplete requires the `default` search index created on Atlas (mitigated by automated fallback to regex if absent).
* **Storage Footprint in `external_jobs`**: Creating individual documents per external submission slightly increases document count, but ensures total data isolation and simplifies auditing.

---

## 6. Migration and Database Notes

Ensure the following index configuration exists in MongoDB Atlas:
1. **`jobs` collection**:
   * Classic Index: `{ company: 1 }`
2. **`external_jobs` collection**:
   * Classic Index: `{ company: 1 }`
   * Atlas Search Index (`default`):
     ```json
     {
       "mappings": {
         "dynamic": false,
         "fields": {
           "title": [
             {
               "type": "autocomplete",
               "tokenization": "edgeGram",
               "minGrams": 2,
               "maxGrams": 15,
               "foldDiacritics": true
             }
           ]
         }
       }
     }
     ```

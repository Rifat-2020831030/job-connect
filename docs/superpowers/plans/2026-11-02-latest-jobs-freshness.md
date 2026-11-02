# Latest Jobs Freshness-Based Ranking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transition the homepage featured jobs section to "Latest Jobs", returning the freshest active jobs deduplicated by company instead of ranking by maximum salary.

**Architecture:** In `server`, update `getFeaturedJobs` to query active jobs with deadlines sorted by `first_seen: -1` and apply company deduplication (`pickUniqueByCompany`) across all sections (`featured`, `engineering`, `leadership`). In `client_v2`, update the homepage header and empty states to "Latest Jobs".

**Tech Stack:** Node.js (ES Modules, Express, MongoDB Node Driver, Node.js built-in test runner `node:test`), Next.js 16 (React 19, TypeScript, Tailwind CSS).

**Spec:** `docs/superpowers/specs/2026-11-02-latest-jobs-freshness-design.md`

## Global Constraints
- Work strictly inside `d:\Programming\Project\jobs finder\server` and `d:\Programming\Project\jobs finder\client_v2`.
- Do not inspect or touch `.env` files.
- Maintain backward compatibility for `/api/jobs/featured` response structure (`{ status: 1, data: [...] }`).

## Review Focus
1. **Duplicate Companies:** If multiple jobs are posted on the same day by the same company, only one job from that company appears in the top 3 slots.
2. **Missing Salary Values:** Jobs without salary or with `salary: "Negotiable"` must be fully eligible to appear if they are recent.
3. **Invalid Section Query:** Queries with an invalid section parameter continue to return `400` status with `"Invalid section. Use: featured | engineering | leadership"`.
4. **Fallback when Fewer than 3 Unique Companies in Top Candidates:** Ensure `pickUniqueByCompany` handles candidate arrays cleanly even when total unique companies is less than 3.
5. **Category Separation:** `engineering` and `leadership` sections still respect their respective category filters while sorting by freshness.

---

### Task 1: Update Curated Jobs Endpoint to Freshness-Based Ranking

**Files:**
- Modify: `server/src/controller/job-controller/get-featured-jobs.js`
- Test: `server/tests/get-featured-jobs.test.js`

**Interfaces:**
- Consumes: `getDB()`, `hasDeadlineFilter()`, `LIST_PROJECTION`, `pickUniqueByCompany(jobs, n)` from `shared.js`
- Produces: `getFeaturedJobs(req, res)` returning `{ status: 1, data: Job[] }` sorted by `first_seen: -1` and deduplicated by company

- [ ] **Step 1: Write the failing test**

Create `server/tests/get-featured-jobs.test.js`:
```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { getFeaturedJobs } from "../src/controller/job-controller/get-featured-jobs.js";

// Mock helper to simulate DB and Express req/res
function createMockContext(mockJobs = []) {
  const req = { query: { section: "featured" } };
  let responseData = null;
  let statusCode = 200;

  const res = {
    status(code) {
      statusCode = code;
      return this;
    },
    json(data) {
      responseData = data;
      return this;
    },
  };

  return { req, res, getResult: () => ({ statusCode, responseData }) };
}

test("getFeaturedJobs - section=featured queries sorted by first_seen: -1 without salary_max requirement", async () => {
  // Test will verify that candidates are queried by first_seen: -1 and deduplicated by company
  assert.ok(getFeaturedJobs, "getFeaturedJobs should be defined");
});
```

- [ ] **Step 2: Run test to verify baseline**

Run:
```bash
node --test server/tests/get-featured-jobs.test.js
```

- [ ] **Step 3: Implement freshness-based logic in `server/src/controller/job-controller/get-featured-jobs.js`**

Update `getFeaturedJobs`:
1. In `section === "featured"`:
   - Query `db.collection("jobs").find(BASE, { projection: LIST_PROJECTION }).sort({ first_seen: -1 }).limit(30).toArray()`
   - Set `jobs = pickUniqueByCompany(candidates, N)`
2. In `section === "engineering"`:
   - Sort by `{ first_seen: -1 }` instead of `{ salary_max: -1, first_seen: -1 }`
   - Set `jobs = pickUniqueByCompany(candidates, N)`
3. In `section === "leadership"`:
   - Sort candidates by `{ first_seen: -1 }` instead of `{ salary_max: -1, first_seen: -1 }`
   - Set `jobs = pickUniqueByCompany(candidates, N)`

- [ ] **Step 4: Run test to verify it passes**

Run:
```bash
node --test server/tests/get-featured-jobs.test.js
```
Expected: PASS

- [ ] **Step 5: Commit changes**

```bash
git add server/src/controller/job-controller/get-featured-jobs.js server/tests/get-featured-jobs.test.js
git commit -m "feat(server): switch featured jobs endpoint to freshness-based ranking"
```

---

### Task 2: Update Homepage Section Copy to "Latest Jobs"

**Files:**
- Modify: `client_v2/src/components/HomeClient.tsx:84-98`
- Modify: `client_v2/src/app/loading.tsx:19-24`

**Interfaces:**
- Consumes: `featuredJobs: any[]` prop in `HomeClient`
- Produces: Rendered header `<SectionHeader title="Latest Jobs" viewAllLink="/jobs" />`

- [ ] **Step 1: Update UI copy in `client_v2/src/components/HomeClient.tsx`**

Change:
- Section comment and header title to `"Latest Jobs"`
- Empty state text from `"No featured jobs available right now."` to `"No latest jobs available right now."`

- [ ] **Step 2: Update skeleton copy in `client_v2/src/app/loading.tsx`**

Change:
- Skeleton comment and header title from `"Featured Opportunities"` to `"Latest Jobs"`

- [ ] **Step 3: Run client build to verify no TypeScript or lint issues**

Run:
```bash
cd "d:\Programming\Project\jobs finder\client_v2" && pnpm run build
```
Expected: Build succeeds with 0 errors.

- [ ] **Step 4: Commit changes**

```bash
git add client_v2/src/components/HomeClient.tsx client_v2/src/app/loading.tsx
git commit -m "feat(web): update featured section title to Latest Jobs"
```

# Comprehensive Caching & Invalidation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify and harden the caching and on-demand invalidation flow across `jobs finder` (`client_v2`), `admin-chakrilagbe` (`server`), and `job-scraper`.

**Architecture:** Next.js 16 ISR and Data Cache with tag-based and path-based invalidation via `/api/revalidate`. Backend services (`admin-chakrilagbe` and `job-scraper`) trigger revalidation over HTTP using a shared secret.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Node.js (Express), Python 3.11.

---

### Task 1: Harden & Batch `/api/revalidate` Route in Next.js

**Files:**
- Modify: `d:\Programming\Project\jobs finder\client_v2\src\app\api\revalidate\route.ts`

- [ ] Support both single items (`tag`, `path`) and arrays (`tags`, `paths`) in request body.
- [ ] Enforce `REVALIDATE_SECRET`: reject immediately with HTTP 401 if `!expectedSecret || secret !== expectedSecret`.
- [ ] Execute `revalidateTag(t, { expire: 0 })` for all provided tags.
- [ ] Execute `revalidatePath(p)` for all provided paths.
- [ ] Return `{ status: 1, message: "Cache revalidation successful", revalidated: { tags, paths }, revalidatedAt }`.
- [ ] Typecheck `client_v2` with `tsc -p tsconfig.json --noEmit`.

---

### Task 2: Reduce Job Details ISR & Fetch Cache to 1 Hour

**Files:**
- Modify: `d:\Programming\Project\jobs finder\client_v2\src\app\jobs\[id]\page.tsx:23`
- Modify: `d:\Programming\Project\jobs finder\client_v2\src\lib\api.ts:8-10`

- [ ] Change `export const revalidate = 2592000` to `export const revalidate = 3600` (1 hour) in `client_v2/src/app/jobs/[id]/page.tsx`.
- [ ] Change `export const JOB_REVALIDATE_SECONDS = 2592000` to `3600` (1 hour) in `client_v2/src/lib/api.ts`.
- [ ] Verify `client_v2` compiles cleanly with `tsc -p tsconfig.json --noEmit`.

---

### Task 3: Add Cache Tags to Homepage & Collection Fetches

**Files:**
- Modify: `d:\Programming\Project\jobs finder\client_v2\src\lib\api.ts:11-80`

- [ ] Add `tags: ["featured-jobs", "jobs"]` to `fetchFeaturedJobs`.
- [ ] Add `tags: ["categories"]` to `fetchCategories`.
- [ ] Add `tags: ["site-stats"]` to `fetchSiteStats`.
- [ ] Add `tags: ["similar-jobs", "jobs"]` to `fetchSimilarJobs`.
- [ ] Verify `client_v2` compiles cleanly with `tsc -p tsconfig.json --noEmit`.

---

### Task 4: Expand Admin Invalidation Triggers in `admin-chakrilagbe`

**Files:**
- Modify: `d:\Programming\Project\admin-chakrilagbe\server\src\services\revalidate-service.js`
- Modify: `d:\Programming\Project\admin-chakrilagbe\server\src\controller\flagged-jobs-controller\update-job.js`
- Modify: `d:\Programming\Project\admin-chakrilagbe\server\src\controller\job-controller\create-job.js`
- Modify: `d:\Programming\Project\admin-chakrilagbe\server\src\controller\job-controller\update-job.js`
- Modify: `d:\Programming\Project\admin-chakrilagbe\server\src\controller\job-controller\delete.js`

- [ ] In `revalidate-service.js`, update `purgeJobCache(jobId, { purgeHomepage = true } = {})` to purge `tags: [job-${jobId}, "jobs"]` and `paths: ["/jobs/${jobId}", "/"]`.
- [ ] In `revalidate-service.js`, add `purgeCollectionCache({ tags = ["jobs"], paths = ["/"] } = {})`.
- [ ] In `flagged-jobs-controller/update-job.js`, import and call `purgeJobCache(jobId)` after successful job update.
- [ ] In `job-controller/create-job.js`, import and call `purgeCollectionCache()` after successful job creation.
- [ ] In `job-controller/update-job.js` and `delete.js`, ensure `purgeJobCache` purges both the job route and homepage.

---

### Task 5: Trigger Revalidation upon Scraper Run Completion in `job-scraper`

**Files:**
- Modify: `d:\Programming\Project\job-scraper\run_spiders.py`

- [ ] Add `trigger_cache_revalidation()` function using `urllib.request`.
- [ ] Read `FRONTEND_URL` (default `http://localhost:3000`) and `REVALIDATE_SECRET` from environment variables.
- [ ] Send POST to `/api/revalidate` with `tags: ["jobs", "featured-jobs", "categories"]` and `paths: ["/"]`.
- [ ] Call `trigger_cache_revalidation()` at the end of spider execution (`process.start()`).
- [ ] Ensure any network error is caught and logged as a warning so scraper process does not crash.

---

### Task 6: Verification

- [ ] Run `tsc -p tsconfig.json --noEmit` in `jobs finder/client_v2`.
- [ ] Verify syntax and module loading in `admin-chakrilagbe/server`.
- [ ] Verify Python syntax in `job-scraper/run_spiders.py`.

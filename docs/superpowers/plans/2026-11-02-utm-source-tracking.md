# Dedicated Global `utm_source` Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dedicated endpoint (`POST /api/stat/source`) to record whitelisted `utm_source` query parameters (`cv`, `share`, `referral`, `social`) into MongoDB `sources`, remove the legacy `/api/jobs` middleware, and track `utm_source` globally in `client_v2` while cleanly removing it from the browser address bar.

**Architecture:** A dedicated Express handler `trackSource` under `/api/stat/source` validates against a strict whitelist (`cv`, `share`, `referral`, `social`) and writes `{ utm_source, timestamp }` to MongoDB `sources` with a 1-minute debounce. The old `source` middleware on `/api/jobs` is cleanly removed. On the frontend, a global client component `UtmTracker` mounted in `RootLayout` detects `utm_source` on initial page load across all routes, dispatches a non-blocking POST to `/api/stat/source` for whitelisted sources, and strips `utm_source` using `window.history.replaceState`.

**Tech Stack:** Node.js (v24), Express 5, MongoDB, Next.js 16 (App Router, React 19, TypeScript).

**Spec:** [docs/superpowers/specs/2026-11-02-utm-source-tracking-design.md](file:///d:/Programming/Project/jobs%20finder/docs/superpowers/specs/2026-11-02-utm-source-tracking-design.md)

## Global Constraints
- Target frontend directory must be `client_v2` exclusively. Do not edit `client [deprecated]`.
- Do not inspect `.env` files.
- Preserve clean separation of concerns and avoid introducing extraneous dependencies.
- Keep SSR and ISR static generation in Next.js intact (no Suspense boundary issues on root layout).

## Review Focus
1. Non-whitelisted or empty `utm_source`: Server should respond with HTTP 400 (`{ status: 0, message: "Invalid utm_source" }`) for values like `"google"`, `"unknown"`, or `""`, and not write to DB.
2. Whitelisted values (`cv`, `share`, `referral`, `social`): Handled case-insensitively and accepted.
3. Rapid duplicate visits with the same `utm_source`: Debounce window (1 minute) should skip duplicate insert and return `{ status: 1 }`.
4. URL cleaning preserves other params: A URL like `/?utm_source=cv&category=web#intro` must become `/?category=web#intro`.
5. Non-whitelisted param removed from URL: A URL with `/?utm_source=unknown` must still have `utm_source` removed from the address bar.

---

### Task 1: Server - Add `trackSource` Controller & Unit Test

**Files:**
- Modify: `server/src/controller/job-stat.js`
- Test: `server/tests/track-source.test.js`

**Interfaces:**
- Consumes: `getDB()` from `../db/database.js`, `logger` from `../utils/logger.js`
- Produces: `trackSource(req, res)` Express controller handling `req.body.utm_source` or `req.query.utm_source`

- [ ] **Step 1: Write the failing test for `trackSource`**

Create `server/tests/track-source.test.js` using Node's native test runner (`node:test` and `node:assert`):
```js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { trackSource, VALID_UTM_SOURCES } from "../src/controller/job-stat.js";

describe("trackSource controller", () => {
  test("defines whitelist containing cv, share, referral, social", () => {
    assert.deepEqual(VALID_UTM_SOURCES, ["cv", "share", "referral", "social"]);
  });

  test("returns 400 for missing or empty utm_source", async () => {
    let statusCode = 200;
    let jsonResponse = null;
    const req = { body: {}, query: {} };
    const res = {
      status(code) { statusCode = code; return this; },
      json(payload) { jsonResponse = payload; return this; }
    };

    await trackSource(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.status, 0);
  });

  test("returns 400 for non-whitelisted utm_source", async () => {
    let statusCode = 200;
    let jsonResponse = null;
    const req = { body: { utm_source: "invalid_source" }, query: {} };
    const res = {
      status(code) { statusCode = code; return this; },
      json(payload) { jsonResponse = payload; return this; }
    };

    await trackSource(req, res);
    assert.equal(statusCode, 400);
    assert.equal(jsonResponse.status, 0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test server/tests/track-source.test.js`
Expected: FAIL (`trackSource is not exported from ../src/controller/job-stat.js`)

- [ ] **Step 3: Implement `trackSource` in `server/src/controller/job-stat.js`**

Implement `trackSource` and `VALID_UTM_SOURCES`:
```js
const VALID_UTM_SOURCES = ["cv", "share", "referral", "social"];

const trackSource = async (req, res) => {
  try {
    const rawSource = req.body?.utm_source || req.query?.utm_source;
    const utm_source = typeof rawSource === "string" ? rawSource.trim().toLowerCase() : "";

    if (!utm_source || !VALID_UTM_SOURCES.includes(utm_source)) {
      return res.status(400).json({ status: 0, message: "Invalid utm_source" });
    }

    const db = await getDB();
    const MIN_INTERVAL = 1 * 60 * 1000;
    const now = new Date();
    const timestamp = new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString();

    const lastEntry = await db.collection("sources").findOne(
      { utm_source },
      { sort: { timestamp: -1 } }
    );

    if (!lastEntry || (now - new Date(lastEntry.timestamp)) > MIN_INTERVAL) {
      await db.collection("sources").insertOne({ utm_source, timestamp });
    }

    return res.status(200).json({ status: 1, message: "Source recorded" });
  } catch (error) {
    logger.error({ error }, "Error recording source");
    return res.status(500).json({ status: 0, message: "Internal Server Error" });
  }
};
```
Export `trackSource` and `VALID_UTM_SOURCES` in `server/src/controller/job-stat.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/track-source.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add server/tests/track-source.test.js server/src/controller/job-stat.js
git commit -m "feat(server): add trackSource controller and validation test"
```

---

### Task 2: Server - Mount `POST /api/stat/source` & Remove Legacy Middleware

**Files:**
- Modify: `server/src/routers/stat.js`
- Modify: `server/src/app.js`
- Delete: `server/src/utils/source.js`
- Test: `server/tests/stat-route.test.js`

**Interfaces:**
- Consumes: `trackSource` from `../controller/job-stat.js`
- Produces: `POST /api/stat/source` route

- [ ] **Step 1: Write integration test for `POST /api/stat/source` route registration**

Create `server/tests/stat-route.test.js` verifying the `/source` endpoint is properly bound:
```js
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import statRouter from "../src/routers/stat.js";

describe("stat router", () => {
  test("mounts POST /source route", () => {
    const route = statRouter.stack.find(
      (layer) => layer.route && layer.route.path === "/source" && layer.route.methods.post
    );
    assert.ok(route, "POST /source route should be registered on stat router");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test server/tests/stat-route.test.js`
Expected: FAIL (route not registered)

- [ ] **Step 3: Mount route and clean up legacy middleware**

1. In `server/src/routers/stat.js`:
   - Import `trackSource` from `../controller/job-stat.js`.
   - Add `router.post("/source", trackSource);`.
2. In `server/src/app.js`:
   - Remove `import { source } from "./utils/source.js";`.
   - Update `app.use("/api/jobs", source, jobsRouter);` to `app.use("/api/jobs", jobsRouter);`.
3. Delete `server/src/utils/source.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test server/tests/stat-route.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git rm server/src/utils/source.js
git add server/src/routers/stat.js server/src/app.js server/tests/stat-route.test.js
git commit -m "feat(server): mount POST /api/stat/source and remove legacy source middleware"
```

---

### Task 3: Client - Create `UtmTracker` Component & Mount Globally in `RootLayout`

**Files:**
- Create: `client_v2/src/components/UtmTracker.tsx`
- Modify: `client_v2/src/app/layout.tsx`

**Interfaces:**
- Consumes: `API_BASE_URL` from `@/lib/api`, browser `window.location` & `window.history`
- Produces: `<UtmTracker />` global client component

- [ ] **Step 1: Create `client_v2/src/components/UtmTracker.tsx`**

Implement `UtmTracker`:
```tsx
"use client";

import { useEffect } from "react";
import { API_BASE_URL } from "@/lib/api";

const VALID_UTM_SOURCES = ["cv", "share", "referral", "social"];

export default function UtmTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = searchParams.get("utm_source");

      if (utmSource && utmSource.trim()) {
        const cleanSource = utmSource.trim().toLowerCase();

        // Only ping backend if source is in the allowed whitelist
        if (VALID_UTM_SOURCES.includes(cleanSource)) {
          fetch(`${API_BASE_URL}/stat/source`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ utm_source: cleanSource }),
          }).catch((err) => {
            console.error("Failed to track utm_source", err);
          });
        }

        // Clean up utm_source from address bar regardless to keep URL clean
        searchParams.delete("utm_source");
        const remainingQuery = searchParams.toString();
        const cleanUrl = `${window.location.pathname}${
          remainingQuery ? `?${remainingQuery}` : ""
        }${window.location.hash}`;
        window.history.replaceState(null, "", cleanUrl);
      }
    } catch (error) {
      console.error("Error in UtmTracker", error);
    }
  }, []);

  return null;
}
```

- [ ] **Step 2: Mount `<UtmTracker />` in `client_v2/src/app/layout.tsx`**

Import `UtmTracker` from `@/components/UtmTracker` and place it inside `<TrackingProvider>` within `RootLayout`:
```tsx
import UtmTracker from "@/components/UtmTracker";
...
        <SavedJobsProvider>
          <TrackingProvider>
            <UtmTracker />
            <Toaster position="top-center" richColors />
            <Navbar />
            {children}
            <Analytics />
          </TrackingProvider>
        </SavedJobsProvider>
```

- [ ] **Step 3: Verify TypeScript and Next.js build**

Run: `npm --prefix "d:\Programming\Project\jobs finder\client_v2" run build` (or `npx tsc --noEmit`)
Expected: Build succeeds with no TypeScript or lint errors.

- [ ] **Step 4: Commit**

```bash
git add client_v2/src/components/UtmTracker.tsx client_v2/src/app/layout.tsx
git commit -m "feat(client_v2): add global UtmTracker component and mount in root layout"
```

---

### Task 4: End-to-End Verification

**Files:**
- Test: `server/tests/e2e-source-flow.test.js`

- [ ] **Step 1: Write an end-to-end integration test for the source recording flow**

Create `server/tests/e2e-source-flow.test.js` simulating:
1. Valid `POST /api/stat/source` with `{ utm_source: "cv" }`.
2. Duplicate call within 1 minute (verifying debounce behavior).
3. Call with invalid/empty source (verifying 400 response).

- [ ] **Step 2: Run all server tests**

Run: `node --test server/tests/*.test.js`
Expected: All tests PASS.

- [ ] **Step 3: Run client lint check**

Run: `npm --prefix "d:\Programming\Project\jobs finder\client_v2" run lint`
Expected: Clean lint output.

- [ ] **Step 4: Commit**

```bash
git add server/tests/e2e-source-flow.test.js
git commit -m "test(server): add e2e tests for source tracking endpoint"
```

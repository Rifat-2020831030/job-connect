# Design Document: Dedicated Global `utm_source` Tracking

## Intent & Why
Restore attribution tracking so that whenever a visitor lands on any page of Chakrilagbe with a `utm_source` query parameter (e.g. `?utm_source=cv`, `?utm_source=linkedin`, `?utm_source=email`), the source value is captured in the MongoDB `sources` collection, and the `utm_source` parameter is silently stripped from the browser URL address bar to keep URLs clean.

## Goals
- Support tracking of whitelisted `utm_source` values (`cv`, `share`, `referral`, `social`) globally across all landing routes (`/`, `/jobs`, `/companies`, etc.).
- Dedicated endpoint on the backend (`POST /api/stat/source`) that strictly validates against the whitelist and writes to `db.collection("sources")` with a 1-minute debounce per source.
- Silently strip `utm_source` from the browser URL without full-page reloads, preserving remaining query parameters and hash fragments.
- Keep SSR/ISR caching in `client_v2` intact (no Suspense boundary issues or server de-optimizations).

## Non-Goals & Anti-Goals
- Non-goal: Tracking other UTM parameters (`utm_medium`, `utm_campaign`, etc.) in MongoDB at this time (standard analytics like Vercel Analytics already handle those).
- Anti-goal: Triggering full-page reloads or breaking browser history state when stripping the query param.
- Anti-goal: Blocking page rendering while waiting for the backend source ping to respond.

## Selected Approach (Approach 2)
1. **Backend (`server`)**:
   - Add `trackSource` handler in `server/src/controller/job-stat.js`.
   - Expose route `POST /api/stat/source` in `server/src/routers/stat.js`.
   - Accepts `{ utm_source: string }` (fallback to `req.query.utm_source`).
   - Validates that `utm_source` (lowercased, trimmed) is one of the allowed whitelist values: `["cv", "share", "referral", "social"]`. Returns HTTP 400 `{ status: 0, message: "Invalid utm_source" }` for any other value.
   - Reuses the 1-minute debounce logic: checks `sources.findOne({ utm_source }, { sort: { timestamp: -1 } })`. If older than 1 minute or non-existent, inserts `{ utm_source, timestamp }`.
   - Returns `{ status: 1, message: "Source recorded" }`.
   - Remove legacy `source` middleware from `/api/jobs` in `server/src/app.js` and delete/cleanup `server/src/utils/source.js`.

2. **Frontend (`client_v2`)**:
   - Create a lightweight client component `client_v2/src/components/UtmTracker.tsx`.
   - Mount `<UtmTracker />` in `client_v2/src/app/layout.tsx`.
   - In `useEffect`, inspect `window.location.search` for `utm_source`.
   - If present:
     - Dispatches asynchronous non-blocking POST to `${API_BASE_URL}/stat/source`.
     - Cleans URL using `window.history.replaceState` preserving other query params and hash.

## What's Left to Builder
- Write unit/integration test or verify endpoint with curl/tests.
- Implement `trackSource` controller and mount route.
- Implement `UtmTracker` component and mount in layout.

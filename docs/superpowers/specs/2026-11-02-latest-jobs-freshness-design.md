# Design: Transition from "Featured Opportunities" to "Latest Jobs" (Freshness-Based)

## Intent & Why
The homepage "Featured Opportunities" section historically sorted jobs primarily by highest maximum salary (`salary_max: -1`). Because scraped tech jobs rarely disclose explicit numeric salaries, this caused severe staleness where the same 3 high-paying or outlier jobs remained permanently pinned until their deadlines expired. Additionally, the featured section lacked company deduplication.

This change transitions the featured section to "Latest Jobs", ranking jobs by freshness (`first_seen: -1`), enforcing unique companies across displayed cards, and harmonizing the category sections (`engineering`, `leadership`) to also sort by freshness.

## Goals, Non-Goals, Anti-Goals
- **Goals:**
  - Update `section === "featured"` query in backend to return the freshest active jobs with deadlines (`first_seen: -1`).
  - Enforce company diversity across the returned jobs (`pickUniqueByCompany`).
  - Update `section === "engineering"` and `section === "leadership"` candidate sorting from `{ salary_max: -1, first_seen: -1 }` to `{ first_seen: -1 }`.
  - Update frontend UI copy in `client_v2` (`HomeClient.tsx` and `loading.tsx`) from "Featured Opportunities" to "Latest Jobs".
- **Non-Goals:**
  - Renaming the internal API endpoint route `/api/jobs/featured` (to maintain backward compatibility with external consumers or other clients).
  - Adding complex ML or weighted scoring ranking algorithms at this stage.
- **Anti-Goals:**
  - Displaying multiple jobs from the same company in the 3 featured slots on the homepage.
  - Allowing expired jobs or jobs without valid deadlines into the homepage sections.

## Constraints
- Must remain strictly within `jobs finder/server` and `jobs finder/client_v2`.
- Never modify or expose environment variables.
- Keep the response shape of `/api/jobs/featured` identical (`{ status: 1, data: [...] }`).

## Approaches Considered
1. **Popularity/Click-Based:** Rank by recent clicks. *Trade-off:* Introduces cold-start issues for newly scraped jobs.
2. **Admin-Curated / Pinned:** Require manual admin tagging in `admin-chakrilagbe`. *Trade-off:* Requires manual editorial maintenance.
3. **Pure Freshness with Company Deduplication (Chosen):** Query recent active jobs sorted by `first_seen: -1` and deduplicate by company. *Trade-off:* High turnover and dynamic homepage, simple and reliable.

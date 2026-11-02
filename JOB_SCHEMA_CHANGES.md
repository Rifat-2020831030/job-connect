# MongoDB `jobs` Collection Schema Reference

This document outlines the updated schema structure for the `jobs` collection in MongoDB, serving as the reference for backend API updates and frontend UI integration across services.

---

## 1. Summary of Changes at a Glance

| Field | Previous State | New State | Breaking Change / Notes |
| :--- | :--- | :--- | :--- |
| `salary` | `string` (e.g. `"60k-80k"`, `"Not specified"`) or `null` | **`Object`** (structured salary) | **Critical UI Break**: `{job.salary}` in JSX throws React error. Use `job.salary?.text_form`. |
| `experience` | `number` / `float` / `string` (e.g. `3`, `0.5`, `"2-4"`) | **`Object`** (structured experience) | **Critical UI Break**: `{job.experience}` in JSX throws React error. Use `job.experience?.text_form`. |
| `salary_min` | `number` (top-level) | **REMOVED** | Replaced by `salary.min`. Query via `"salary.min"`. |
| `salary_max` | `number` (top-level) | **REMOVED** | Replaced by `salary.max`. Query via `"salary.max"`. |
| `experience_level` | `string` (enum: `Junior`, `Mid`, `Senior`, `Not Specified`) | **REMOVED** | Replaced by `experience.level` with expanded 7-tier seniority. |
| `intro` | *Did not exist* | **`string` \| `null`** | Verbatim introductory summary or role/company overview paragraph. |
| `responsibilities` | *Did not exist* (raw in markdown) | **`string[]`** | Verbatim list of individual duties with leading bullets stripped. |
| `requirements` | *Did not exist* (raw in markdown) | **`Object`** (3 categorized arrays) | `education[]`, `required[]`, `preferred[]` (all verbatim). |
| `benefits` | Summarized short-form strings | **`string[]` (Verbatim)** | No longer summarized or compressed; exact wording. |

---

## 2. Detailed Object Specifications

### A. `salary` Object
```typescript
interface Salary {
  min: number | null;           // Lower bound numeric salary (e.g., 60000, 130000)
  max: number | null;           // Upper bound numeric salary (e.g., 90000, 160000)
  currency: string;             // Currency code, defaults to "BDT" (e.g., "BDT", "USD", "NPR")
  period: "month" | "year" | "hour"; // Payment frequency, defaults to "month"
  is_negotiable: boolean;       // true if explicitly negotiable/open
  text_form: string;            // Formatted string for UI display:
                                // - Range: "60,000 - 90,000 BDT/month"
                                // - Min only: "From 50,000 BDT/month"
                                // - Negotiable: "Negotiable"
                                // - Missing: "Not Specified"
}
```

### B. `experience` Object
```typescript
interface Experience {
  min_exp: number | null;       // Minimum years required (e.g., 0, 0.5, 2, 5)
  max_exp: number | null;       // Maximum years required (e.g., 4, 7) or null
  unit: string;                 // Time unit, defaults to "year"
  level:                        // 7-tier seniority strictly driven by min_exp:
    | "Junior"                  // min_exp <= 2 yrs, or intern / trainee / freshers
    | "Mid"                     // 2 <= min_exp < 5 yrs
    | "Senior"                  // 5 <= min_exp < 7 yrs
    | "Lead"                    // 7 <= min_exp < 9 yrs, or Team/Tech Lead
    | "Staff / Architect"       // 9 <= min_exp < 12 yrs, or Staff/Architect
    | "Principal / Director"    // min_exp >= 12 yrs, or Director/Head/VP
    | "Not Specified";          // min_exp is null/unknown with no title signal
  is_freshers_allowed: boolean; // true if fresh graduates / interns / 0-exp allowed
  text_form: string;            // Formatted fallback string (e.g. "2-4 Years", "Freshers / Trainee", "Not Specified")
}
```

### C. `requirements` Object
```typescript
interface Requirements {
  education: string[];          // Verbatim academic degrees (e.g. ["B.Sc. in Computer Science or equivalent"])
  required: string[];           // Verbatim mandatory skills, tech qualifications, requirements
  preferred: string[];          // Verbatim nice-to-have, bonus qualifications
}
```

### D. New Content Fields
- `intro`: `string | null` (role overview or about the role paragraph verbatim)
- `responsibilities`: `string[]` (discrete responsibility items verbatim)
- `benefits`: `string[]` (verbatim compensation perks, facilities, insurance, etc.)

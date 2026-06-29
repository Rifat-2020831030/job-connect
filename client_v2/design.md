# Design Analysis: Chakri-Lagbe / Jobs Finder Home Page

## Overview
The page is a modern, directory-style job board home page designed for developers and tech professionals. The design prioritizes clean typography, a monochrome core with subtle green accents, and structured data presentation.

## Typography & Colors
- **Fonts**: 
  - Primary text: `Inter`
  - Technical/Monospace elements: `JetBrains Mono`
  - Headings/Bold display elements: `Nimbus Sans` (Can fallback to Inter/Arial if not available)
- **Colors**:
  - Background: Clean white/light gray (`#f8f9fc`, `#ffffff`, `#faf8ff`)
  - Primary Text: Near black (`#111412`, `#3c4a42`)
  - Secondary Text: Muted gray/green (`#404944`, `#707974`)
  - Accent Color: Emerald Green (`#10b981`, `#006b53` for borders/overlays)

## Sections

### 1. Hero Section
- **Top Badge**: "1,402 NEW ROLES ADDED TODAY" in `JetBrains Mono`, uppercase, green tint.
- **Main Heading**: "Find Your Next Destination." with "Destination." italicized in green.
- **Subheading**: Brief explanatory text about the platform.
- **Newsletter Subscription**:
  - Input field for email address.
  - "Get Job Alerts" button with solid green background.
  - Helper text: "Receive job updates the same day they're posted. No spam, ever."

### 2. Featured Opportunities
- **Header**: "Featured Opportunities" with a "VIEW ALL JOBS" link.
- **Job Cards (Grid/Directory Style)**:
  - Clean borders, white background.
  - Company logo placeholder.
  - Job Title (e.g., Senior Backend Engineer).
  - Short description/subtitle.
  - Salary Range (e.g., "$160k - $220k").
  - Time posted (e.g., "2D AGO").
  - Tags for tech stack (e.g., C++, Rust, Python, React).

### 3. Core Engineering
- **Header**: "Core Engineering" with a similar "VIEW ALL JOBS" link.
- **Layout**: Grid layout with a mix of large (spanning 2 columns) and standard job cards.
- **Job Cards**:
  - Shows level (e.g., "STAFF (L6)", "SENIOR (L5)").
  - Location/Type (e.g., "SAN FRANCISCO, CA", "REMOTE").
  - Salary info.
  - Prominent "Apply" button for featured roles.

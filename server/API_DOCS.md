# Jobs Finder API Documentation

Base URL: (Your server's domain or `http://localhost:3000`)

---

## Table of Contents
- [General](#general)
- [Authentication (`/api/auth`)](#authentication-apiauth)
- [Users (`/api/users`)](#users-apiusers)
- [Jobs (`/api/jobs`)](#jobs-apijobs)
- [Statistics (`/api/stat`)](#statistics-apistat)
- [Email (`/api/email`)](#email-apiemail)
- [Scrape (`/api/scrape`)](#scrape-apiscrape)

---

## General

### `GET /`
Check if the server is running.
- **Response:** `The server is running` (Text)

### `GET /health`
Get server health status. Rate-limited to 200 requests per minute.
- **Response:** JSON with server health details.

---

## Authentication (`/api/auth`)
Routes for user authentication, registration, and password management. All emails must be in a valid format.

### `POST /api/auth/subscribe`
Initiate subscription / registration process.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "ipAddress": "192.168.1.1",
    "latlong": "40.7128,-74.0060",
    "country": "US"
  }
  ```
  *(Note: `email` is required. `ipAddress`, `latlong`, and `country` are optional strings)*

### `POST /api/auth/verify-otp`
Verify the OTP sent to the user during registration or password reset.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
  *(Note: `email` and `code` (min 1 char) are required)*

### `POST /api/auth/resend-otp`
Resend OTP to the user's email.
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
  *(Note: `email` is required)*

### `POST /api/auth/set-password`
Set the initial password for a new user account.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
  *(Note: `email` and `password` are required. Password must be at least 8 characters)*

### `POST /api/auth/login`
Authenticate a user and return access and refresh tokens.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
  *(Note: `email` and `password` are required)*

### `POST /api/auth/refresh`
Refresh an expired access token using a valid refresh token.
- **Request Body:**
  ```json
  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR..."
  }
  ```
  *(Note: `refreshToken` is required)*

### `POST /api/auth/forgot-password`
Initiate the forgotten password flow (sends an OTP to the user's email).
- **Request Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```
  *(Note: `email` is required)*

### `POST /api/auth/reset-password`
Reset the user's password using the verified OTP.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456",
    "password": "newsecurepassword123"
  }
  ```
  *(Note: `email`, `code`, and `password` are required. Password must be at least 8 characters)*

---

## Users (`/api/users`)
Routes for managing user data.
**Note:** All routes in this section require authentication (valid token in the `Authorization` header).
**Path Parameter Validation:** `:id` must always be a valid 24-character hex MongoDB ObjectId.

### `GET /api/users/:id/preferences`
Retrieve the job preferences for the specified user.
- **Path Parameters:**
  - `id` (Required): User ID (MongoDB ObjectId)

### `POST /api/users/:id/preferences`
Save or update the job preferences for the specified user.
- **Path Parameters:**
  - `id` (Required): User ID (MongoDB ObjectId)
- **Request Body:**
  ```json
  {
    "categories": ["web", "mobile"],
    "workModel": ["Remote", "Hybrid"],
    "alertTiming": "Evening"
  }
  ```
  *(Note: All fields optional.*
  *Valid `categories`: `web`, `ai/ml`, `data science`, `devops`, `mobile`, `security`, `design`, `PM`, `other`.*
  *Valid `workModel`: `Remote`, `Onsite`, `Hybrid`.*
  *Valid `alertTiming`: `Morning`, `Evening`, `Night`)*

### `GET /api/users/:id/saved-jobs`
Retrieve the list of saved jobs for the specified user.
- **Path Parameters:**
  - `id` (Required): User ID (MongoDB ObjectId)

### `POST /api/users/:id/saved-jobs`
Save a job to the user's saved jobs list.
- **Path Parameters:**
  - `id` (Required): User ID (MongoDB ObjectId)
- **Request Body:**
  ```json
  {
    "jobId": "60d5ec49c5e3a35b801a6123"
  }
  ```
  *(Note: `jobId` is required and must be a valid 24-character hex MongoDB ObjectId)*

### `DELETE /api/users/:id/saved-jobs/:jobId`
Remove a job from the user's saved jobs list.
- **Path Parameters:**
  - `id` (Required): User ID (MongoDB ObjectId)
  - `jobId` (Required): Job ID to remove (MongoDB ObjectId)

---

## Jobs (`/api/jobs`)
Routes for fetching job listings.

### `GET /api/jobs/featured`
Retrieve a curated list of featured jobs for homepage sections.
- **Query Parameters (Optional):**
  - `section`: Specifies the curated section. Valid values: `featured` (default), `engineering`, `leadership`.
- **Response Format:**
  ```json
  {
    "status": 1,
    "data": [
      {
        "_id": "60d5ec...",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "logo": "https://...",
        "location": "New York",
        "salary_max": 150000
      }
    ]
  }
  ```

### `GET /api/jobs/categories`
Retrieve live counts of active jobs grouped by category.
- **Response Format:**
  ```json
  {
    "status": 1,
    "data": [
      {
        "category": "web",
        "label": "Web",
        "count": 123
      }
    ]
  }
  ```

### `GET /api/jobs/filter-options`
Retrieve unique filter options and a list of the top 20 companies by job volume.
- **Response Format:**
  ```json
  {
    "status": 1,
    "data": {
      "experienceLevels": [{ "value": "Senior", "count": 50 }],
      "jobTypes": [{ "value": "Remote", "count": 120 }],
      "topCompanies": [{ "value": "Google", "count": 30 }]
    }
  }
  ```

### `GET /api/jobs/location-suggestions`
Retrieve suggestions for job locations based on a search query (autocomplete).
- **Query Parameters:**
  - `q` (Required): Search string for location matching.
- **Response Format:**
  ```json
  {
    "status": 1,
    "data": [
      "Dhaka, Bangladesh",
      "Remote",
      "New York, USA"
    ]
  }
  ```

### `GET /api/jobs/`
Retrieve a list of jobs with robust filtering, pagination, and search capabilities.
- **Query Parameters (All Optional):**
  - `page`: Page number for pagination (must be a number). Default: 1.
  - `limit`: Number of items per page (must be a number, max 100). Default: 20.
  - `category`: Comma-separated list of valid categories (`web`, `ai/ml`, `data science`, `devops`, `mobile`, `security`, `design`, `PM`, `other`).
  - `experience_level`: Comma-separated list of valid levels (`Junior`, `Mid`, `Senior`, `Not Specified`).
  - `job_type`: Comma-separated list of valid models (`Remote`, `Onsite`, `Hybrid`).
  - `company`: Name of the company (comma-separated for multiple).
  - `salary_min`: Minimum salary (must be a number).
  - `salary_max`: Maximum salary (must be a number).
  - `sort`: Sorting order. Valid values: `recent` (default), `salary_high`.
  - `q`: Search query string for job titles.
  - `location`: Search query string for job location.
- **Example URL:** `/api/jobs?page=1&limit=10&job_type=Remote,Hybrid&sort=recent`
- **Response Format:**
  ```json
  {
    "status": 1,
    "total": 500,
    "page": 1,
    "limit": 10,
    "totalPages": 50,
    "data": [
      {
        "_id": "60d5ec...",
        "title": "Software Engineer",
        "company": "Tech Corp",
        "location": "Remote",
        "salary_min": 100000,
        "salary_max": 150000
      }
    ]
  }
  ```

### `GET /api/jobs/:id`
Retrieve detailed information about a specific job.
- **Path Parameters:**
  - `id` (Required): Job ID (Must be a valid 24-character hex MongoDB ObjectId).
- **Response Format:**
  ```json
  {
    "status": 1,
    "data": {
      "_id": "60d5ec...",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "description": "Full job details..."
    }
  }
  ```

---

## Statistics (`/api/stat`)
Routes for fetching job statistics and metadata.

### `GET /api/stat/`
Retrieve general job statistics.
- **Response:** JSON with `totalJobs`, `totalCompanies`, and `totalLocations`.

### `GET /api/stat/companies`
Retrieve a list of companies present in the job listings.

### `GET /api/stat/last-update`
Retrieve the timestamp of the last successful web scraping operation.

---

## Email (`/api/email`)
Routes for email subscriptions (potentially for alerts or newsletters).

### `GET /api/email/`
Retrieve a list of email subscriptions.

### `POST /api/email/subscribe`
Subscribe an email address to job alerts/newsletters.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "ipAddress": "192.168.1.1",
    "latlong": "40.7128,-74.0060",
    "country": "US"
  }
  ```
  *(Note: `email` is required and must be valid. `ipAddress`, `latlong`, and `country` are optional strings)*

### `GET /api/email/unsubscribe`
Unsubscribe an email address. (Typically used via a link in an email).
- **Query Parameters:**
  - `id` (Required): Subscription ID (Must be a valid 24-character hex MongoDB ObjectId)

### `POST /api/email/verify-code`
Verify a code sent to the email for subscription confirmation.
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "code": "123456"
  }
  ```
  *(Note: `email` and `code` are required)*

---

## Scrape (`/api/scrape`)
Routes related to triggering the job scraping process.

### `GET /api/scrape/`
Manually trigger the web scraper.
- **Authorization:** Requires either a matching `token` in the query parameters (`?token=...`) or a valid `Authorization` header matching the `CRON_SECRET`.
- **Query Parameters:**
  - `token` (Optional): Required if Authorization header is not provided.
- **Responses:**
  - `200 OK`: Scraping completed successfully.
  - `403 Forbidden`: Unauthorized request.
  - `409 Conflict`: Scraper is already running.
  - `500 Internal Server Error`: Scraping failed.

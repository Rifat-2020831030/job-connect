# Job Scraper Runtime

## Overview

The job scraper is a Scrapy project located in `server/job-searcher`. It is scheduled outside the Express API by GitHub Actions, so the API server does not need to keep a long-running cron process alive.

Primary entrypoint:

```bash
python _run_spiders.py
```

Compatibility entrypoint:

```bash
python script-runner.py
```

`script-runner.py` only delegates to `_run_spiders.py`. It does not create a virtual environment or install dependencies at runtime.

## Scheduled Execution

The scraper runs from `.github/workflows/job-scraper.yml`.

Schedule:

```yaml
- cron: "0 */4 * * *"
```

GitHub Actions cron uses UTC, so this runs every 4 hours on UTC time. The workflow can also be started manually through the GitHub Actions UI because it includes `workflow_dispatch`.

The workflow does the following:

1. Checks out the repository.
2. Sets up Python 3.11.
3. Installs dependencies from `server/job-searcher/requirements.txt`.
4. Runs `_run_spiders.py` from `server/job-searcher`.

The workflow uses a concurrency group named `job-scraper`, so a new run will not start while another scraper run is still active.

## Scraper Flow

`_run_spiders.py` loads environment variables, configures logging, creates a Scrapy `CrawlerProcess`, queues all configured company spiders, and starts the crawl.

Currently queued spiders:

- BS23
- DSI
- Optimizely
- Cefalo
- Vivasoft
- Ollyo

Scraped items pass through `jobsearcher.pipelines.JobsearcherPipeline`, which writes job data to MongoDB. The pipeline creates a unique index on `hashValue` and uses that value to avoid duplicate job records.

## MongoDB Logging

At the end of a run, `_run_spiders.py` writes a summary document to the `scraper-log` collection.

Success example:

```json
{
  "timestamp": "Asia/Dhaka adjusted datetime",
  "run_status": "success"
}
```

Failure example:

```json
{
  "timestamp": "Asia/Dhaka adjusted datetime",
  "run_status": "fail",
  "error": "error message"
}
```

The API uses this collection to serve the last successful scrape time.

## Required Configuration

GitHub Actions requires this repository secret:

```text
DB_URI
```

The workflow maps it into the scraper as:

```text
db_uri
```

Optional repository variables:

```text
MONGO_DATABASE
MONGO_COLLECTION
```

Defaults:

```text
MONGO_DATABASE=job-collection
MONGO_COLLECTION=jobs
```

## Manual API Trigger

The Express API still supports a protected manual trigger through `/api/scrape`. That route uses `src/services/scraper-runner.js`, which spawns:

```bash
python3 server/job-searcher/_run_spiders.py
```

The Python executable can be overridden with:

```text
SCRAPER_PYTHON
```

or:

```text
PYTHON_EXECUTABLE
```

The Node runner keeps an in-process lock and returns a conflict if another manual scrape is already running in the same process.

## Local Run

From `server/job-searcher`:

```bash
python -m pip install -r requirements.txt
python _run_spiders.py
```

For local runs, provide MongoDB config through `server/.env`:

```text
db_uri=your_mongodb_connection_string
MONGO_DATABASE=job-collection
MONGO_COLLECTION=jobs
```

import datetime
import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from scrapy.crawler import CrawlerProcess
from scrapy.utils.project import get_project_settings

from jobsearcher.spiders.bs23_job_spider import JobSpider as BS23JobSpider
from jobsearcher.spiders.dsi_job_spider import JobSpider as DSIJobSpider
from jobsearcher.spiders.optimizely_job_spider import JobSpider as OptimizelyJobSpider
from jobsearcher.spiders.spider4 import JobSpider as CefaloJobSpider
from jobsearcher.spiders.spider5 import JobSpider as VivasoftJobSpider
from jobsearcher.spiders.spider6 import JobSpider as OllyoJobSpider

BASE_DIR = Path(__file__).resolve().parent
LOG_FILE = BASE_DIR / "spider_runner.log"
client = None


def build_mongo_client(mongo_uri):
    if not mongo_uri:
        return None
    return MongoClient(
        mongo_uri,
        serverSelectionTimeoutMS=10000,
        connectTimeoutMS=10000,
        socketTimeoutMS=45000,
    )


def log_scrape_result(status, error=None):
    global client

    mongo_uri = os.getenv("db_uri")
    mongo_db = os.getenv("MONGO_DATABASE", "job-collection")
    if not mongo_uri:
        logging.warning("Skipping scraper-log write: db_uri is not set")
        return

    try:
        client = build_mongo_client(mongo_uri)
        db = client[mongo_db]
        log_collection = db["scraper-log"]
        utc_plus_6 = datetime.timezone(datetime.timedelta(hours=6))
        log_entry = {
            "timestamp": datetime.datetime.now(utc_plus_6),
            "run_status": status,
        }
        if error:
            log_entry["error"] = str(error)

        log_collection.insert_one(log_entry)
    except Exception as mongo_error:
        logging.error(f"Failed to log scraping summary to MongoDB: {mongo_error}")


try:
    os.chdir(BASE_DIR)

    dotenv_path = BASE_DIR.parent / ".env"
    load_dotenv(dotenv_path)

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
        handlers=[
            logging.FileHandler(LOG_FILE),
            logging.StreamHandler(),
        ],
    )

    settings = get_project_settings()
    process = CrawlerProcess(settings)

    logging.info("Adding BS23 job spider to the queue")
    process.crawl(BS23JobSpider)

    logging.info("Adding DSI job spider to the queue")
    process.crawl(DSIJobSpider)

    logging.info("Adding Optimizely job spider to the queue")
    process.crawl(OptimizelyJobSpider)

    logging.info("Adding Cefalo job spider to the queue")
    process.crawl(CefaloJobSpider)

    logging.info("Adding Vivasoft job spider to the queue")
    process.crawl(VivasoftJobSpider)

    logging.info("Adding Ollyo job spider to the queue")
    process.crawl(OllyoJobSpider)

    logging.info("Starting the crawling process. Spiders will run one by one.")
    process.start()

    logging.info("All spiders have completed their runs.")
    log_scrape_result("success")
except Exception as error:
    logging.error(f"Error running spiders: {error}")
    log_scrape_result("fail", error)
    raise
finally:
    if client is not None:
        client.close()

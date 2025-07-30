#!/usr/bin/env python
import os
import sys
import logging
import subprocess

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("spider_runner.log"),
        logging.StreamHandler()
    ]
)


def install_requirements():
    """
    Install requirements from requirements.txt
    """
    try:
        logging.info("Installing requirements from requirements.txt...")
        result = subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"], 
                              check=True, capture_output=True, text=True)
        logging.info("Requirements installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to install requirements: {e.stderr}")
        return False
    except FileNotFoundError:
        logging.warning("requirements.txt not found, skipping installation")
        return True


def run_spiders_sequentially():
    """
    Run all spiders one by one in a queue
    """
    logging.info("Starting spider runner...")
def run_spiders_sequentially():
    """
    Run all spiders one by one in a queue
    """
    logging.info("Starting spider runner...")

    # Import scrapy modules after requirements are installed
    from scrapy.crawler import CrawlerProcess
    from scrapy.utils.project import get_project_settings
    from jobsearcher.spiders.bs23_job_spider import JobSpider as BS23JobSpider
    from jobsearcher.spiders.dsi_job_spider import JobSpider as DSIJobSpider
    from jobsearcher.spiders.optimizely_job_spider import JobSpider as OptimizelyJobSpider

    # Get project settings
    settings = get_project_settings()

    process = CrawlerProcess(settings)
    
    logging.info("Adding BS23 job spider to the queue")
    process.crawl(BS23JobSpider)

    logging.info("Adding DSI job spider to the queue")
    process.crawl(DSIJobSpider)

    logging.info("Adding Optimizely job spider to the queue")
    process.crawl(OptimizelyJobSpider)

    # Start the crawling process
    logging.info("Starting the crawling process. Spiders will run one by one.")
    process.start()  # This will block until all spiders are finished

    logging.info("All spiders have completed their runs.")


if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    try:
        # Install requirements first
        if not install_requirements():
            logging.error("Failed to install requirements, exiting")
            sys.exit(1)
        
        run_spiders_sequentially()
        logging.info("Spider runner completed successfully")
        sys.exit(0)
    except Exception as e:
        logging.error(f"Error running spiders: {str(e)}")
        sys.exit(1)

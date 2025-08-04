#!/usr/bin/env python
import os
import sys
import logging
import subprocess
import importlib.util

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler("spider_runner.log"),
        logging.StreamHandler()
    ]
)


def check_package_installed(pip_path, package_name):
    """
    Check if a package is already installed in the virtual environment
    """
    try:
        result = subprocess.run(
            [pip_path, "list"],
            check=True,
            capture_output=True,
            text=True
        )
        return package_name.lower() in result.stdout.lower()
    except subprocess.CalledProcessError:
        # If there's an error checking, assume it's not installed
        return False


def install_requirements():
    """
    Install required packages directly via apt and pip
    """
    required_packages = {
        "scrapy": "python3-scrapy",
        "pymongo": "python3-pymongo",
    }

    try:
        # Create and use virtual environment
        venv_dir = os.path.join(os.path.dirname(__file__), "venv")
        logging.info(f"Creating virtual environment in {venv_dir}")
        if not os.path.exists(venv_dir):
            subprocess.run(
                [sys.executable, "-m", "venv", venv_dir], check=True)
            logging.info("Virtual environment created successfully")
        else:
            logging.info("Using existing virtual environment")
          # Determine pip path in the virtual environment
        if sys.platform == "win32":
            pip_path = os.path.join(venv_dir, "Scripts", "pip")
        else:
            pip_path = os.path.join(venv_dir, "bin", "pip")

        # Install each required package if not already installed
        for package, apt_package in required_packages.items():
            if check_package_installed(pip_path, package):
                logging.info(
                    f"Package {package} is already installed in virtual environment")
            else:
                logging.info(f"Installing {package} in virtual environment")
                try:
                    # First try normal installation
                    subprocess.run([pip_path, "install", package],
                                   check=True, capture_output=True, text=True)
                    logging.info(
                        f"Successfully installed {package} in virtual environment")
                except subprocess.CalledProcessError as e:
                    # If we encounter externally-managed-environment error, try with --break-system-packages
                    if "externally-managed-environment" in e.stderr:
                        logging.warning(
                            f"Detected externally managed environment, trying with --break-system-packages")
                        subprocess.run(
                            [pip_path, "install", package, "--break-system-packages"], check=True)
                        logging.info(
                            f"Successfully installed {package} with --break-system-packages")
                    else:
                        # If it's a different error, re-raise it
                        logging.error(
                            f"Error installing {package}: {e.stderr}")
                        raise

        return True
    except subprocess.CalledProcessError as e:
        logging.error(f"Failed to install packages: {e.stderr}")
        return False
    except Exception as e:
        logging.error(f"Error during package installation: {str(e)}")
        return False


def run_spiders_sequentially():
    """
    Run all spiders one by one in a queue
    """
    logging.info("Starting spider runner...")

    # Activate virtual environment if it exists
    venv_dir = os.path.join(os.path.dirname(__file__), "venv")
    if os.path.exists(venv_dir):
        logging.info(f"Using virtual environment at {venv_dir}")

        # Run a new Python process with the activated virtual environment
        if sys.platform == "win32":
            python_executable = os.path.join(venv_dir, "Scripts", "python.exe")
        else:
            # Create a script to run inside the virtual environment
            python_executable = os.path.join(venv_dir, "bin", "python")
        temp_script_path = os.path.join(
            os.path.dirname(__file__), "_run_spiders.py")
        with open(temp_script_path, "w") as f:
            f.write("""
import os
import sys
import logging
import datetime
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

try:
    # Load environment variables from .env file in the root directory
    dotenv_path = Path(__file__).resolve().parent.parent / '.env'
    load_dotenv(dotenv_path)

    # Setup logging
    logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')

    # Get project settings
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

    # Start the crawling process
    logging.info("Starting the crawling process. Spiders will run one by one.")
    process.start()  # This will block until all spiders are finished

    logging.info("All spiders have completed their runs.")

    # Log the completion in MongoDB
    mongo_uri = os.getenv('db_uri')
    mongo_db = os.getenv('MONGO_DATABASE', 'job-collection')
    client = MongoClient(mongo_uri)
    db = client[mongo_db]
    log_collection = db['scraper-log']
                    
    try:
        log_entry = {
            "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "run_status": "success"
        }
        
        log_collection.insert_one(log_entry)
    except Exception as e:
        logging.error(f"Failed to log scraping summary to MongoDB: {e}")
except Exception as e:
    logging.error(f"Error running spiders: {str(e)}")
    mongo_uri = os.getenv('db_uri')
    mongo_db = os.getenv('MONGO_DATABASE', 'job-collection')
    client = MongoClient(mongo_uri)
    db = client[mongo_db]
    log_collection = db['scraper-log']
    log_entry = {
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "run_status": "fail",
        "error": str(e)
    }
    log_collection.insert_one(log_entry)
finally:
    # Close MongoDB connection
    if client:
        client.close()
""")

        try:
            # Execute the script in the virtual environment
            subprocess.run([python_executable, temp_script_path], check=True)
            # Clean up temp script after execution
            os.remove(temp_script_path)
        except subprocess.CalledProcessError as e:
            logging.error(f"Failed to run spiders in virtual environment: {e}")
            raise
    else:        # Fall back to system Python if no virtual environment
        try:
            import scrapy
            import datetime
            from pathlib import Path
            from dotenv import load_dotenv
            from pymongo import MongoClient
            from scrapy.crawler import CrawlerProcess
            from scrapy.utils.project import get_project_settings
            from jobsearcher.spiders.bs23_job_spider import JobSpider as BS23JobSpider
            from jobsearcher.spiders.dsi_job_spider import JobSpider as DSIJobSpider
            from jobsearcher.spiders.optimizely_job_spider import JobSpider as OptimizelyJobSpider
            from jobsearcher.spiders.spider4 import JobSpider as CefaloJobSpider
            # from jobsearcher.spiders.spider5 import JobSpider as VivasoftJobSpider
            # from jobsearcher.spiders.spider6 import JobSpider as OllyoJobSpider
            dotenv_path = Path(__file__).resolve(
            ).parent.parent / '.env'
            load_dotenv(dotenv_path)

            # Get project settings
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

            # Start the crawling process
            logging.info(
                "Starting the crawling process. Spiders will run one by one.")
            process.start()  # This will block until all spiders are finished

            logging.info("All spiders have completed their runs.")
            # Log the completion in MongoDB
            try:
                # Use the environment variables for MongoDB connection
                mongo_uri = os.getenv('db_uri')
                mongo_db = os.getenv('MONGO_DATABASE', 'job-collection')
                client = MongoClient(mongo_uri)
                db = client[mongo_db]
                log_collection = db['scraper-log']

                log_entry = {
                    "timestamp": datetime.datetime.now(),
                    "run_status": "success"
                }

                log_collection.insert_one(log_entry)
                logging.info("Scraping summary logged to MongoDB successfully")
            except Exception as e:
                logging.error(
                    f"Failed to log scraping summary to MongoDB: {e}")

        except ImportError as e:
            logging.error(f"Failed to import required modules: {e}")
            raise


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

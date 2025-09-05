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
        "python-dotenv": "python3-dotenv",
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

    # Setup environment path for importing from the virtual environment
    venv_dir = os.path.join(os.path.dirname(__file__), "venv")

    # Check if virtual environment exists
    if os.path.exists(venv_dir):
        logging.info(f"Using virtual environment at {venv_dir}")

        # Determine the site-packages directory based on platform
        if sys.platform == "win32":
            site_packages = os.path.join(venv_dir, "Lib", "site-packages")
            bin_dir = os.path.join(venv_dir, "Scripts")
        else:
            # Unix-like systems
            site_packages = os.path.join(
                venv_dir, "lib", f"python{sys.version_info.major}.{sys.version_info.minor}", "site-packages")
            bin_dir = os.path.join(venv_dir, "bin")

        # Add the site-packages to sys.path if it exists
        if os.path.exists(site_packages):
            sys.path.insert(0, site_packages)

        # Add the bin directory to PATH for any executable calls
        if os.path.exists(bin_dir):
            os.environ["PATH"] = f"{bin_dir}{os.pathsep}{os.environ.get('PATH', '')}"

    # Run spiders directly without creating temporary file
    try:
        # Import required modules
        import datetime
        from pathlib import Path
        from dotenv import load_dotenv
        from pymongo import MongoClient

        # Import scrapy modules
        try:
            from scrapy.crawler import CrawlerProcess
            from scrapy.utils.project import get_project_settings
            # Import spider modules
            from jobsearcher.spiders.bs23_job_spider import JobSpider as BS23JobSpider
            from jobsearcher.spiders.dsi_job_spider import JobSpider as DSIJobSpider
            from jobsearcher.spiders.optimizely_job_spider import JobSpider as OptimizelyJobSpider
            from jobsearcher.spiders.spider4 import JobSpider as CefaloJobSpider
            from jobsearcher.spiders.spider5 import JobSpider as VivasoftJobSpider
            from jobsearcher.spiders.spider6 import JobSpider as OllyoJobSpider
        except ImportError as e:
            logging.error(f"Failed to import Scrapy modules: {e}")
            logging.info("Attempting to install required packages...")
            if not install_requirements():
                raise ImportError(
                    "Failed to install and import required packages")

            # Try imports again after installation
            from scrapy.crawler import CrawlerProcess
            from scrapy.utils.project import get_project_settings
            from jobsearcher.spiders.bs23_job_spider import JobSpider as BS23JobSpider
            from jobsearcher.spiders.dsi_job_spider import JobSpider as DSIJobSpider
            from jobsearcher.spiders.optimizely_job_spider import JobSpider as OptimizelyJobSpider
            from jobsearcher.spiders.spider4 import JobSpider as CefaloJobSpider
            from jobsearcher.spiders.spider5 import JobSpider as VivasoftJobSpider
            from jobsearcher.spiders.spider6 import JobSpider as OllyoJobSpider

        # Load environment variables from .env file in the root directory
        dotenv_path = Path(__file__).resolve().parent.parent / '.env'
        load_dotenv(dotenv_path)

        # Get project settings
        settings = get_project_settings()

        # Initialize crawler process
        process = CrawlerProcess(settings)

        # Add all spiders to the queue
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

        # Log completion status to MongoDB
        client = None
        try:
            # Connect to MongoDB using environment variables
            mongo_uri = os.getenv('db_uri')
            mongo_db = os.getenv('MONGO_DATABASE', 'job-collection')
            client = MongoClient(mongo_uri)
            db = client[mongo_db]
            log_collection = db['scraper-log']

            # Create timestamp with UTC+6 timezone
            utc_plus_6 = datetime.timezone(datetime.timedelta(hours=6))
            log_entry = {
                "timestamp": datetime.datetime.now(utc_plus_6),
                "run_status": "success"
            }

            # Insert log entry
            log_collection.insert_one(log_entry)
            logging.info("Scraping summary logged to MongoDB successfully")

        except Exception as e:
            logging.error(f"Failed to log scraping summary to MongoDB: {e}")

        finally:
            # Ensure MongoDB connection is closed
            if client:
                client.close()

    except Exception as e:
        logging.error(f"Error running spiders: {str(e)}")

        # Log failure to MongoDB if possible
        client = None
        try:
            mongo_uri = os.getenv('db_uri')
            mongo_db = os.getenv('MONGO_DATABASE', 'job-collection')
            client = MongoClient(mongo_uri)
            db = client[mongo_db]
            log_collection = db['scraper-log']
            utc_plus_6 = datetime.timezone(datetime.timedelta(hours=6))
            log_entry = {
                "timestamp": datetime.datetime.now(utc_plus_6),
                "run_status": "fail",
                "error": str(e)
            }
            log_collection.insert_one(log_entry)

        except Exception as mongo_err:
            logging.error(f"Failed to log error to MongoDB: {mongo_err}")

        finally:
            if client:
                client.close()

        # Re-raise the exception to be caught by the main function
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

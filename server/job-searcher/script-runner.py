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
    Install required packages directly via apt and pip
    """
    required_packages = {
        "scrapy": "python3-scrapy",
        "pymongo": "python3-pymongo"
    }
    
    try:
        for package, apt_package in required_packages.items():
            logging.info(f"Installing {package} via apt...")
            try:
                # Try to install via apt
                apt_result = subprocess.run(["apt", "install", "-y", apt_package], 
                                          check=True, capture_output=True, text=True)
                logging.info(f"Successfully installed {apt_package} via apt")
                print("apt_result.stdout: ", apt_result.stdout)
            except (subprocess.CalledProcessError, FileNotFoundError) as apt_err:
                logging.warning(f"Failed to install via pip: {apt_err}")
                # Create and use virtual environment as last resort
                venv_dir = os.path.join(os.path.dirname(__file__), "venv")
                logging.info(f"Creating virtual environment in {venv_dir}")
                subprocess.run([sys.executable, "-m", "venv", venv_dir], check=True)
                
                # Determine pip path in the virtual environment
                if sys.platform == "win32":
                    pip_path = os.path.join(venv_dir, "Scripts", "pip")
                else:
                    pip_path = os.path.join(venv_dir, "bin", "pip")
                
                # Install in the virtual environment
                logging.info(f"Installing {package} in virtual environment")
                subprocess.run([pip_path, "install", package], check=True)
                logging.info(f"Successfully installed {package} in virtual environment")
        
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
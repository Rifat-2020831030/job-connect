# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import pymongo
from datetime import datetime, timedelta
import os
import sys
import importlib.util

# Get the current directory path
current_dir = os.path.dirname(os.path.abspath(__file__))

# platform-independent approach
# First - relative import 
try:
    from jobsearcher.ai.text_extractor import text_extractor
except ImportError:
    try:
        # Try direct import 
        from ai.text_extractor import text_extractor
    except ImportError:
        # dynamically import the module from its absolute path
        ai_module_path = os.path.join(current_dir, 'ai', 'text_extractor.py')
        if os.path.exists(ai_module_path):
            module_name = 'text_extractor'
            spec = importlib.util.spec_from_file_location(
                module_name, ai_module_path)
            text_extractor_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(text_extractor_module)
            text_extractor = text_extractor_module.text_extractor
        else:
            print("WARNING: text_extractor module could not be imported")

            def text_extractor(text):
                return text


class JobsearcherPipeline:
    def __init__(self, mongo_uri, mongo_db, mongo_collection):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db
        self.mongo_collection = mongo_collection
        self.client = None

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri=crawler.settings.get('MONGO_URI'),
            mongo_db=crawler.settings.get('MONGO_DATABASE'),
            mongo_collection=crawler.settings.get('MONGO_COLLECTION')
        )

    def open_spider(self, spider):
        if not self.mongo_uri:
            raise RuntimeError("MongoDB connection string 'db_uri' is not configured")

        self.client = pymongo.MongoClient(
            self.mongo_uri,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=45000,
        )
        self.client.admin.command("ping")
        self.db = self.client[self.mongo_db]
        self.mongo_collection = self.db[self.mongo_collection]

        self.mongo_collection.create_index('hashValue', unique=True)

    def close_spider(self, spider):
        if self.client is not None:
            self.client.close()

    def process_item(self, item, spider):
        print("Spider from pipelline: ", spider)
        try:
            item_dict = ItemAdapter(item).asdict()
            # check if the current item matched with the existing item in the database
            existing_item = self.mongo_collection.find_one(
                {'hashValue': item['hashValue']})
            if existing_item:
                # If the item already exists, update it
                spider.logger.info(
                    f"Item already exists: {item['hashValue']}, updating isUpdated status.")
                # Update isUpdated status to False if 24 hours have passed since scraping
                timestamp = existing_item.get('timestamp')
                last_updated = datetime.fromisoformat(timestamp)
                if datetime.now() - last_updated > timedelta(hours=24):
                    self.mongo_collection.update_one(
                        {'hashValue': item['hashValue']},
                        {'$set': {'isUpdated': False}}
                    )
            else:
                # Check based on url
                db_response = self.mongo_collection.find_one(
                    {'url': item['url']})
                if db_response:
                    # Move existing item to archived collection
                    archived_collection = self.db['archived']
                    archived_collection.insert_one(db_response)
                    # Remove from main collection
                    self.mongo_collection.delete_one({'url': item['url']})
                    # Updated one
                    output = text_extractor(item['details'])
                    self.set_value(output, item_dict)
                    # Use item_dict instead of item
                    self.mongo_collection.insert_one(item_dict)
                else:
                    # Define output variable
                    output = text_extractor(item['details'])
                    self.set_value(output, item_dict)
                    self.mongo_collection.insert_one(item_dict)

        except pymongo.errors.DuplicateKeyError:
            spider.logger.info(
                f"Duplicate item found: {item['url']}, skipping.")
        except Exception as e:
            spider.logger.error(f"Error processing item {item['url']}: {e}")
        return item

    def set_value(self, output, item):
        if output:
            # Updating fields only if they don't already exist or are empty
            fields_to_update = [
                'title', 'languages', 'skills', 'experience', 'experience_level',
                'salary_min', 'salary_max', 'deadline', 'location', 'job_type',
                'vacancy', 'benefits'
            ]

            for field in fields_to_update:
                if not item.get(field) and output.get(field):
                    item[field] = output[field]

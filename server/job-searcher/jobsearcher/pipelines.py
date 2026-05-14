# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import pymongo
from datetime import datetime, timedelta


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
        try:
            item_dict = ItemAdapter(item).asdict()
            # self.mongo_collection.insert_one(item_dict)
            # check if the current item matched with the existing item in the database
            existing_item = self.mongo_collection.find_one({'hashValue': item['hashValue']})
            if existing_item:
                # If the item already exists, update it
                spider.logger.info(f"Item already exists: {item['hashValue']}, updating isUpdated status.")
                # Update isUpdated status to False if 24 hours have passed since scraping
                timestamp = existing_item.get('timestamp')
                last_updated = datetime.fromisoformat(timestamp)
                if datetime.now() - last_updated > timedelta(hours=24):
                    self.mongo_collection.update_one(
                        {'hashValue': item['hashValue']},
                        {'$set': {'isUpdated': False}}
                    )
            else:
                # If the item does not exist, insert it
                self.mongo_collection.insert_one(item_dict)
                spider.logger.info(f"New jobs found: {item['url']}. Added to the database.")
        except pymongo.errors.DuplicateKeyError:
            spider.logger.info(f"Duplicate item found: {item['url']}, skipping.")
        except Exception as e:
            spider.logger.error(f"Error processing item {item['url']}: {e}")
        return item

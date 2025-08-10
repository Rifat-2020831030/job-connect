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
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(os.path.dirname(current_dir))
if parent_dir not in sys.path:
    sys.path.append(parent_dir + '\job-searcher\jobsearcher')
    print("Parent directory added to sys.path:", parent_dir)

from ai.text_extractor import text_extractor


class JobsearcherPipeline:
    def __init__(self, mongo_uri, mongo_db, mongo_collection):
        self.mongo_uri = mongo_uri
        self.mongo_db = mongo_db
        self.mongo_collection = mongo_collection

    @classmethod
    def from_crawler(cls, crawler):
        return cls(
            mongo_uri=crawler.settings.get('MONGO_URI'),
            mongo_db=crawler.settings.get('MONGO_DATABASE'),
            mongo_collection=crawler.settings.get('MONGO_COLLECTION')
        )
    
    def open_spider(self, spider):
        self.client = pymongo.MongoClient(self.mongo_uri)
        self.db = self.client[self.mongo_db]
        self.mongo_collection = self.db[self.mongo_collection]

        self.mongo_collection.create_index('hashValue', unique=True)

    def close_spider(self, spider):
        self.client.close()

    def process_item(self, item, spider):
        print("Spider from pipelline: ",spider)
        try:
            item_dict = ItemAdapter(item).asdict()
            # check if the current item matched with the existing item in the database
            output = text_extractor(item['details'])  # Define output variable
            self.set_value(output, item_dict)
            self.mongo_collection.update_one(
                {'url': item['url']},
                {'$set': item_dict},
                upsert=True
            )
            # existing_item = self.mongo_collection.find_one({'hashValue': item['hashValue']})
            # if existing_item:
            #     # If the item already exists, update it
            #     spider.logger.info(f"Item already exists: {item['hashValue']}, updating isUpdated status.")
            #     # Update isUpdated status to False if 24 hours have passed since scraping
            #     timestamp = existing_item.get('timestamp')
            #     last_updated = datetime.fromisoformat(timestamp)
            #     if datetime.now() - last_updated > timedelta(hours=24):
            #         self.mongo_collection.update_one(
            #             {'hashValue': item['hashValue']},
            #             {'$set': {'isUpdated': False}}
            #         )
            # else:
            #     # Check based on url
            #     db_response = self.mongo_collection.find_one({'url': item['url']})
            #     if db_response:
            #         # Move existing item to archived collection
            #         archived_collection = self.db['archived']
            #         archived_collection.insert_one(db_response)
            #         # Remove from main collection
            #         self.mongo_collection.delete_one({'url': item['url']})
            #         # Updated one
            #         output = text_extractor(item['details'])
            #         self.set_value(output, item_dict)
            #         self.mongo_collection.insert_one(item_dict)  # Use item_dict instead of item
            #     else:
            #         output = text_extractor(item['details'])  # Define output variable
            #         self.set_value(output, item_dict)
            #         self.mongo_collection.insert_one(item_dict)

        except pymongo.errors.DuplicateKeyError:
            spider.logger.info(f"Duplicate item found: {item['url']}, skipping.")
        except Exception as e:
            spider.logger.error(f"Error processing item {item['url']}: {e}")
        return item
    
    def set_value(self, output, item):
        if output:
            item['title'] = output.get('title', item.get('title'))
            item['languages'] = output.get('languages')
            item['skills'] = output.get('skills')
            item['experience'] = output.get('experience')
            item['experience_level'] = output.get('experience_level')
            item['salary_min'] = output.get('salary_min')
            item['salary_max'] = output.get('salary_max')
            item['deadline'] = output.get('deadline')
            item['location'] = output.get('location')
            item['job_type'] = output.get('job_type')
            item['vacancy'] = 0 if output.get('vacancy') == -1 else output.get('vacancy')
            item['benefits'] = output.get('benefits')



# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy
import datetime


class JobsearcherItem(scrapy.Item):
    # define the fields for your item here like:
    # name = scrapy.Field()
    url = scrapy.Field()
    title = scrapy.Field()
    languages = scrapy.Field()
    skills = scrapy.Field()
    location = scrapy.Field()
    job_type = scrapy.Field()
    deadline = scrapy.Field()
    salary = scrapy.Field()
    salary_min = scrapy.Field()
    salary_max = scrapy.Field()
    company = scrapy.Field()
    vacancy = scrapy.Field()
    benefits = scrapy.Field()
    details = scrapy.Field()
    timestamp = scrapy.Field(default=datetime.datetime.now().isoformat())
    hashValue = scrapy.Field()
    isUpdated = scrapy.Field(default=True)
    logo = scrapy.Field()
    experience = scrapy.Field()
    experience_level = scrapy.Field()
    pass

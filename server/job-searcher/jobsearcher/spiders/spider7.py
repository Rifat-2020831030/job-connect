import scrapy
import jobsearcher.items as items
import hashlib
import json
from datetime import datetime, timedelta

class Spider7(scrapy.Spider):
    name = 'spider7'
    start_urls = ['https://devxhub.com/career']
    allowed_domains = ['devxhub.com']

    def parse(self, response):
        job_list = response.css('div.max-w-\\[900px\\].w-full.cardBg.md\\:px-10.px-5.py-5.mb-10.last\\:mb-0.flex.flex-row.items-center.justify-between').getall()
        print(job_list)
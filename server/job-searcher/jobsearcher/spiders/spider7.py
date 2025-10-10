import scrapy
import jobsearcher.items as items
import hashlib
import json
from datetime import datetime, timedelta

class JobSpider(scrapy.Spider):
    name = 'spider7'
    allowed_domains = ['welldev.io']
    start_urls = ['https://www.welldev.io/careers']

    def parse(self, response):
        job_list = response.css('div.comp-le9qilng.wixui-repeater')

        job_urls = job_list.css('a.StylableButton2545352419__root.style-le9ryj0q__root.wixui-button.StylableButton2545352419__link::attr(href)').getall()

        for url in job_urls:
            if not url:
                continue
            yield response.follow(url, self.parse_job)

    def parse_job(self, response):
        company = 'Well Dev'
        title = response.xpath('//h4[contains(@class, "m-0 pt-2")]/text()').get()
        location = response.xpath('//div[b[contains(text(), "Location:")]]/div/p/text()').get()
        deadline = response.xpath('//div[b[contains(text(), "Deadline:")]]/div/p/text()').get()
        salary = response.xpath('//div[b[contains(text(), "Salary Range:")]]/div/p/text()').get()
        if title:
            title = title.strip()
        print(f"Title: {title}")
        print(f"Location: {location}")
        print(f"Deadline: {deadline}")
        print(f"Salary: {salary}")
import scrapy
import jobsearcher.items as items
import hashlib
import json
from datetime import datetime


class JobSpider(scrapy.Spider):
    name = 'spider5'
    allowed_domains = ['vivasoftltd.com']
    start_urls = ['https://vivasoftltd.com/career/']

    def parse(self, response):
        job_list = response.css('div.e-con-inner')
        for job in job_list[1:]:  # Skip the first item as it is not a job listing
            job_url = job.css(
                'div.elementor-button-wrapper a.elementor-button.elementor-button-link.elementor-size-sm[href*="/career"]::attr(href)').get()
            if not job_url:
                continue
            experience = response.xpath(
                "//ul[contains(@class, 'elementor-icon-list-items')]//li[.//span[contains(text(), 'Exp')]]//span[contains(@class, 'elementor-icon-list-text')]/text()").get()
            if experience:
                experience = experience.strip()
            yield response.follow(job_url, self.parse_job, meta={
                'experience': experience})

    def parse_job(self, response):
        all_text = response.xpath('//h4[contains(text(), "Overview")]/ancestor::div[contains(@class, "e-con")][1]//text()').getall()
        cleaned_text = ' '.join([text.strip() for text in all_text if text.strip()])

        item = items.JobsearcherItem()
        item['url'] = response.url
        item['details'] = cleaned_text
        item['company'] = 'Vivasoft Ltd'
        item['logo'] = 'https://vivasoftltd.com/wp-content/uploads/2024/03/Logo-1.svg'
        payloads = dict(item)
        payloads = json.dumps(payloads, sort_keys=True).encode('utf-8')
        item['hashValue'] = hashlib.sha256(payloads).hexdigest()
        item['timestamp'] = datetime.now().isoformat()
        item['isUpdated'] = True
        # print("item : ",item)
        yield item

    
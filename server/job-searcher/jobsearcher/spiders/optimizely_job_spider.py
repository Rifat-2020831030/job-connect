import scrapy
import jobsearcher.items as items
from datetime import datetime
import hashlib
import json

class JobSpider(scrapy.Spider):
    name = 'optimizely_job_searcher'

    allowed_domains = ['optimizely.com']
    start_urls = ['https://careers.optimizely.com/search/?q=&q2=&alertId=&locationsearch=&title=&location=dhaka']

    def parse(self, response):
        job_list = response.css('tr.data-row')
        base_url = 'https://careers.optimizely.com'

        for job in job_list:
            url = job.css('a.jobTitle-link::attr(href)').get()
            url = base_url + url 
            yield response.follow(url, self.parse_job)
    
    def parse_job(self, response):
        title = response.css('h1#job-title::text').get()
        location = response.css('span.jobGeoLocation::text').get()
        deadline = response.css('p#job-date::text').get()
        deadline = deadline.replace('Date:', '').strip()
        deadline = datetime.strptime(deadline, '%b %d, %Y').isoformat() if deadline else None
        details_elements = response.css('div[style*="padding:10.0px 0.0px;border:1.0px solid transparent"] ::text').getall()
        details = ' '.join([text.strip() for text in details_elements if text.strip()])


        item = items.JobsearcherItem()
        item['url'] = response.url
        item['title'] = title.strip()
        item['location'] = location.strip() if location else None
        item['deadline'] = deadline.strip() if deadline else None
        item['company'] = 'Optimizely'
        item['logo'] = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/optimizely%20logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL29wdGltaXplbHkgbG9nby5zdmciLCJpYXQiOjE3NTM2ODY0NTMsImV4cCI6MTgxNjc1ODQ1M30.xmaKR3G8vFri-Y7gZkg7QnZStg7N0L19dOk_FncG5Og'
        item['vacancy'] = None
        item['details'] = details
        item['salary'] = 'Not specified'

        payloads = dict(item)
        payloads = json.dumps(payloads, sort_keys=True).encode('utf-8')
        hashValue = hashlib.sha256(payloads).hexdigest()

        item['hashValue'] = hashValue
        item['isUpdated'] = True
        item['timestamp'] = datetime.now().isoformat()

        yield item
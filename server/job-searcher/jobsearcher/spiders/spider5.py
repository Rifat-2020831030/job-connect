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
        job_list = response.css('div.elementor-element.elementor-element-5865673.e-con-full.e-flex.e-con.e-child')
        for job in job_list:
            title = job.css('h2.elementor-heading-title::text').get().strip()
            location = job.css('li.elementor-icon-list-item:first-child .elementor-icon-list-text::text').get().strip()
            experience = job.css('li.elementor-icon-list-item:last-child .elementor-icon-list-text::text').get().strip()
            url = job.css('a.elementor-button::attr(href)').get()
            
            metadata = {
                'title': title,
                'location': location,
                'experience': experience,
            }
            
            yield response.follow(url, self.parse_job, meta={'metadata': metadata})

    def parse_job(self, response):
        # Overview title
        overview_title = response.css('div[data-id="5c7c0b3"] h4.elementor-heading-title::text').get()
        overview_title = overview_title.strip() if overview_title else 'Overview'
        # Overview content
        overview = response.css('div[data-id="eabe213"] div::text').get()
        overview = overview.strip() if overview else 'Not specified'
        overview = overview_title + ': ' + overview
        # Responsibilities
        res_title = response.css('div[data-id="49737bf"] h4.elementor-heading-title::text').get()
        responsibilities = response.css('div[data-id="cc2c711"] ul li::text').getall()
        responsibilities = [resp.strip() for resp in responsibilities if resp.strip()]
        responsibilities = res_title + ": " + ', '.join(responsibilities)
        # Requirements
        req_title = response.css('div[data-id="c63da93"] h4.elementor-heading-title::text').get()
        requirements = response.css('div[data-id="556260a"] ul li::text').getall()
        requirements = [req.strip() for req in requirements if req.strip()]
        requirements = req_title + ": " + ', '.join(requirements)
        # Qualifications
        qualification = response.css('div[data-id="f41afd4"] div ul li span::text').getall()
        qualification = [qual.strip() for qual in qualification if qual.strip()]
        qualification = 'Qualifications: ' + ', '.join(qualification)

        details = f"{overview} \n{responsibilities} \n{requirements} \n{qualification}"
        
        deadline = response.css('div[data-id="f86e8ff"] div::text').get()
        deadline = deadline.strip() if deadline else 'Not specified'
        salary = response.css('div[data-id="0926962"] div::text').get()
        salary = salary.strip() if salary else 'Not specified'

        logo = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/vivasoft.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL3ZpdmFzb2Z0LnN2ZyIsImlhdCI6MTc1NDExNzcwNCwiZXhwIjoxNzU0MjkwNTA0fQ.TfpzcQtzJLIR87MlTeS-y15G8KQh-UgWgIo80InzQmI'
        
        item = items.JobsearcherItem()
        item['url'] = response.url
        item['title'] = response.meta['metadata']['title']
        item['company'] = 'VivaSoft Ltd'
        item['logo'] = logo
        item['location'] = response.meta['metadata']['location']
        item['vacancy'] = "Not specified"
        item['deadline'] = deadline
        item['salary'] = salary
        item['details'] = details
        item['experience'] = response.meta['metadata']['experience']

        payloads = dict(item)
        payloads = json.dumps(payloads, sort_keys=True).encode('utf-8')
        item['hashValue'] = hashlib.sha256(payloads).hexdigest()
        item['timestamp'] = datetime.now().isoformat()
        item['isUpdated'] = True
        yield item
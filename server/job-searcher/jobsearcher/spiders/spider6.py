import scrapy
import jobsearcher.items as items
import hashlib
import json
from datetime import datetime, timedelta

class JobSpider(scrapy.Spider):
    name = 'spider6'
    allowed_domains = ['jobs.ollyo.com']
    start_urls = ['https://jobs.ollyo.com/']

    def parse(self, response):
        job_list = response.css('div.openings')
        if not job_list:
            self.logger.info("No job listings found on the page.")
            return
        job_link = job_list.css('a.opening-apply.stretched-link::attr(href)').getall()
        for url in job_link:   
            yield response.follow(url, self.parse_job)
                                  
    def parse_job(self, response):
        title = response.css('.job-details__top-title::text').getall()
        title = ' '.join([text.strip() for text in title if text.strip()])
        salary = response.css('h2.heading4.job-salary::text').get().strip()
        location = response.css('div.job-details__top-quick-info--item:contains("Location") span::text').get().strip()
        experience = response.css('div.job-details__top-quick-info--item:contains("Experience") span::text').get().strip()
        # Extract all text content including headings from job details
        details_section = response.css('div.job-details__content-desc')
        details_parts = []
        
        for element in details_section.css('p, h3, ul'):
            if element.css('h3'):
            # Extract heading text
                heading = element.css('::text').get()
                details_parts.append(heading.strip())
            elif element.css('p'):
            # Extract paragraph text
                paragraph = ' '.join(element.css('::text').getall())
                if paragraph.strip():
                    details_parts.append(paragraph.strip())
            elif element.css('ul'):
            # Extract list items
                list_items = element.css('li::text').getall()
                if list_items:
                    list_text = ' '.join([item.strip() for item in list_items if item.strip()])
                    details_parts.append(list_text)
        
        details = '; '.join(details_parts)

        benefits = response.css('div.basics-benefits span::text').getall()
        benefits = [benefit.strip() for benefit in benefits if benefit.strip()]
        details += '; Benefits: ' + ', '.join(benefits)
        logo = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/ollyo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL29sbHlvLnN2ZyIsImlhdCI6MTc1NDI2MDIzOSwiZXhwIjoxODE3MzMyMjM5fQ.cQiKQ3GCSIKdwLnXiemLeabEMrqG_ubjdOUgeBILZpw'

        vacancy = "Not specified"
        company = "Ollyo"
        # add 15 days to the current date for the deadline

        item = items.JobsearcherItem()
        item['title'] = title
        item['url'] = response.url
        item['company'] = company
        item['logo'] = logo
        item['location'] = location
        item['vacancy'] = vacancy
        item['salary'] = salary
        item['experience'] = experience
        item['details'] = details

        payload = dict(item)
        hashValue = json.dumps(payload, sort_keys=True).encode('utf-8')
        item['hashValue'] = hashlib.sha256(hashValue).hexdigest()

        # as the deadline is not fixed, so keep it away from hashing to avoid changes
        deadline = (datetime.now() + timedelta(days=15)).strftime('%Y-%m-%dT%H:%M:%S')
        item['deadline'] = deadline
        item['timestamp'] = datetime.now().isoformat()
        item['isUpdated'] = True
        yield item

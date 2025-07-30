import scrapy
from jobsearcher.items import JobsearcherItem
import hashlib
import json
from datetime import datetime 

class JobSpider(scrapy.Spider):
    name = 'dsi_job_searcher'

    start_urls = ['https://app.hrythmic.com/recruit/openings/company/dsinnovators/']

    def parse(self, response):
        job_list = response.css('a.text-hrythmic-primary-color-light::attr(href)').getall()
        # print('Job list: ',job_list)
        # Extract total open positions
        vacancy_count = response.css('div.text-xl.text-slate-800 span.font-bold.text-slate-900::text').get().strip()
            
        for job in job_list:
            yield response.follow(job, self.parse_job, meta={
                'vacancy': vacancy_count
            })

    def parse_job(self, response):
        title = response.css('div.text-slate-900.font-bold.text-center.text-2xl.sm\\:text-4xl.mb-5::text').get()
        description = response.css('div:contains("Description") + div.mt-3\\.5 > p::text').getall()
        responsibilities = response.css('div:contains("Responsibilities") + div.mt-3\\.5 > ul > li::text').getall()
        requirements = response.css('div:contains("Requirements") + div.mt-3\\.5 > ul > li::text').getall()
        benefits = response.css('div:contains("Benefits") + div.mt-3\\.5 > ul > li::text').getall()
        deadline_raw = response.css('div.flex.items-center.gap-1::text').getall()
        deadline = None

        for text in deadline_raw:
            text = text.strip()
            if 'Deadline on' in text:
                # Extract date part after "Deadline on"
                date_str = text.replace('Deadline on', '').strip()
                try:
                    # Parse the date string into a datetime object
                    deadline = datetime.strptime(date_str, '%d %b %Y').isoformat()
                    break
                except ValueError:
                    self.logger.error(f"Could not parse deadline date: {date_str}")

        # print(f"Deadline after parsing: {datetime.strptime(deadline[0].strip(), '%d %b %Y').isoformat() if deadline else None}")
        
        item = JobsearcherItem()
        item['url'] = response.url
        item['title'] = title.strip() 
        item['company'] = 'DS Innovators'
        item['logo'] = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/dsi_logo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL2RzaV9sb2dvLnN2ZyIsImlhdCI6MTc1MzY4NjM2MiwiZXhwIjoxODE2NzU4MzYyfQ.irdlsGdzY-o_AbGC1uMCFH_s-sOxsERiLMJSOac5QNw'
        item['location'] = 'Dhaka, Bangladesh' 
        item['vacancy'] = response.meta['vacancy']
        item['deadline'] = deadline
        item['salary'] = 'Not specified'
        item['details'] = {
            'description': description,
            'responsibilities': responsibilities,
            'requirements': requirements,
            'benefits': benefits,
        }
        item['isUpdated'] = True
        # Convert item to dict before JSON serialization
        item_dict = dict(item)
        payloads = json.dumps(item_dict, sort_keys=True).encode('utf-8')
        hashValue = hashlib.sha256(payloads).hexdigest()
        item['hashValue'] = hashValue
        
        # setting timestamp after hashvalue to stop the timestamp from changing the hash value
        item['timestamp'] = datetime.now().isoformat()
        yield item
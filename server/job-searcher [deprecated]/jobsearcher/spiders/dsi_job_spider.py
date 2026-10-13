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
        # title = response.css('div.text-slate-900.font-bold.text-center.text-2xl.sm\\:text-4xl.mb-5::text').get()
        # description = response.css('div:contains("Description") + div.mt-3\\.5 > p::text').getall()
        # description = ' '.join([desc.strip() for desc in description if desc.strip()])
        # responsibilities = response.css('div:contains("Responsibilities") + div.mt-3\\.5 > ul > li::text').getall()
        # responsibilities = ' '.join([resp.strip() for resp in responsibilities if resp.strip()])
        # requirements = response.css('div:contains("Requirements") + div.mt-3\\.5 > ul > li::text').getall()
        # requirements = ' '.join([req.strip() for req in requirements if req.strip()])
        # benefits = response.css('div:contains("Benefits") + div.mt-3\\.5 > ul > li::text').getall()
        # benefits = ' '.join([benefit.strip() for benefit in benefits if benefit.strip()])
        # deadline_raw = response.css('div.flex.items-center.gap-1::text').getall()
        # deadline = None

        # for text in deadline_raw:
        #     text = text.strip()
        #     if 'Deadline on' in text:
        #         # Extract date part after "Deadline on"
        #         date_str = text.replace('Deadline on', '').strip()
        #         try:
        #             # Parse the date string into a datetime object
        #             deadline = datetime.strptime(date_str, '%d %b %Y').isoformat()
        #             break
        #         except ValueError:
        #             self.logger.error(f"Could not parse deadline date: {date_str}")

        # print(f"Deadline after parsing: {datetime.strptime(deadline[0].strip(), '%d %b %Y').isoformat() if deadline else None}")

        details_content = response.css('section.max-w-5xl.mx-auto.w-full.px-4.sm\\:px-6.mt-6.sm\\:mt-9.mb-10.sm\\:mb-20 *::text').getall()
        details_content = [text.strip() for text in details_content if text.strip()]
        details = " ".join(details_content)

        item = JobsearcherItem()
        item['url'] = response.url
        item['details'] = details
        # item['title'] = title.strip() 
        item['company'] = 'DS Innovators'
        # item['location'] = 'Dhaka, Bangladesh' 
        item['vacancy'] = response.meta['vacancy']
        # item['deadline'] = deadline
        # item['salary'] = 'Not specified'
        # item['details'] = f"Description:\n{description}\n\nResponsibilities:{responsibilities}\n\nRequirements:{requirements}\n\nBenefits:{benefits}"
        # Convert item to dict before JSON serialization
        item_dict = dict(item)
        payloads = json.dumps(item_dict, sort_keys=True).encode('utf-8')
        hashValue = hashlib.sha256(payloads).hexdigest()
        
        item['logo'] = 'https://www.dsinnovators.com/images/dsi_logo.svg'
        item['hashValue'] = hashValue
        item['isUpdated'] = True
        item['timestamp'] = datetime.now().isoformat()
        yield item
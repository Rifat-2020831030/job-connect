import scrapy
import jobsearcher.items as items
import hashlib
import json
from datetime import datetime


class JobSpider(scrapy.Spider):
    name = 'spider4'
    allowed_domains = ['cefalo.com']
    start_urls = ['https://career.cefalo.com']

    def parse(self, response):
        base_url = 'https://career.cefalo.com'
        job_list_elements = response.css(
            'div.grid.grid-cols-1.gap-3.md\\:gap-4.lg\\:grid-cols-2.lg\\:gap-5 div.w-full')
        for job_element in job_list_elements:
            url = base_url + job_element.css('a::attr(href)').get()
            yield response.follow(url, self.parse_job)

    def parse_job(self, response):
        title = response.css(
            'h1.text-2xl.leading-8.md\\:text-3xl::text').get().strip()
        details = response.css('div.jobDetails.text-sm').getall()
        details_text = ' '.join([scrapy.Selector(text=d).xpath('string()').get().strip() for d in details])
        details_text = details_text.replace('\n', ' ').replace('\r', ' ')
        details_text = ' '.join(details_text.split())
        
        location = response.xpath(
            'normalize-space(//strong[normalize-space(.)="Job Location:"]/parent::p/following-sibling::ul[1]/li/text())'
        ).get() or 'Not specified'
        deadline = response.xpath(
            'normalize-space(//p[normalize-space(.)="Application Deadline:"]/parent::div/following-sibling::div[1]/p/text())'
        ).get() or 'Not specified'
        
        skills = response.css(
            'div.ant-flex.css-zg0ahe > span.ant-tag::text').getall()
        skills = [skill.strip() for skill in skills if skill.strip()]      
        details_text += ' ' + '; Skills: '.join(skills)

        url = response.url
        salary = "Not specified"
        logo = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/cefalo.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL2NlZmFsby5zdmciLCJpYXQiOjE3NTQxMDczNzcsImV4cCI6MTgxNzE3OTM3N30.fP9O1nKuOZIFGM8oaEAsE2H5-V1vrn_3ZO77VUP1nho'
        company = 'Cefalo'
        vacancy = 'Not specified'
        timestamp = datetime.now().isoformat()

        item = items.JobsearcherItem()
        item['title'] = title
        item['details'] = details_text
        item['location'] = location
        item['deadline'] = deadline
        item['company'] = company
        item['url'] = url
        item['salary'] = salary
        item['logo'] = logo
        item['vacancy'] = vacancy

        payloads = dict(item)
        payloads = json.dumps(payloads, sort_keys=True).encode('utf-8')
        hashValue = hashlib.sha256(payloads).hexdigest() # generate a unique hash 
        item['hashValue'] = hashValue

        item['timestamp'] = timestamp
        item['isUpdated'] = True

        yield item



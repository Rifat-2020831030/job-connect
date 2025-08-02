import scrapy
from jobsearcher.items import JobsearcherItem
import hashlib
import json
from datetime import datetime


class JobSpider(scrapy.Spider):
    name = 'bs23_job_searcher'
    allowed_domains = ['easy.jobs']
    start_urls = ['https://brainstation-23.easy.jobs/']

    def parse(self, response):
        tables = response.css('div.table').get()
        # print('Tables: ', tables)

        for job in response.css('div.table__row'):
            url = job.css('h4.job-header__title a::attr(href)').get()
            title = job.css('h4.job-header__title a::text').get()
            deadline = job.css(
                'div.job-details h4.job-details__title::text').get()
            vacancy_text = job.css(
                'div.job-details p.job-details__component::text').get()

            # Extract the number from "No of vacancies : 2"
            vacancy = vacancy_text.split(
                ':')[-1].strip() if vacancy_text else None

            location = job.css('span.job-header__component__text::text').getall()[
                1].strip() if len(job.css('span.job-header__component__text')) > 1 else None
            
            deadline = datetime.strptime(deadline, '%d %b, %Y').isoformat() if deadline else None

            data = {
                'url': url,
                'title': title,
                'deadline': deadline,
                'vacancy': vacancy,
                'location': location
            }
            yield response.follow(url, self.parse_job, meta={'data': data})

    def parse_job(self, response):
        data = response.meta['data']
        # Extract salary from the job overview section
        salary = response.css('div.job-overview__list-item-label:contains("Salary") + div.job-overview__list-item-value::text').get()
        salary = salary.strip() if salary else "Not specified"
        content_cards = response.css('section.content-card.section-gap')
        job_description = ""

        for i in range(len(content_cards) - 1):
            card_text = content_cards[i].css('::text').getall()
            card_text = [item.strip() for item in card_text if item.strip()]
            
            # Join this section's text with spaces and append to job_description with semicolon
            section_text = " ".join(card_text)
            if job_description and section_text:
                job_description += "; " + section_text
            elif section_text:
                job_description = section_text

        item = JobsearcherItem()
        item['url'] = data['url']
        item['title'] = data['title']
        item['deadline'] = data['deadline']
        item['vacancy'] = data['vacancy']
        item['location'] = data['location']
        item['details'] = job_description
        item['salary'] = salary if salary else 'Not specified'
        item['company'] = 'Brain Station 23'
        item['logo'] = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/Brain-Station-Logo.webp?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL0JyYWluLVN0YXRpb24tTG9nby53ZWJwIiwiaWF0IjoxNzUzNjg2MTYwLCJleHAiOjE4MTY3NTgxNjB9.v492lC4pO1LHbitTd9EpYX2PLaW5M4y3ZvexFImKSZg'
        
        payloads = dict(item)
        payloads = json.dumps(payloads, sort_keys=True).encode('utf-8')
        hashValue = hashlib.sha256(payloads).hexdigest()

        item['hashValue'] = hashValue
        item['isUpdated'] = True
        # setting timestamp after hashvalue to stop the timestamp from changing the hash value
        item['timestamp'] = datetime.now().isoformat()

        yield item


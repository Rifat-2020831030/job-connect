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
        experience = response.meta['experience']
        title = response.css(
            'h2.elementor-heading-title.elementor-size-default::text').get()
        if title:
            title = title.strip()

        location = response.xpath(
            "//div[contains(text(), 'Location')]/following::div[contains(@class, 'elementor-widget-container')][1]/text()[normalize-space()]").get()
        if location:
            location = location.strip()

        deadline = response.xpath(
            "//div[contains(@class, 'elementor-widget-text-editor')]//p[contains(text(), '-')]/text()").get()
        if deadline:
            deadline = deadline.strip()
            # deadline = datetime.strptime(deadline, '%d %b, %Y').isoformat() if deadline else None
            deadline = datetime.strptime(deadline, '%d-%m-%Y').strftime('%Y-%m-%dT%H:%M:%S')

        salary = response.xpath(
            "//div[contains(text(), 'Salary')]/following::div[contains(@class, 'elementor-widget-container')][1]//text()[normalize-space() and contains(., 'k') and contains(., '-')]").get()
        if salary:
            salary = salary.strip()   
        
        # Details - Extract Overview and other sections
        details = {}
        details_combined = self.extract_details(details, response)

        logo = 'https://jpafrpxxjrkqeemswaqr.supabase.co/storage/v1/object/sign/image-storage/vivasoft.svg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9jMDEwMWQzYS04MTNmLTQxZDQtYjAwNC04ZDlkMWY2OTVhM2EiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZS1zdG9yYWdlL3ZpdmFzb2Z0LnN2ZyIsImlhdCI6MTc1NDExNzcwNCwiZXhwIjoxNzU0MjkwNTA0fQ.TfpzcQtzJLIR87MlTeS-y15G8KQh-UgWgIo80InzQmI'

        item = items.JobsearcherItem()
        item['url'] = response.url
        item['title'] = title
        item['company'] = 'VivaSoft Ltd'
        item['logo'] = logo
        item['location'] = location
        item['vacancy'] = "Not specified"
        item['deadline'] = deadline
        item['salary'] = salary
        item['details'] = details_combined
        item['experience'] = experience

        payloads = dict(item)
        payloads = json.dumps(payloads, sort_keys=True).encode('utf-8')
        item['hashValue'] = hashlib.sha256(payloads).hexdigest()
        item['timestamp'] = datetime.now().isoformat()
        item['isUpdated'] = True
        # print("item : ",item)
        yield item

    def extract_details(self, details, response):
        overview_heading = response.xpath(
            "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'Overview')]").get()
        if overview_heading:
            # Find the text content in the next elementor-widget-text-editor div
            overview_text = response.xpath(
                "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'Overview')]/ancestor::div[contains(@class, 'elementor-widget')]//following-sibling::div[contains(@class, 'elementor-widget-text-editor')]//div[@class='elementor-widget-container']/text()[normalize-space()]").get()
            if overview_text:
                # Extract Responsibilities
                details['Overview'] = overview_text.strip()
        responsibilities_heading = response.xpath(
            "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'Responsibilities')]").get()
        if responsibilities_heading:
            # Get all li elements and extract their complete text content including bold elements
            responsibilities_items = response.xpath(
                "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'Responsibilities')]/ancestor::div[contains(@class, 'elementor-widget')]//following-sibling::div[contains(@class, 'elementor-widget-text-editor')]//li")
            if responsibilities_items:
                responsibilities_list = []
                for li in responsibilities_items:
                    # Get all text content from the li element, including text from span and b elements
                    text_parts = li.xpath(".//text()").getall()
                    # Join all text parts and clean up
                    full_text = " ".join([part.strip()
                                          for part in text_parts if part.strip()])
                    if full_text:
                        responsibilities_list.append(f"• {full_text}")
                if responsibilities_list:
                    details['Responsibilities'] = "\n".join(
                        responsibilities_list)

        # Extract Requirements
        requirements_heading = response.xpath(
            "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'Requirements')]").get()
        if requirements_heading:
            # Get all li elements and extract their complete text content including bold elements
            requirements_items = response.xpath(
                "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'Requirements')]/ancestor::div[contains(@class, 'elementor-widget')]//following-sibling::div[contains(@class, 'elementor-widget-text-editor')]//li")
            if requirements_items:
                requirements_list = []
                for li in requirements_items:
                    # Get all text content from the li element, including text from span and b elements
                    text_parts = li.xpath(".//text()").getall()
                    # Join all text parts and clean up
                    full_text = " ".join([part.strip()
                                          for part in text_parts if part.strip()])
                    if full_text:
                        requirements_list.append(f"• {full_text}")
                if requirements_list:
                    details['Requirements'] = "\n".join(
                        requirements_list)        # Extract What we offer
        offer_heading = response.xpath(
            "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'What we offer')]").get()
        if offer_heading:
            # Get all li elements and extract their complete text content
            offer_items = response.xpath(
                "//h4[contains(@class, 'elementor-heading-title') and contains(text(), 'What we offer')]/ancestor::div[contains(@class, 'elementor-widget')]//following-sibling::div[contains(@class, 'elementor-widget-text-editor')]//li")
            if offer_items:
                offer_list = []
                for li in offer_items:
                    # Get all text content from the li element
                    # Join all text parts and clean up
                    text_parts = li.xpath(".//text()").getall()
                    full_text = " ".join([part.strip()
                                          for part in text_parts if part.strip()])
                    if full_text:
                        offer_list.append(f"• {full_text}")
                if offer_list:
                    details['What we offer'] = "\n".join(offer_list)

        # Combine all sections
        target_headings = ['Overview', 'Responsibilities',
                           'Requirements', 'What we offer']
        details_combined = "\n\n".join(
            [f"{heading}:\n{details[heading]}" for heading in target_headings if heading in details])
        return details_combined

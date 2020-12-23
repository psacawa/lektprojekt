import time

import scrapy
from scrapy import Request


class IdiomSpider(scrapy.Spider):

    name = "idioms"
    delimiter = "|"
    base_url = "https://idioms.thefreedictionary.com/"
    append = True

    # Retries
    retries = {}
    max_retries = 5
    retry_delay = 10.0

    # key attributes
    # download_delay = 0.1
    # start_urls = ['https://idioms.thefreedictionary.com/%22I+see%2c%22+said+the+blind+man']
    start_urls = [
        "https://idioms.thefreedictionary.com/babysit+with+(someone+or+something)"
    ]

    def __init__(self, *args, **kwargs):

        # Create output file
        self.output_filepath = f"output.txt"
        if not self.append:
            with open(self.output_filepath, "w") as f:
                f.write(self.delimiter.join(["url", "idiom", "sentence"]))

        super(IdiomSpider, self).__init__(*args, **kwargs)

    def parse(self, response):

        # Check if it's a redirect, if so wait a bit
        if response.status == 302:
            self.retries[response.url] = self.retries.get(response.url, 0)
            if self.retries[response.url] < self.max_retries:
                self.retries[response.url] += 1
                self.log("----- 403 HIT; DELAYING -----")

                if self.retries[response.url] > 3:
                    time.sleep(self.retry_delay * 10)
                else:
                    time.sleep(self.retry_delay)
                yield response.request.replace(dont_filter=True)
            else:
                raise ValueError(
                    "%s still returns 302 responses after %s retries",
                    response.url,
                    self.retries[response.url],
                )
            return

        # Process current
        url = response.url
        idiom_name = response.css("h1::text").get()
        sample_sentences = response.xpath(
            "//span[@class='illustration']/text()"
        ).extract()

        if len(sample_sentences) > 0:
            with open(self.output_filepath, "a") as f:

                f.write(
                    "\n"
                    + "\n".join(
                        self.delimiter.join([url, idiom_name, sample_sentence])
                        for sample_sentence in sample_sentences
                    )
                )

        # Process additional
        hrefs = response.xpath(
            '//div//div//strong[text()="Idioms browser"]//..//..//ul/li[@class="current"]/following-sibling::li/a/@href'
        ).extract()

        if len(hrefs) > 0:
            next_url = self.base_url + hrefs[0]
            yield Request(
                url=next_url,
                callback=self.parse,
                cookies={},
                meta={"handle_httpstatus_list": [302]},
            )

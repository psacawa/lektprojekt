from typing import List

from scrapy.http import Request, Response
from scrapy.linkextractors import LinkExtractor
from scrapy.selector import Selector
from scrapy.spiders import CrawlSpider, Rule, Spider
from scrapy_redis.spiders import RedisSpider


class IdiomsThefreedictionarySpider(CrawlSpider):
    name = "idioms-thefreedictionary"
    domain = "idioms.thefreedictionary.com"
    allowed_domains = [domain]
    start_urls = [f"https://{domain}/INS"]
    links_query = (
        "//div[@class='heading-block'][strong/text()='Idioms browser']"
        "/following-sibling::div/ul/li[@class='current']/following-sibling::li/a"
    )

    rules = [
        Rule(
            LinkExtractor(restrict_xpaths=[links_query]), callback="parse", follow=True
        )
    ]

    def parse(self, response: Response):
        # extract items
        title = response.xpath("//h1/text()").get()
        sections: List[Selector] = response.xpath("//div[@id='Definition']/section")
        for section in sections:
            source = section.xpath("string(./div[@class='cprh'])").get()
            self.logger.debug(f"{source=}")
            elements: List[Selector] = section.xpath(
                "./div[@class='ds-list' or @class='ds-single' or @class='pseg']|h2"
            )
            idiom = None
            definition = None
            example = None
            for element in elements:
                if element.xpath("name()").get() == "h2":
                    # h2 representing idiom
                    #  it may have embedded spans, so use string()
                    idiom = element.xpath("string()").get()
                elif element.xpath("@class").get() in ["ds-single", "ds-list", "pseg"]:
                    # div with class = ds-single or ds-list representing def'n + example
                    definition = element.xpath("string()").get()
                    example = element.css(".illustration::text").get()
                    yield {
                        "idiom": idiom,
                        "definition": definition,
                        "example": example,
                    }

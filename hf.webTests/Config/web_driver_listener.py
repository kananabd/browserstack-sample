import datetime
import logging

from selenium.webdriver.support.events import AbstractEventListener

log_filename = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
logging.basicConfig(
    # log file will be created in "tests" directory.
    filename=f"./Logs/{log_filename}.log",
    format="%(asctime)s: %(levelname)s: %(message)s",
    level=logging.INFO
)


class WebDriverListener(AbstractEventListener):
    def __init__(self):
        self.logger = logging.getLogger("selenium")

    def before_navigate_to(self, url, driver):
        self.logger.info(f"Navigating to {url}")

import os

from Config.web_driver_listener import WebDriverListener
from selenium import webdriver
from selenium.webdriver.edge.options import Options
from selenium.webdriver.edge.service import Service as EdgeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.support.event_firing_webdriver import EventFiringWebDriver
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager


class DriverFactory:
    @staticmethod
    def get_driver(config, headless_mode=False) -> EventFiringWebDriver:
        if config["browser"] == "chrome":
            options = webdriver.ChromeOptions()
            # To get to the root directory, we need to recursively apply os.path.dirname
            ROOT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)))
            folder = os.path.join(ROOT_DIR, "TestData", config["download_directory"])
            folder = folder.replace("\\\\", "\\")
            prefs = {
                "download.default_directory": folder,
                "safebrowsing.enabled": "false",
            }
            options.add_experimental_option("prefs", prefs)
            options.add_argument("start-maximized")
            options.add_argument("--lang=en-au")
            options.add_experimental_option("excludeSwitches", ["enable-logging"])
            options.add_experimental_option(
                "prefs", {"profile.default_content_setting_values.geolocation": 1}
            )
            # BrowserStack files needs to be pre-uploaded and mention their unique ID below
            # maximum file can be uploaded to their server is 10 and it is automatically being deleted every 30 days
            # File Names: Payslip --> RegressionsDummyPayslipsEmpty.pdf and TextExcelPayslipImport.xlsx
            options.set_capability(
                "bstack:options",
                {
                    "uploadMedia": [
                        "media://66a0c22b37070c4d3abf4e624c3d7870d18f3b8d",
                        "media://c26072943c2f2f03532f2a68b83e55e3f7803e35",
                    ]
                },
            )
            if headless_mode is True:
                options.add_argument("--headless")
                options.add_argument("window-size=2560,1440")
            if config["running_in_docker"] is True:
                options.add_argument("--no-sandbox")
                options.add_argument("--disable-dev-shm-usage")
                driver = EventFiringWebDriver(
                    webdriver.Chrome(options=options), WebDriverListener()
                )
            else:
                # Latest Chrome driver has issues while downloading.
                # Chrome driver gets frozen or does not move to the next Page
                # For ex:- driver.get()
                driver = EventFiringWebDriver(
                    webdriver.Chrome(options=options), WebDriverListener()
                )
            return driver

        elif config["browser"] == "firefox":
            options = webdriver.FirefoxOptions()
            if headless_mode is True:
                options.headless = True
            if config["running_in_docker"] is True:
                driver = EventFiringWebDriver(
                    webdriver.Firefox(options=options), WebDriverListener()
                )
            else:
                driver = EventFiringWebDriver(
                    webdriver.Firefox(
                        service=FirefoxService(GeckoDriverManager().install()),
                        options=options,
                    ),
                    WebDriverListener(),
                )
            return driver

        elif config["browser"] == "edge":
            options = Options()
            options.use_chromium = True
            ROOT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)))
            folder = os.path.join(ROOT_DIR, "TestData", config["download_directory"])
            folder = folder.replace("\\\\", "\\")
            prefs = {
                "download.default_directory": folder,
                "safebrowsing.enabled": "false",
            }
            options.add_experimental_option("prefs", prefs)
            options.add_argument("start-maximized")
            options.add_argument("--lang=en-au")
            options.add_experimental_option("excludeSwitches", ["enable-logging"])
            if headless_mode is True:
                options.add_argument("headless")
            if config["running_in_docker"] is True:
                driver = EventFiringWebDriver(
                    webdriver.Chrome(options=options), WebDriverListener()
                )
            else:
                driver = EventFiringWebDriver(
                    webdriver.Chrome(
                        service=EdgeService(EdgeChromiumDriverManager().install()),
                        options=options,
                    ),
                    WebDriverListener(),
                )
            return driver

        raise Exception("Provide valid driver name")

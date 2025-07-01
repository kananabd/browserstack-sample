import json
import logging
import os
import pathlib
from datetime import datetime
from datetime import timezone
from platform import node
from platform import python_version

import pytest
import selenium
from Config.driver_factory import DriverFactory
from py.xml import html

CONFIG_FILENAME = "config.json"
DEFAULT_WAIT_TIME = 10
SUPPORTED_BROWSERS = ["chrome", "firefox", "edge"]
DEFAULT_WEBSITE = "https://hfapptest.humanforce.io/"
driver = None


@pytest.fixture(scope="session")
def config(request):
    file = pathlib.Path(os.path.dirname(__file__))
    file_name = request.config.getoption("-c")
    if file_name is None:
        config = file.with_name(CONFIG_FILENAME)
    else:
        file_name = os.path.split(file_name)[1]
        config = file.with_name(file_name)
    with config.open() as fp:
        return json.load(fp)


@pytest.fixture(scope="session")
def browser_setup(config):
    if "browser" not in config:
        raise Exception('The config file does not contain "browser"')
    elif config["browser"] not in SUPPORTED_BROWSERS:
        raise Exception(f'"{config["browser"]}" is not a supported browser')
    return config["browser"]


@pytest.fixture(scope="session")
def wait_time_setup(config):
    return config["wait_time"] if "wait_time" in config else DEFAULT_WAIT_TIME


@pytest.fixture(scope="session")
def website_setup(config):
    return config["tested_page"] if "tested_page" in config else DEFAULT_WEBSITE


@pytest.fixture()
def setup(request, config):
    global driver
    driver = DriverFactory.get_driver(config, config["headless_mode"])
    driver.implicitly_wait(config["timeout"])
    request.cls.driver = driver
    if config["browser"] == "firefox":
        driver.maximize_window()
    yield driver
    driver.quit()


# This method is used to change the title of Customized Report
@pytest.hookimpl(optionalhook=True)
def pytest_html_report_title(report):
    report.title = "Automation Test Report for HF Web"


@pytest.hookimpl(optionalhook=True)
def pytest_html_results_table_header(cells):
    cells.insert(1, str(html.th("Test Case")))
    cells.insert(2, str(html.th("Date Run At")))
    cells.insert(3, str(html.th("Time Run At", class_="sortable time", col="time")))

    cells.pop()


@pytest.hookimpl(optionalhook=True)
def pytest_html_results_table_row(report, cells):
    dateformatObj = datetime.now(timezone.utc)
    cells.insert(1, str(html.td(report.testcase)))
    cells.insert(2, str(html.td(dateformatObj.strftime("%d-%B-%Y"))))
    cells.insert(3, str(html.td(dateformatObj.strftime("%H:%M:%S"), class_="col-time")))

    cells.pop()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    global driver
    pytest_html = item.config.pluginmanager.getplugin("html")
    outcome = yield
    report = outcome.get_result()
    extra = getattr(report, "extra", [])
    if report.when == "call" or report.when == "setup":
        xfail = hasattr(report, "wasxfail")
        if (report.skipped and xfail) or (report.failed and not xfail):
            file_name = report.nodeid.split("::")[-1] + ".png"
            report_directory = os.path.dirname(
                os.path.abspath(item.config.option.htmlpath)
            )
            file_name = item.name + ".png"
            destinationFile = os.path.join(report_directory, file_name)
            _capture_screenshot(driver, destinationFile)
            if file_name:
                html = (
                    '<div><img src="%s" alt="screenshot" style="width:300px;height:228px;" '
                    'onclick="window.open(this.src)" align="right"/></div>' % file_name
                )
                extra.append(pytest_html.extras.html(html))
            report.extras = extra
    testcase = report.nodeid.split("::")
    if len(testcase) > 2:
        report.testcase = testcase[2]
    else:
        report.testcase = testcase[-1]  # fallback to test name
    setattr(report, "pytest_html_duration_format", "%H:%M:%S")


def pytest_configure(config):
    config.option.htmlpath = (
        "Reports/"
        + "HF-Web_Automation_Report_"
        + datetime.now(timezone.utc).strftime("%d-%m-%Y (%H-%M-%S)")
        + ".html"
    )
    config.option.xmlpath = (
        "Reports/"
        + "HF-Web_Automation_Report_"
        + datetime.now(timezone.utc).strftime("%d-%m-%Y (%H-%M-%S)")
        + ".xml"
    )
    config._metadata = {
        "python_version": python_version(),
        "Node": node(),
        "Packages": {
            "pytest_version": pytest.__version__,
            "Selenium_Version": selenium.__version__,
        },
    }


def _capture_screenshot(driver, name):
    if driver is not None:
        driver.save_screenshot(name)
    else:
        logging.error("Driver is not initialized")

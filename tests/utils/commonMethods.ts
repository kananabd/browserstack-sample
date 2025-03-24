import { Page } from '@playwright/test';
import logger from '@lib/utils/logger';
import { fixture } from '../hooks/pageFixtures'
import { Locator, Frame } from '@playwright/test';

export class CommonMethods {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Tries to scroll to and click an element based on the locator
   */
  async tryClickUntilFound(locator: string) {
  const element = this.page.locator(locator);
  await element.scrollIntoViewIfNeeded();
  await element.click();
  }

  /**
  * Method to configure/set time input
  */
  async configureTimeInput(inputLocator: string, time: string): Promise<void> {
    const input = this.page.locator(inputLocator);
    await input.click();
    await this.page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
    await this.page.keyboard.press('Backspace');
    await input.type(time);
    logger.info(`Configured time: ${time}`);
  }

/**
 * Verifies that a notification containing the given message is visible on the page or inside any iframe
 */
async verifyNotificationIsVisible(message: string, timeout = 20000): Promise<void> {
  try {
    logger.info(`Searching for notification: "${message}"`);

    async function waitForNotification(locator: Locator, location: string): Promise<boolean> {
      if (await locator.count() > 0) {
        await locator.waitFor({ state: 'attached', timeout });
        await locator.waitFor({ state: 'visible', timeout });
        logger.info(`Notification "${message}" found ${location}.`);
        return true;
      }
      return false;
    }

    // First, search for the notification on the main page
    const notificationLocator = fixture.page.locator(`//*[contains(text(), "${message}")]`);
    if (await waitForNotification(notificationLocator, "on the main page")) {
      return;
    }

    // Search across all iframes first
    const frames = fixture.page.frames();
    logger.info(`Detected ${frames.length} iframes. Checking all iframes first...`);

    for (const frame of frames) {
      try {
        const frameNotificationLocator = frame.locator(`//*[contains(text(), "${message}")]`);
        if (await waitForNotification(frameNotificationLocator, `inside iframe: ${frame.url()}`)) {
          return;
        }

        // Check nested iframes
        const nestedFrames = frame.childFrames();
        for (const nestedFrame of nestedFrames) {
          try {
            const nestedLocator = nestedFrame.locator(`//*[contains(text(), "${message}")]`);
            if (await waitForNotification(nestedLocator, `inside nested iframe: ${nestedFrame.url()}`)) {
              return;
            }
          } catch (error) {
            logger.warn(`Error checking nested iframe: ${nestedFrame.url()} - ${error}`);
          }
        }
      } catch (error) {
        logger.warn(`Error checking iframe: ${frame.url()} - ${error}`);
      }
    }

    // If not found in any iframe, check FaceRecV2 iframe specifically
    logger.info(`Notification not found in general iframes. Now checking specifically for "faceRecV2IFrame"...`);
    const targetFrame = frames.find(frame => frame.name() === "faceRecV2IFrame" || frame.url().includes("/FaceRecV2/Registration"));

    if (targetFrame) {
      const frameNotificationLocator = targetFrame.locator(`//*[contains(text(), "${message}")]`);
      if (await waitForNotification(frameNotificationLocator, `inside FaceRecV2 iframe: ${targetFrame.url()}`)) {
        return;
      }
      const nestedFrames = targetFrame.childFrames();
      if (nestedFrames.length > 0) {
        for (const frame of nestedFrames) {
          try {
            const nestedLocator = frame.locator(`//*[contains(text(), "${message}")]`);
            if (await waitForNotification(nestedLocator, `inside nested iframe of FaceRecV2: ${frame.url()}`)) {
              return;
            }
          } catch (error) {
            logger.warn(`Error checking nested iframe inside FaceRecV2: ${frame.url()} - ${error}`);
          }
        }
      }
    }

    throw new Error(`Notification "${message}" was not found on the main page or inside any iframe.`);
  } catch (error) {
    logger.error(`Notification "${message}" is not visible within ${timeout} ms.`);
    throw error;
  }
}

/**
 * Verifies that a notification containing the given message is NOT visible on the page or inside any iframe
 */
async verifyNotificationIsNotVisible(message: string, timeout = 60000): Promise<void> {
  logger.info(`Verifying that notification "${message}" is NOT visible.`);

  async function isNotificationVisible(locator: Locator): Promise<boolean> {
    if (await locator.count() > 0) {
      try {
        await locator.waitFor({ state: 'visible', timeout: 2000 });
        return true;
      } catch {
        // If it exists but is not visible within 2 seconds, treat it as not visible
        return false;
      }
    }
    return false;
  }

  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    let found = false;

    // Check main page
    const notificationLocator = fixture.page.locator(`//*[contains(text(), "${message}")]`);
    if (await isNotificationVisible(notificationLocator)) {
      found = true;
    }

    // Check all iframes
    const frames = fixture.page.frames();
    for (const frame of frames) {
      const frameNotificationLocator = frame.locator(`//*[contains(text(), "${message}")]`);
      if (await isNotificationVisible(frameNotificationLocator)) {
        found = true;
        break;
      }
      const nestedFrames = frame.childFrames();
      for (const nestedFrame of nestedFrames) {
        const nestedLocator = nestedFrame.locator(`//*[contains(text(), "${message}")]`);
        if (await isNotificationVisible(nestedLocator)) {
          found = true;
          break;
        }
      }
      if (found) break;
    }

    // Specific FaceRecV2 iframe
    if (!found) {
      const targetFrame = frames.find(frame => frame.name() === "faceRecV2IFrame" || frame.url().includes("/FaceRecV2/Registration"));
      if (targetFrame) {
        const frameNotificationLocator = targetFrame.locator(`//*[contains(text(), "${message}")]`);
        if (await isNotificationVisible(frameNotificationLocator)) {
          found = true;
        }
        const nestedFrames = targetFrame.childFrames();
        for (const frame of nestedFrames) {
          const nestedLocator = frame.locator(`//*[contains(text(), "${message}")]`);
          if (await isNotificationVisible(nestedLocator)) {
            found = true;
            break;
          }
        }
      }
    }

    if (found) {
      throw new Error(`Notification "${message}" IS visible.`);
    }

    await fixture.page.waitForTimeout(1000);
  }

  logger.info(`Notification "${message}" is confirmed NOT visible within ${timeout / 1000} seconds.`);
}

/**
 * Verifies that a text is visible on the webpage or inside an iframe
 */
async verifyTextExistsOnPage(text: string, timeout = 10000): Promise<void> {
  try {
    const normalizedText = text.trim().replace(/\s+/g, ' ').toLowerCase();

    await this.page.waitForFunction(
      (expectedText) => {
        const bodyText = document.body.textContent || ''; 
        return bodyText.replace(/\s+/g, ' ').toLowerCase().includes(expectedText);
      },
      normalizedText,
      { timeout }
    );

    logger.info(`Verified that "${text}" is present on the page.`);
  } catch (error) {
    logger.error(`Text "${text}" not found on the page within ${timeout} ms.`);
    throw new Error(`Failed to verify text presence: "${text}"`);
  }
}

/**
 * Searches for an employee using a dynamic placeholder that contains "Employee Code" or "Employee code"
 */
async searchWithEmployeeCode(employeeCode: string, timeout = 5000): Promise<void> {
  try {
    const inputLocator = this.page.locator('//input[contains(@placeholder, "Employee Code") or contains(@placeholder, "Employee code")]');

    await inputLocator.waitFor({ state: 'visible', timeout });
    await inputLocator.fill(employeeCode);
    await inputLocator.press('Enter');

    logger.info(`Searched for employee code: "${employeeCode}"`);
  } catch (error) {
    logger.error(`Failed to find the employee search input field.`);
    throw new Error(`Employee search field with placeholder "Employee Code" not found.`);
  }
}

  /*
  * Waits for spinner to disappear
  */
  async waitForSpinnerToDisappear(spinnerLocator: string) {
    await this.page.waitForSelector(spinnerLocator, { state: 'hidden' });
  }

  /*
  * Clicks on a button dynamically based on locator structure, including inside iframes
  */
async clickButton(buttonLabel: string) {
  if (!fixture.page) {
    throw new Error("Page object is undefined. Make sure it's initialized in web.hooks.ts");
  }

  const locators = [
    `//button[normalize-space()='${buttonLabel}']`,
    `//span[normalize-space()='${buttonLabel}']`,
    `//div[normalize-space()='${buttonLabel}']`,
    `//a[normalize-space()='${buttonLabel}']`,
    `//input[@value='${buttonLabel}']`,
    `//*[@role='button' and normalize-space()='${buttonLabel}']`,
    `//*[contains(text(), '${buttonLabel}') and not(self::script) and not(self::style)]`
  ];

  async function findAndClick(pageOrFrame: Page | Frame) {
    for (const selector of locators) {
      const button = pageOrFrame.locator(selector);
      if (await button.count() > 0) {
        logger.info(`Found "${buttonLabel}" using: ${selector} (${await button.count()} elements). Clicking...`);
        await button.first().scrollIntoViewIfNeeded();
        await button.first().waitFor({ state: 'visible', timeout: 5000 });
        await button.first().click();
        logger.info(`Clicked on "${buttonLabel}".`);
        return true;
      }
    }
    const roleBasedButton = pageOrFrame.getByRole('button', { name: buttonLabel });
    if (await roleBasedButton.count() > 0) {
      logger.info(`Found "${buttonLabel}" using role-based locator. Clicking...`);
      await roleBasedButton.first().scrollIntoViewIfNeeded();
      await roleBasedButton.first().waitFor({ state: 'visible', timeout: 5000 });
      await roleBasedButton.first().click();
      logger.info(`Clicked on "${buttonLabel}" using role-based locator.`);
      return true;
    }

    return false;
  }

  if (await findAndClick(fixture.page)) {
    return;
  }

  logger.warn(`"${buttonLabel}" not found on the main page. Checking inside iframes...`);

  async function searchFrames(frames: Frame[]) {
    for (const frame of frames) {
      try {
        for (const selector of locators) {
          const buttonInsideIframe = frame.locator(selector);
          if (await buttonInsideIframe.count() > 0) {
            await buttonInsideIframe.waitFor({ state: 'visible', timeout: 5000 });
            await buttonInsideIframe.first().scrollIntoViewIfNeeded();
            await buttonInsideIframe.first().click();
            logger.info(`Successfully clicked "${buttonLabel}" inside iframe: ${frame.url()}`);
            return true;
          }
        }

        // Role-based locator inside iframe
        const roleBasedButton = frame.getByRole('button', { name: buttonLabel });
        if (await roleBasedButton.count() > 0) {
          await roleBasedButton.first().waitFor({ state: 'visible', timeout: 5000 });
          await roleBasedButton.first().scrollIntoViewIfNeeded();
          await roleBasedButton.first().click();
          logger.info(`Successfully clicked "${buttonLabel}" using role-based locator inside iframe: ${frame.url()}`);
          return true;
        }
        const nestedFrames = frame.childFrames();
        if (nestedFrames.length > 0) {
          if (await searchFrames(nestedFrames)) {
            return true;
          }
        }
      } catch (error) {
        logger.warn(`Error checking iframe: ${frame.url()} - ${error}`);
      }
    }
    return false;
  }

  if (await searchFrames(fixture.page.frames())) {
    return;
  }

  logger.error(`Button "${buttonLabel}" was not found on the main page or inside any iframe.`);
  throw new Error(`Button "${buttonLabel}" was not found on the main page or inside any iframe. Check if it exists.`);
}

 /**
 * Selects an item dynamically
 */
  async selectOption(selectionLabel: string) {
    if (!fixture.page) {
      throw new Error("Page object is undefined. Make sure it's initialized in web.hooks.ts.");
    }
    // Prioritize selecting elements that are NOT labels first
    const selectionLocator = `//span[contains(text(),'${selectionLabel}')] | //div[contains(text(),'${selectionLabel}')] | //button[contains(text(),'${selectionLabel}')]`;
    // If no element is found, fall back to labels
    const fallbackLocator = `//label[contains(text(),'${selectionLabel}')] | label[for="${selectionLabel.toLowerCase().replace(/ /g, '-')}"]`;
    
    let selection = fixture.page.locator(selectionLocator);
    // If no matching element is found, try label elements
    if (await selection.count() === 0) {
      logger.warn(`⚠ No element found for "${selectionLabel}", trying label elements...`);
      selection = fixture.page.locator(fallbackLocator);
    }
  
    await selection.first().click();
    logger.info(`Selected "${selectionLabel}"`);
  }

  /**
   * Fills a numeric input field dynamically
   */
  async setNumericField(fieldLocator: string, value: string | null, fieldName: string) {
    if (!value || value.toLowerCase() === "null") {
      logger.warn(`Skipping ${fieldName} numeric input as value is null or not provided.`);
      return;
    }

    try {
      const field = this.page.locator(fieldLocator);
      await field.waitFor({ state: "visible", timeout: 5000 });
      await field.click();
      await field.fill("");
      await field.type(value);
      await field.press("Tab");

      logger.info(`Successfully set "${fieldName}" to ${value}`);
    } catch (error) {
      logger.error(`Failed to set "${fieldName}". Locator not found.`);
      throw error;
    }
  }

  /**
   * Selects a value from a Kendo dropdown dynamically
   */
  async selectKendoDropdown(fieldLocator: string, value: string | null, fieldName: string) {
    if (!value || value.toLowerCase() === "null") {
      logger.warn(`Skipping ${fieldName} selection as value is null or not provided.`);
      return;
    }

    try {
      const dropdownButton = this.page.locator(fieldLocator);
      await dropdownButton.waitFor({ state: 'visible', timeout: 10000 });
      await dropdownButton.click();

      const dropdownOption = this.page.locator(`//ul[contains(@class, 'k-list-ul')]//li[normalize-space()='${value}']`);
      await dropdownOption.waitFor({ state: 'visible', timeout: 5000 });
      await dropdownOption.click();

      logger.info(`Successfully selected "${value}" for ${fieldName}`);
    } catch (error) {
      logger.error(`Failed to select "${value}" for ${fieldName}.`);
      throw error;
    }
  }

  /**
   * Dynamically selects an option from a dropdown (works for both <select> and custom dropdowns).
   */
  async selectDropdownOption(optionText: string) {
    logger.info(`Attempting to select "${optionText}" from a dropdown dynamically`);
    const normalizedOptionText = optionText.trim();
    const dropdownLocators = this.page.locator('select');

    const dropdownCount = await dropdownLocators.count();
    if (dropdownCount === 0) {
      throw new Error("No <select> dropdowns found on the page.");
    }

    let correctDropdown = null;
    let updatedOptions: string[] = [];

    // Find the correct dropdown that contains the desired option
    for (let i = 0; i < dropdownCount; i++) {
      const dropdown = dropdownLocators.nth(i);
      await dropdown.waitFor({ state: "visible", timeout: 5000 });

      let retries = 0;
      while (retries < 5) {
        await this.page.waitForTimeout(1000);
        updatedOptions = await dropdown.locator('option').allInnerTexts();
        updatedOptions = updatedOptions.map(option => option.trim());

        if (updatedOptions.includes(normalizedOptionText)) {
          correctDropdown = dropdown;
          break;
        }
        retries++;
      }

      if (correctDropdown) break;
    }

    if (!correctDropdown) {
      throw new Error(`No dropdown found containing option: "${optionText}". Last detected options: ${JSON.stringify(updatedOptions)}`);
    }

    // Select the option from the correct dropdown
    const dropdownId = await correctDropdown.getAttribute('id');
    logger.info(`Found the correct <select> dropdown: ${dropdownId}. Using selectOption().`);

    await correctDropdown.selectOption({ label: normalizedOptionText });
    logger.info(`Successfully selected "${normalizedOptionText}" from the dropdown.`);
  }

  /**
 * Expands a collapsible tab dynamically based on its text
 * Detects if a new browser tab is opened and switches to it
 */
  async expandTab(tabName: string) {
  logger.info(`Attempting to expand the "${tabName}" tab`);

  // Get current open pages
  const initialPages = fixture.page.context().pages();
  const initialTabCount = initialPages.length;

  // Wait for possible tab opening
  await fixture.page.waitForTimeout(3000);
  const updatedPages = fixture.page.context().pages();

  if (updatedPages.length > initialTabCount) {
    fixture.page = updatedPages[updatedPages.length - 1];
    await fixture.page.bringToFront();
  } else {
    logger.info("No new browser tab detected.");
  }

  // Locate the tab by its text
  const tabLocator = fixture.page.locator(`//h3[contains(text(),'${tabName}')]`);
  
  try {
    await tabLocator.waitFor({ state: 'attached', timeout: 10000 });
    await tabLocator.waitFor({ state: 'visible', timeout: 10000 });
  } catch (error) {
    throw new Error(`Tab "${tabName}" not found on the page after waiting.`);
  }

  // Get the current state of the tab (expanded or collapsed)
  const isExpanded = await tabLocator.getAttribute("aria-expanded");

  if (isExpanded === "false") {
    logger.info(`"${tabName}" tab is collapsed. Expanding it now.`);
    await tabLocator.click();
    await fixture.page.waitForTimeout(500);
    logger.info(`"${tabName}" tab successfully expanded.`);
  } else {
    logger.info(`"${tabName}" tab is already expanded. No action needed.`);
  }
}
}
# Getting Started with the Repository

## Prerequisites
To begin working with this repository, ensure you have the following tools installed:

- **Node.js**: A runtime for executing JavaScript outside of a browser.
- **Git**: Version control system.
- **VSCode Editor**: Code editor with a wide range of extensions for productivity.
- **VS Code Extensions**:
  - **Playwright Test for VSCode**
  - **Cucumber for Visual Studio Code**
  - **Cucumber Gherkin Full Support**
  - **Cucumber Step Definition Generator**
- **Cucumber**: Behavior-driven development framework.
- **Browserstack Application**: For running tests in a cloud environment.

---

## Setting Up Cucumber

### Installation
Install the Cucumber library as a development dependency:
```bash
npm i @cucumber/cucumber -D
```
---

## Browserstack Application

### Setting Up
- Obtain your **username** and **access key** from Browserstack.
- Use the `browserstack-node-sdk` to run tests in the Browserstack environment.
- Refer to the `browserstack.yml` file for more configuration details.

---

## Setting Up Playwright

### Installation
Install Playwright along with its test runner:
```bash
npm i -D @playwright/test
```
---

### Running Tests

1. **Install Dependencies**:
   ```bash
   npm i
   ```

2. **Run Tests on Browserstack**:
   Check the `package.json` file for details and execute:
   ```bash
   npm run ctest:hfwebauto:login
   ```

7. **Run Individual Tags locally**:
   ```bash
   npx cucumber-js --tags "@login"
   ```

---

## Package.JSON file

**The `package.json` file in a Node.js project is a critical configuration file that manages project metadata, dependencies, and scripts. Here's a detailed breakdown of its sections and how it applies to repository**

### Key Sections of `package.json`
1. **`name` and `version`**:
   - Specifies the project name and version.
   ```json
   {
       "name": "hf.endtoendtests",
       "version": "1.0.0"
   }
   ```

2. **`scripts`**:
   - Defines custom commands for automating tasks like testing or building.
   - Example for your repository:
     ```json
     "scripts": {
    "ctest:hfwebauto": "cross-env ENV=dev.hfwebauto BROWSERSTACK_CONFIG_FILE=browserstack-hfwebauto.yml browserstack-node-sdk cucumber-js test",
    "ctest:hfwebauto:login": "npm run ctest:hfwebauto -- --tags @login"
  }
     ```

3. **`dependencies` and `devDependencies`**:
   - `dependencies`: Required packages for production.
   - `devDependencies`: Required for development/testing (e.g., Cucumber, Playwright).
   ```json
   "devDependencies": {
       "@cucumber/cucumber": "^8.0.0",
       "@playwright/test": "^1.37.0",
       "browserstack-node-sdk": "^2.0.0"
   }
   ```

4. **`profiles`**:
   - Define reusable configurations for running Cucumber tests with different environments or settings.
   - Example:
     ```json
     "cucumber": {
         "profiles": {
             "dev": {
                 "require": ["tests/steps/**/*.ts", "tests/hooks/**/*.ts"],
                 "tags": "@dev",
                 "format": ["progress-bar", "html:test-results/cucumber-report.html"]
             },
             "staging": {
                 "require": ["tests/steps/**/*.ts", "tests/hooks/**/*.ts"],
                 "tags": "@staging",
                 "format": ["summary", "json:./cucumber-report.json"]
             }
         }
     }
     ```

5. **`engines`**:
   - Specifies the Node.js version compatibility.
   ```json
   "engines": {
       "node": ">=16.0.0"
   }
   ```

---

### How to Modify and Use `package.json` for Your Repository

- **Add Scripts for Frequent Tasks**:
  - For Playwright:
    ```json
    "scripts": {
        "playwright:dev": "npx playwright test --config=playwright.config.ts",
        "playwright:debug": "npx playwright test --debug"
    }
    ```
  - For Generating Reports:
    ```json
    "scripts": {
        "generate-report": "open test-results/cucumber-report.html"
    }
    ```

- **Custom Environments**:
  - Add placeholders for `.env` files and ensure they're loaded during script execution using `dotenv` or similar libraries.
    ```json
    "scripts": {
        "load-env": "dotenv -e .env.dev -- npx cucumber-js"
    }
    ```

- **Install Packages**:
  - Use npm commands to install new dependencies and save them appropriately:
    ```bash
    npm install <package-name> --save  # For dependencies
    npm install <package-name> --save-dev  # For devDependencies
    ```

---

## Configuring and Running Tests

### Tag Configuration
- Each feature folder will have a corresponding tag in the feature file matching the directory name.
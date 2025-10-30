# 🧠 Salesforce Playwright Automation Framework

Automated **end-to-end testing framework** built using **Playwright + TypeScript** for Salesforce CRM.  
Supports UI & API validation, OAuth 2.0 login, and reusable Page Object Models — designed for scalability, maintainability, and CI/CD integration.

---

## 🚀 Features

- End-to-End Salesforce UI Automation  
- OAuth 2.0 Login Support via environment variables  
- Page Object Model (POM) for maintainability  
- Reusable Fixtures & Utilities  
- API + UI Data Validation  
- Parallel Execution & Custom Reporting  
- CI/CD Integration via GitHub Actions  

---

## 🧩 Project Structure
tests/ # All Playwright test specs
pages/ # Page Object Model classes
fixtures/ # Reusable test setup and teardown
utils/ # Helpers, API, and data utilities
playwright.config.ts # Global Playwright configuration
package.json # Project dependencies and scripts

yaml
Copy code

---

## ⚙️ Tech Stack

| Component       | Description                     |
|-----------------|---------------------------------|
| Language        | TypeScript                      |
| Automation Tool | Playwright                       |
| Test Runner     | Playwright Test                  |
| CI/CD           | GitHub Actions                   |
| Reporting       | HTML Reports (Playwright built-in) |
| Version Control | Git + GitHub                     |

---

## 🧰 Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/rajesh-kr99/salesforce-playwright-framework.git
cd salesforce-playwright-framework
2️⃣ Install Dependencies

npm install
3️⃣ Configure Environment Variables
Create a .env file in the project root:
SF_USERNAME=your_salesforce_username
SF_PASSWORD=your_salesforce_password
SF_LOGIN_URL=https://login.salesforce.com
SF_CLIENT_ID=your_oauth_client_id
SF_CLIENT_SECRET=your_oauth_client_secret
⚠️ .env is ignored by Git for security.

🧪 Running Tests Locally
Run All Tests
npx playwright test

Run a Specific Test
npx playwright test tests/login.spec.ts

Run Tests in Headed Mode
npx playwright test --headed

Run Tests in Parallel
npx playwright test --workers=4

Open HTML Report
npx playwright show-report

🤖 Continuous Integration (CI)
This project integrates with GitHub Actions for automated test runs on every push or pull request.

Example Workflow: .github/workflows/playwright.yml

name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run Playwright tests
        run: npx playwright test --reporter=html

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report

✅ Result: Your tests run automatically, and HTML reports are uploaded as artifacts in GitHub Actions.

🔒 Security Notes
Do not commit credentials — always use .env or GitHub Secrets.

Store sensitive data in GitHub Actions → Settings → Secrets and Variables → Actions.

No Salesforce usernames or passwords should be hardcoded.

🧑‍💻 Author
Rajesh Katanguri
GitHub: rajesh-kr99

🏷️ License
This project is licensed under MIT License — see LICENSE for details.

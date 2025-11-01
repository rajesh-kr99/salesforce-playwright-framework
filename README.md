# 🚀 Salesforce Playwright Automation Framework

[![Playwright Tests](https://github.com/rajesh-kr99/salesforce-playwright-framework/actions/workflows/playwright.yml/badge.svg)](https://github.com/rajesh-kr99/salesforce-playwright-framework/actions/workflows/playwright.yml)
[![Allure Report](https://img.shields.io/badge/Allure-Report-green)](https://rajesh-kr99.github.io/salesforce-playwright-framework/)

A **production-ready** end-to-end testing framework for **Salesforce CRM** built with **Playwright + TypeScript**. Features JWT authentication, automated CI/CD with GitHub Actions, and beautiful Allure reporting.

---

## ✨ Key Features

- 🔐 **JWT OAuth Authentication** - Bypasses MFA/OTP for seamless CI/CD execution
- 🎯 **Page Object Model (POM)** - Maintainable and scalable test architecture
- 🔄 **Session Management** - Reuses authentication sessions across test runs
- 📊 **Allure Reporting** - Rich, interactive test reports with history tracking
- ⚡ **Parallel Execution** - Fast test execution with configurable workers
- 🤖 **CI/CD Ready** - Automated daily runs with GitHub Actions
- 🌐 **API + UI Testing** - Validates both UI interactions and API responses
- 🔧 **TypeScript** - Type-safe test development with IntelliSense support

---

## � Project Structure

```
salesforce-playwright-framework/
├── .github/
│   └── workflows/
│       └── playwright.yml          # GitHub Actions CI/CD workflow
├── tests/                          # Test specifications organized by module
│   ├── accounts/                   # Account CRUD tests
│   ├── contacts/                   # Contact management tests
│   ├── leads/                      # Lead conversion tests
│   ├── opportunities/              # Opportunity pipeline tests
│   ├── api/                        # API validation tests
│   └── auth/                       # Authentication tests
├── pages/                          # Page Object Model classes
│   ├── LoginPage.ts               # Login page actions
│   ├── AccountPage.ts             # Account page interactions
│   ├── ContactPage.ts             # Contact page interactions
│   ├── LeadPage.ts                # Lead page interactions
│   └── OpportunityPage.ts         # Opportunity page interactions
├── fixtures/                       # Test fixtures and setup
│   ├── loginFixtures.ts           # Authentication fixture with JWT support
│   └── index.ts                   # Fixture exports
├── utils/                          # Utility functions
│   ├── jwtAuth.ts                 # JWT authentication helper
│   ├── apiHelper.ts               # API utility functions
│   └── dataGenerator.ts           # Test data generation
├── data/                           # Test data files
├── playwright.config.ts            # Playwright configuration
├── package.json                    # Dependencies and scripts
└── .env                           # Environment variables (gitignored)
```

---

## 🛠️ Tech Stack

| Component | Technology | Description |
|-----------|-----------|-------------|
| **Language** | TypeScript | Type-safe test development |
| **Test Framework** | Playwright | Modern, reliable E2E testing |
| **Authentication** | JWT OAuth 2.0 | RSA256-signed bearer tokens |
| **Reporting** | Allure | Rich test reports with history |
| **CI/CD** | GitHub Actions | Automated test execution |
| **Environment** | Node.js 18+ | JavaScript runtime |
| **Package Manager** | npm | Dependency management |

---

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Salesforce Developer/Sandbox Account**
- **Connected App** with JWT Bearer Flow enabled (for CI/CD)

---

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/rajesh-kr99/salesforce-playwright-framework.git
cd salesforce-playwright-framework
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Install Playwright Browsers

```bash
npx playwright install --with-deps
```

### 4️⃣ Configure Environment Variables

Create a `.env` file in the project root:

```env
# Salesforce Credentials
SALESFORCE_USERNAME=your_username@example.com
SALESFORCE_PASSWORD=your_password
SALESFORCE_SECURITY_TOKEN=your_security_token
SALESFORCE_URL=https://yourinstance.salesforce.com
SALESFORCE_LOGIN_URL=https://login.salesforce.com

# API Authentication (for API tests)
SALESFORCE_CLIENT_ID=your_consumer_key
SALESFORCE_CLIENT_SECRET=your_consumer_secret
SALESFORCE_API_URL=https://yourinstance.salesforce.com/services/data/v60.0

# JWT Authentication (for CI/CD - no OTP)
SALESFORCE_JWT_CLIENT_ID=your_jwt_consumer_key
JWT_LOGIN_METHOD=jwt

# Salesforce URLs
SALESFORCE_ACCOUNTS_URL=https://yourinstance.lightning.force.com/lightning/o/Account/list
SALESFORCE_CONTACTS_URL=https://yourinstance.lightning.force.com/lightning/o/Contact/list
SALESFORCE_OPPORTUNITIES_URL=https://yourinstance.lightning.force.com/lightning/o/Opportunity/list
SALESFORCE_LEADS_URL=https://yourinstance.lightning.force.com/lightning/o/Lead/list
```

⚠️ **Security Note:** The `.env` file is gitignored. Never commit credentials to version control.

---

## 🧪 Running Tests

### Run All Tests

```bash
npm test
# or
npx playwright test
```

### Run Specific Test Suite

```bash
npx playwright test tests/accounts/
npx playwright test tests/contacts/
npx playwright test tests/opportunities/
```

### Run Single Test File

```bash
npx playwright test tests/accounts/createAccount.spec.ts
```

### Run Tests in Headed Mode (See Browser)

```bash
npx playwright test --headed
```

### Run Tests with UI Mode (Interactive)

```bash
npx playwright test --ui
```

### Run Tests in Debug Mode

```bash
npx playwright test --debug
```

### Run Tests in Parallel

```bash
npx playwright test --workers=4
```

### Run Tests Sequentially

```bash
npx playwright test --workers=1
```

---

## 📊 Viewing Test Reports

### Playwright HTML Report

```bash
npx playwright show-report
```

### Allure Report (Local)

```bash
# Generate and open Allure report
npm run allure:generate
npm run allure:open

# Or combined
npm run test:report
```

### Allure Report (Live - GitHub Pages)

Test reports are automatically published to GitHub Pages after each CI run:

🔗 **[View Live Allure Report](https://rajesh-kr99.github.io/salesforce-playwright-framework/)**

---

## 🔐 JWT Authentication Setup

JWT authentication eliminates MFA/OTP prompts in CI/CD environments.

### Step 1: Generate RSA Key Pair

The framework includes `server.key` and `server.crt` (gitignored). To generate new keys:

```bash
# Using OpenSSL
openssl genrsa -out server.key 2048
openssl req -new -x509 -key server.key -out server.crt -days 365
```

### Step 2: Create Salesforce Connected App

1. **Setup** → **App Manager** → **New Connected App**
2. Enable **OAuth Settings**
3. Enable **Use digital signatures**
4. Upload `server.crt` certificate
5. Select OAuth Scopes: `api`, `refresh_token`, `offline_access`
6. **Save** and note the **Consumer Key**

### Step 3: Configure JWT in .env

```env
SALESFORCE_JWT_CLIENT_ID=your_consumer_key_from_connected_app
JWT_LOGIN_METHOD=jwt
```

### Step 4: Pre-authorize Users

1. **Connected App** → **Manage** → **Edit Policies**
2. **Permitted Users**: "Admin approved users are pre-authorized"
3. **Manage Profiles** → Add your profile (e.g., System Administrator)

---

## 🤖 CI/CD with GitHub Actions

### Automated Test Execution

Tests run automatically:
- ✅ On every push to `main` branch
- ✅ On pull requests to `main`
- ✅ Daily at 8:00 AM UTC (scheduled)
- ✅ Manual trigger via GitHub UI

### Workflow Configuration

See [`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)

### Setting up GitHub Secrets

Add the following secrets in **Settings → Secrets and Variables → Actions**:

```
SF_USERNAME           → Salesforce username
SF_PASSWORD           → Salesforce password
SF_SECURITY_TOKEN     → Salesforce security token
SF_LOGIN_URL          → https://login.salesforce.com
SF_URL                → https://yourinstance.salesforce.com
SF_API_URL            → https://yourinstance.salesforce.com/services/data/v60.0
SF_CLIENT_ID          → OAuth Consumer Key (for API tests)
SF_CLIENT_SECRET      → OAuth Consumer Secret
SALESFORCE_JWT_CLIENT_ID  → JWT Consumer Key (for CI/CD)
SALESFORCE_PRIVATE_KEY    → RSA private key (single line with \n escapes)
```

### Converting Private Key for GitHub Secrets

```bash
# Create single-line format with \n escape sequences
awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' server.key > private-key-for-github.txt
# Copy content of private-key-for-github.txt to SALESFORCE_PRIVATE_KEY secret
```

---

## 📦 NPM Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm test` | `npx playwright test` | Run all tests |
| `npm run test:clean` | Clean results + run tests | Fresh test run |
| `npm run allure:generate` | Generate Allure report | Create HTML report |
| `npm run allure:open` | Open Allure report | View in browser |
| `npm run test:report` | Complete test + report flow | Clean → Test → Report → Open |

---

## 🏗️ Framework Architecture

### Page Object Model (POM)

Each Salesforce module has a dedicated page class:

```typescript
// pages/AccountPage.ts
export class AccountPage {
  constructor(private page: Page) {}
  
  async createAccount(accountName: string) {
    await this.newButton.click();
    await this.accountNameField.fill(accountName);
    await this.saveButton.click();
  }
}
```

### Test Fixtures

Reusable setup and teardown logic:

```typescript
// fixtures/loginFixtures.ts
export const test = base.extend<MyFixtures>({
  loginPage: async ({ page, context }, use) => {
    // Handles JWT or username/password authentication
    // Manages session state with auth.json
    await use(loginPage);
  },
});
```

### JWT Authentication Flow

1. Load JWT configuration (client ID, username, private key)
2. Create signed JWT assertion (RS256 algorithm)
3. Exchange JWT for access token via OAuth 2.0
4. Navigate to Salesforce using frontdoor.jsp with token
5. Save authenticated session for reuse

---

## 📈 Test Coverage

Current test suite includes:

- ✅ **Authentication** - Login with JWT and session management
- ✅ **Accounts** - Create, edit, delete, search
- ✅ **Contacts** - CRUD operations and validation
- ✅ **Leads** - Lead creation and conversion
- ✅ **Opportunities** - Pipeline management
- ✅ **API Tests** - REST API validation

**Total Tests:** 26  
**Pass Rate:** 96% (25/26 passing, 1 flaky timeout)

---

## 🐛 Troubleshooting

### Issue: MFA/OTP Required in CI/CD

**Solution:** Enable JWT authentication (see [JWT Setup](#-jwt-authentication-setup))

### Issue: Session Expired Errors

**Solution:** Delete `auth.json` to force fresh login:
```bash
rm auth.json
npx playwright test
```

### Issue: Tests Timing Out

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
export default defineConfig({
  timeout: 60000, // 60 seconds
});
```

### Issue: Private Key Format Error

**Solution:** Ensure private key has proper newlines:
```bash
# Check key format
cat server.key | head -1
# Should show: -----BEGIN RSA PRIVATE KEY-----
```

---

## 🔒 Security Best Practices

- ✅ Never commit `.env` files (already in `.gitignore`)
- ✅ Never commit `auth.json` (already in `.gitignore`)
- ✅ Never commit private keys (`server.key` in `.gitignore`)
- ✅ Use GitHub Secrets for CI/CD credentials
- ✅ Rotate OAuth secrets regularly
- ✅ Use separate Salesforce orgs for testing (sandbox/developer)
- ✅ Limit Connected App permissions to minimum required scopes

---

## 📝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Rajesh Katanguri**
- GitHub: [@rajesh-kr99](https://github.com/rajesh-kr99)
- Repository: [salesforce-playwright-framework](https://github.com/rajesh-kr99/salesforce-playwright-framework)

---

## 🙏 Acknowledgments

- [Playwright](https://playwright.dev/) - Modern web testing framework
- [Allure Framework](https://allurereport.org/) - Flexible test reporting
- [Salesforce](https://www.salesforce.com/) - CRM platform
- [GitHub Actions](https://github.com/features/actions) - CI/CD automation

---

## 📞 Support

For issues, questions, or contributions:
- 🐛 [Report a Bug](https://github.com/rajesh-kr99/salesforce-playwright-framework/issues)
- 💡 [Request a Feature](https://github.com/rajesh-kr99/salesforce-playwright-framework/issues)
- 📖 [View Documentation](https://playwright.dev/docs/intro)

---

**⭐ If you find this framework helpful, please give it a star!**
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

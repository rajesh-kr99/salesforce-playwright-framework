// fixtures/loginFixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const STORAGE_STATE_PATH = 'auth.json';

type MyFixtures = {
  loginPage: LoginPage;
  //page: Page;
};

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page, context }, use) => {
    const loginPage = new LoginPage(page);

    // If storage state exists, load it
    if (fs.existsSync(STORAGE_STATE_PATH)) {
      await context.addCookies(JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8')).cookies);
      await page.goto(process.env.SALESFORCE_URL!);
    } else {
      // Do UI login
      await loginPage.login(
        process.env.SALESFORCE_URL!,
        process.env.SALESFORCE_USERNAME!,
        process.env.SALESFORCE_PASSWORD!
      );

      // Save storage state for reuse
      console.log('First login detected — pause for manual 2FA if needed');
      await loginPage.page.pause(); // only first run

      await context.storageState({ path: STORAGE_STATE_PATH });
      console.log('✅ Storage state saved for future runs');
    }

    await use(loginPage);
  },
});

export { expect } from '@playwright/test';

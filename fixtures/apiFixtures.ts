import { test as base, expect } from '@playwright/test';
import { SalesforceAPI } from '../utils/salesforceAPI';

type MyFixtures = {
  salesforce: SalesforceAPI;
};

export const test = base.extend<MyFixtures>({
  salesforce: async ({ request }, use) => {
    const token = process.env.SALESFORCE_ACCESS_TOKEN!;
    const instanceUrl = process.env.SALESFORCE_API_URL!;

    const salesforce = new SalesforceAPI(request, token, instanceUrl);
    await use(salesforce);
  },
});

export { expect } from '@playwright/test';

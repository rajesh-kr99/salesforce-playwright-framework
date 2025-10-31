import { test as base, expect } from '@playwright/test';
import { SalesforceAPI } from '../utils/salesforceApiClient';
import { getSalesforceOAuthResponse } from '../utils/salesforceOAuthHelper';

type MyFixtures = {
  salesforce: SalesforceAPI;
};

export const test = base.extend<MyFixtures>({
  salesforce: async ({ request }, use) => {
    // Get fresh OAuth token dynamically
    const oauthResponse = await getSalesforceOAuthResponse(request);
    const token = oauthResponse.access_token;
    const instanceUrl = oauthResponse.instance_url;

    const salesforce = new SalesforceAPI(request, token, instanceUrl);
    await use(salesforce);
  },
});

export { expect } from '@playwright/test';

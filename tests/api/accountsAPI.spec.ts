import { test, expect } from '@playwright/test';
import { getSalesforceOAuthResponse } from '../../utils/salesforceOAuthHelper';
import { test as fixtureTest } from '../../fixtures/apiFixtures';
import accountDataArray from '../../data/accountCreationData.json';
import type { AccountData } from '../../utils/types';

test.describe('Salesforce Accounts API Tests', () => {
  
  test('Create single Account via API with direct request', async ({ request }) => {
    // Get fresh access token dynamically
    const oauthResponse = await getSalesforceOAuthResponse(request);
    const instanceUrl = oauthResponse.instance_url;
    const accessToken = oauthResponse.access_token;

    // Create unique account name
    const timestamp = Date.now();
    const payload = {
      Name: `API Test Account_${timestamp}`,
      Type: 'Prospect',
      Industry: 'Technology'
    };

    // POST request to create Account
    const response = await request.post(`${instanceUrl}/services/data/v64.0/sobjects/Account/`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    const body = await response.json();
    console.log(`✅ Created Account: ${body.id} - ${payload.Name}`);

    // Validate response
    expect(response.ok()).toBeTruthy();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('success', true);
  });

});

fixtureTest.describe('Salesforce Accounts API Tests with Fixture', () => {
  
  fixtureTest('Create multiple Accounts via API using data-driven approach', async ({ salesforce }) => {
    for (const accountData of accountDataArray as AccountData[]) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '');
      const payload = {
        ...accountData,
        Name: `${accountData.Name}_${timestamp}`, // Unique Name per run
      };

      const createdAccount = await salesforce.createRecord('Account', payload);

      console.log(`✅ Created Account: ${createdAccount.id} (${accountData.Type})`);

      // Validate response
      expect(createdAccount).toHaveProperty('id');
      expect(createdAccount).toHaveProperty('success', true);
    }
  });

});

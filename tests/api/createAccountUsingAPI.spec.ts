import { test, expect } from '@playwright/test';

test('Create Salesforce Account via API', async ({ request }) => {
  // Salesforce instance and access token
  const instanceUrl = 'https://orgfarm-18f9b8b1f4-dev-ed.develop.my.salesforce.com';
  const accessToken = process.env.SALESFORCE_ACCESS_TOKEN!; // or hardcode temporarily for testing

  // Hardcoded account payload
  const payload = {
    Name: 'Test Account 102320257'
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
  console.log('API Response:', body);

  // Validate response
  expect(response.ok()).toBeTruthy();
  expect(body).toHaveProperty('id');
  expect(body).toHaveProperty('success', true);
});

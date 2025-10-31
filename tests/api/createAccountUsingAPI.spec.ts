import { test, expect } from '@playwright/test';
import { getSalesforceOAuthResponse } from '../../utils/salesforceOAuthHelper';

test('Create Salesforce Account via API', async ({ request }) => {
  // Get fresh access token dynamically
  const oauthResponse = await getSalesforceOAuthResponse(request);
  const instanceUrl = oauthResponse.instance_url;
  const accessToken = oauthResponse.access_token;

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

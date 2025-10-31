import { APIRequestContext } from '@playwright/test';

/**
 * Get Salesforce Access Token using OAuth 2.0 Password Grant Flow
 * @param request - Playwright APIRequestContext
 * @returns Access token string
 */
export async function getSalesforceAccessToken(request: APIRequestContext): Promise<string> {
  const username = process.env.SALESFORCE_USERNAME!;
  const password = process.env.SALESFORCE_PASSWORD!;
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN!;
  const clientId = process.env.SALESFORCE_CLIENT_ID!;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET!;
  const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';

  // Critical: Use URLSearchParams for application/x-www-form-urlencoded format
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('username', username);
  params.append('password', password + securityToken); // Concatenate password + security token

  try {
    const response = await request.post(`${loginUrl}/services/oauth2/token`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: params.toString(), // Convert to string format
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      console.error('❌ OAuth Error Response:', errorBody);
      throw new Error(`OAuth authentication failed: ${response.status()} - ${errorBody}`);
    }

    const body = await response.json();
    
    console.log('✅ Successfully obtained access token');
    console.log('Instance URL:', body.instance_url);
    
    return body.access_token;
  } catch (error) {
    console.error('❌ Failed to get Salesforce access token:', error);
    throw error;
  }
}

/**
 * Get Salesforce Access Token with full OAuth response
 * Returns access_token, instance_url, and other OAuth details
 */
export async function getSalesforceOAuthResponse(request: APIRequestContext): Promise<{
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}> {
  const username = process.env.SALESFORCE_USERNAME!;
  const password = process.env.SALESFORCE_PASSWORD!;
  const securityToken = process.env.SALESFORCE_SECURITY_TOKEN!;
  const clientId = process.env.SALESFORCE_CLIENT_ID!;
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET!;
  const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';

  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('client_id', clientId);
  params.append('client_secret', clientSecret);
  params.append('username', username);
  params.append('password', password + securityToken);

  const response = await request.post(`${loginUrl}/services/oauth2/token`, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: params.toString(),
  });

  if (!response.ok()) {
    const errorBody = await response.text();
    console.error('❌ OAuth Error Response:', errorBody);
    throw new Error(`OAuth authentication failed: ${response.status()} - ${errorBody}`);
  }

  const body = await response.json();
  console.log('✅ OAuth successful. Instance:', body.instance_url);
  
  return body;
}

import { APIRequestContext } from '@playwright/test';

export class SalesforceAPI {
  private request: APIRequestContext;
  private token: string;
  private instanceUrl: string;

  constructor(request: APIRequestContext, token: string, instanceUrl: string) {
    this.request = request;
    this.token = token;
    this.instanceUrl = instanceUrl;
  }

async createRecord(objectName: string, data: Record<string, any>) {
  const response = await this.request.post(
    `${this.instanceUrl}/services/data/v64.0/sobjects/${objectName}`, // note trailing slash
    {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      data, // plain object
    }
  );
  console.log('POST URL:', `${this.instanceUrl}/services/data/v64.0/sobjects/${objectName}`);
console.log('Payload:', JSON.stringify(data, null, 2));

  const body = await response.json();

  if (!response.ok()) {
    console.error('Salesforce API Error:', body);
    throw new Error(`Failed to create ${objectName}: ${response.status()}`);
  }

  return body; // expected: { id: "001...", success: true, errors: [] }
}

  async query(soql: string) {
    const response = await this.request.get(
      `${this.instanceUrl}/services/data/v64.0/query?q=${encodeURIComponent(soql)}`,
      {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const body = await response.json();

    if (!response.ok()) {
      console.error('❌ Query failed:', body);
      throw new Error(`Query failed: ${response.status()}`);
    }

    return body;
  }
}

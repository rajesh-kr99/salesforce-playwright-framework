import { test, expect } from '@playwright/test';

test('Salesforce API query', async ({ request }) => {
  const token = process.env.SALESFORCE_ACCESS_TOKEN!;
  const instanceUrl = process.env.SALESFORCE_API_URL!;

  const response = await request.get(
 `${instanceUrl}/services/data/v64.0/query?q=${encodeURIComponent(
  `SELECT ParentId, Parent.Name, SobjectType, PermissionsRead, PermissionsCreate, PermissionsEdit, PermissionsDelete
   FROM ObjectPermissions
   WHERE ParentId = '0PSgK000007r7z8WAA'`
)}`
,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  expect(response.ok()).toBeTruthy();
  console.log(await response.json());
});

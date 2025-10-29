import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

test('Fetch Profile and Permissions from Salesforce', async ({ request }) => {
  const accessToken = process.env.SALESFORCE_ACCESS_TOKEN!;
  const instanceUrl = process.env.SALESFORCE_URL!; // e.g., https://yourInstance.my.salesforce.com

  // ✅ 1. Get all profiles
  const profileQuery = 'SELECT Id, Name FROM Profile';
  const profilesResponse = await request.get(
    `${instanceUrl}/services/data/v61.0/tooling/query/?q=${encodeURIComponent(profileQuery)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  expect(profilesResponse.ok()).toBeTruthy();
  
  const profilesData = await profilesResponse.json();
  console.log('Profiles:', profilesData.records.map((p: any) => `${p.Name} (${p.Id})`));

  const profileId = profilesData.records[0].Id; // pick one for demo
  console.log(`Inspecting Profile: ${profilesData.records[0].Name}`);

  // ✅ 2. Get Object Permissions for that profile
  const objPermQuery = `
    SELECT ParentId, SobjectType, PermissionsRead, PermissionsCreate, 
           PermissionsEdit, PermissionsDelete 
    FROM ObjectPermissions 
    WHERE ParentId='${profileId}'
  `;
  const objPermResponse = await request.get(
    `${instanceUrl}/services/data/v61.0/tooling/query/?q=${encodeURIComponent(objPermQuery)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

const objPermData = await objPermResponse.json();
console.log('Raw Object Permission response:', JSON.stringify(objPermData, null, 2));


  // ✅ 3. Get Field Permissions for that profile
  const fieldPermQuery = `
    SELECT ParentId, Field, PermissionsRead, PermissionsEdit 
    FROM FieldPermissions 
    WHERE ParentId='${profileId}'
  `;
  const fieldPermResponse = await request.get(
    `${instanceUrl}/services/data/v61.0/tooling/query/?q=${encodeURIComponent(fieldPermQuery)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  const fieldPermData = await fieldPermResponse.json();
  console.log('Field Permissions (sample):', fieldPermData.records.slice(0, 10));
});


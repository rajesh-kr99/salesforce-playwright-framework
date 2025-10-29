import { test, expect } from '../../fixtures/apiFixtures';
import fs from 'fs';
import path from 'path';
import { sortRecordsById } from '../../utils/sortHelper';
import { FIELD_PERMISSIONS_QUERY } from '../../utils/soqlQueries';
import type { FieldPermissionData } from '../../utils/types';

test('Salesforce API query and save baseline', async ({ salesforce }) => {
  const data: FieldPermissionData = await salesforce.query(FIELD_PERMISSIONS_QUERY);

  // Sort records before saving
  const sortedData = sortRecordsById(data);

  const baselinePath = path.join(__dirname, '../../data/baselineFieldPermissions.json');

  fs.writeFileSync(baselinePath, JSON.stringify(sortedData, null, 2), { encoding: 'utf8' });

  console.log(`✅ Baseline saved to ${baselinePath}`);

  expect(data.records.length).toBeGreaterThan(0);
});

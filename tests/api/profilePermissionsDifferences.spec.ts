import { test, expect } from '../../fixtures/apiFixtures';
import fs from 'fs';
import path from 'path';
import { sortRecordsById } from '../../utils/sortHelper';
import { FIELD_PERMISSIONS_QUERY } from '../../utils/soqlQueries';
import type { FieldPermissionData } from '../../utils/types';

test('Compare Salesforce FieldPermissions response with baseline', async ({ salesforce }) => {
  // 1️⃣ Execute query
  const currentData: FieldPermissionData = await salesforce.query(FIELD_PERMISSIONS_QUERY);

  // 2️⃣ Sort records for consistency
  const sortedCurrent = sortRecordsById(currentData);

  // 3️⃣ Load baseline
  const baselinePath = path.join(__dirname, '../../data/baselineFieldPermissions.json');
  if (!fs.existsSync(baselinePath)) {
    fs.writeFileSync(baselinePath, JSON.stringify(sortedCurrent, null, 2));
    console.log('Baseline created:', baselinePath);
    return;
  }
  const baselineData: FieldPermissionData = JSON.parse(fs.readFileSync(baselinePath, 'utf-8'));

  // 4️⃣ Compare
  const differences = findDifferences(baselineData, sortedCurrent);

  // 5️⃣ Custom logging
  if (differences.length > 0) {
    console.log('\n❌ Differences found between baseline and current response:');
    differences.forEach(diff => console.log('•', diff));

    // Instead of letting Playwright throw full stack trace, fail manually
    throw new Error(`There are ${differences.length} difference(s) vs baseline. Check logs above.`);
  }

  console.log('\n✅ No differences found. Responses match baseline.');
});

/**
 * Deep comparison utility
 */
function findDifferences(obj1: any, obj2: any, pathPrefix = ''): string[] {
  const diffs: string[] = [];

  for (const key in obj1) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (!(key in obj2)) {
      diffs.push(`Missing key in current response: ${fullPath}`);
      continue;
    }
    if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      diffs.push(...findDifferences(obj1[key], obj2[key], fullPath));
    } else if (obj1[key] !== obj2[key]) {
      diffs.push(`Value mismatch at ${fullPath}: expected "${obj1[key]}", got "${obj2[key]}"`);
    }
  }

  for (const key in obj2) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (!(key in obj1)) {
      diffs.push(`Extra key in current response: ${fullPath}`);
    }
  }

  return diffs;
}

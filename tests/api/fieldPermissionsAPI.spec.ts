import { test, expect } from '../../fixtures/apiFixtures';
import fs from 'fs';
import path from 'path';
import { sortRecordsById } from '../../utils/sortHelper';
import { FIELD_PERMISSIONS_QUERY } from '../../utils/soqlQueries';
import type { FieldPermissionData } from '../../utils/types';

const BASELINE_PATH = path.join(__dirname, '../../data/baselineFieldPermissions.json');

test.describe('Salesforce Field Permissions API Tests', () => {

  test('Generate baseline - Save current Field Permissions', async ({ salesforce }) => {
    console.log('📊 Querying Salesforce for Field Permissions...');
    
    const data: FieldPermissionData = await salesforce.query(FIELD_PERMISSIONS_QUERY);

    // Sort records for consistent comparison
    const sortedData = sortRecordsById(data);

    // Save baseline
    fs.writeFileSync(BASELINE_PATH, JSON.stringify(sortedData, null, 2), { encoding: 'utf8' });

    console.log(`✅ Baseline saved to: ${BASELINE_PATH}`);
    console.log(`📈 Total records: ${data.records.length}`);

    // Validate query returned data
    expect(data.records.length).toBeGreaterThan(0);
    expect(data).toHaveProperty('totalSize');
    expect(data).toHaveProperty('done', true);
  });

  test('Validate permissions - Compare current vs baseline', async ({ salesforce }) => {
    console.log('📊 Querying Salesforce for current Field Permissions...');
    
    // Execute query
    const currentData: FieldPermissionData = await salesforce.query(FIELD_PERMISSIONS_QUERY);

    // Sort records for consistency
    const sortedCurrent = sortRecordsById(currentData);

    // Check if baseline exists
    if (!fs.existsSync(BASELINE_PATH)) {
      console.warn('⚠️  No baseline found. Creating baseline from current data...');
      fs.writeFileSync(BASELINE_PATH, JSON.stringify(sortedCurrent, null, 2));
      console.log('✅ Baseline created. Re-run this test to compare.');
      test.skip();
      return;
    }

    // Load baseline
    console.log('📂 Loading baseline...');
    const baselineData: FieldPermissionData = JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));

    // Compare
    const differences = findDifferences(baselineData, sortedCurrent);

    // Report results
    if (differences.length > 0) {
      console.log(`\n❌ Found ${differences.length} difference(s) between baseline and current:\n`);
      differences.forEach((diff, index) => {
        console.log(`  ${index + 1}. ${diff}`);
      });
      
      throw new Error(
        `Field Permissions validation failed: ${differences.length} difference(s) detected. ` +
        `This may indicate unauthorized permission changes or environment drift.`
      );
    }

    console.log('\n✅ Validation passed: No differences found');
    console.log(`📊 Compared ${currentData.records.length} Field Permission records`);
    
    expect(differences).toHaveLength(0);
  });

});

/**
 * Deep comparison utility to find differences between two objects
 * @param baseline - The baseline object
 * @param current - The current object to compare
 * @param pathPrefix - Path prefix for nested properties
 * @returns Array of difference descriptions
 */
function findDifferences(baseline: any, current: any, pathPrefix = ''): string[] {
  const diffs: string[] = [];

  // Check for missing keys in current
  for (const key in baseline) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    
    if (!(key in current)) {
      diffs.push(`Missing in current: ${fullPath}`);
      continue;
    }

    // Recursively compare objects
    if (typeof baseline[key] === 'object' && baseline[key] !== null) {
      diffs.push(...findDifferences(baseline[key], current[key], fullPath));
    } else if (baseline[key] !== current[key]) {
      diffs.push(
        `Value changed at ${fullPath}: ` +
        `baseline="${baseline[key]}" → current="${current[key]}"`
      );
    }
  }

  // Check for extra keys in current
  for (const key in current) {
    const fullPath = pathPrefix ? `${pathPrefix}.${key}` : key;
    if (!(key in baseline)) {
      diffs.push(`New field in current: ${fullPath}`);
    }
  }

  return diffs;
}

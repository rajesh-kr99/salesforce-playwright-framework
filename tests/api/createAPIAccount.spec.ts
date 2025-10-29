import { test, expect } from '../../fixtures/apiFixtures';
import accountDataArray from '../../data/accountCreationData.json';
import type { AccountData } from '../../utils/types';

test('Create multiple Salesforce Accounts via API', async ({ salesforce }) => {
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

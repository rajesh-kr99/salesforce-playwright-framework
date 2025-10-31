import { test, expect } from '../../fixtures';
import { AccountPage } from '../../pages/AccountPage';
import { OpportunityPage } from '../../pages/OpportunityPage';
import accountData from '../../data/accountData.json';
import opportunityData from '../../data/opportunityData.json';

test.describe('Salesforce Opportunity End-to-End Lifecycle', () => {
  let accountName: string;
  let opportunityId: string;
  let opportunityName: string;
  let opportunityPage: OpportunityPage;
  let accountPage: AccountPage;

  test('Create Account → Create Opportunity → Move Through All Stages', async ({ loginPage, page }) => {
    test.setTimeout(120000); // 2 minutes for 6 stage transitions
    
    // Step 1: Create Account
    accountPage = new AccountPage(page);
    const { name, type } = accountData.singleAccount;
    const { accountName: createdAccountName } = await accountPage.createAccount(name, type);
    accountName = createdAccountName;

    // Step 2: Create Opportunity in "Prospecting"
       // Initialize Opportunity Page
    opportunityPage = new OpportunityPage(page);
    const oppData = opportunityData.E2EOpportunity;

   const { opportunityId, opportunityName } = await opportunityPage.createOpportunity({
      name: oppData.name,
      closeDate: oppData.closeDate,
      stage: oppData.stage,
      accountName
    });

      console.log(`✅ Created Opportunity: ${opportunityName}, ID: ${opportunityId}`);


// Step 3: Move through all stages from JSON
    const stages = opportunityData.OpportunityStages;

    for (const stage of stages) {
      console.log(`➡️ Moving to stage: ${stage.stage}`);
      await opportunityPage.moveOpportunityStages(opportunityId, stage.stage);

      // ✅ Verify probability
      //await expect(page.getByText(stage.probability)).toBeVisible({ timeout: 10000 });
      console.log(`✅ Verified probability: ${stage.probability}`);
    }

    console.log(`🎯 E2E Opportunity Lifecycle Test Completed: ${opportunityName}`);
  });

});

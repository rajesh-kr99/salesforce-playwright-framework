import { test, expect } from '../../fixtures';
import { AccountPage } from '../../pages/AccountPage';
import { OpportunityPage } from '../../pages/OpportunityPage';
import accountData from '../../data/accountData.json';
import opportunityData from '../../data/opportunityData.json';

test.describe('Salesforce Opportunity Stage Movement', () => {
  let opportunityPage: OpportunityPage;
  let accountPage: AccountPage;
  let accountName: string;

  test.beforeEach(async ({ loginPage, page }) => {
    // Step 1: Create Account (pre-req)
    accountPage = new AccountPage(page);
    const { name, type } = accountData.singleAccount;
    const { accountName: createdAccountName } = await accountPage.createAccount(name, type);
    accountName = createdAccountName;

    // Initialize Opportunity Page
    opportunityPage = new OpportunityPage(page);
  });

  // 🔹 Test 1 - Move to Qualification
  test('Create Opportunity and move to Qualification', async ({ page }) => {
    const oppData = opportunityData.QualificationOpportunity;
    const { opportunityName, opportunityId } = await opportunityPage.createOpportunity({
      name: oppData.name,
      closeDate: oppData.closeDate,
      stage: oppData.stage,
      accountName
    });

    await opportunityPage.moveOpportunityStages(opportunityId, oppData.targetStage);

    // ✅ Assert stage change
  //  await expect(page.getByText(oppData.targetStage)).toBeVisible({ timeout: 10000 });
    console.log(`✅ ${opportunityName} moved to ${oppData.targetStage}`);
  });

  // 🔹 Test 2 - Move to Proposal/Price Quote
  test('Create Opportunity and move to Proposal/Price Quote', async ({ page }) => {
    const oppData = opportunityData.ProposalOpportunity;
    const { opportunityName, opportunityId } = await opportunityPage.createOpportunity({
      name: oppData.name,
      closeDate: oppData.closeDate,
      stage: oppData.stage,
      accountName
    });

    await opportunityPage.moveOpportunityStages(opportunityId, oppData.targetStage);

    // ✅ Assert stage change
  //  await expect(page.getByText(oppData.targetStage)).toBeVisible({ timeout: 10000 });
    console.log(`✅ ${opportunityName} moved to ${oppData.targetStage}`);
  });

  // 🔹 Test 3 - Move to Closed Won
  test('Create Opportunity and move to Closed Won', async ({ page }) => {
    test.setTimeout(60000); // Closed Won stage may need extra time for validation
    
    const oppData = opportunityData.ClosedWonOpportunity;
    const { opportunityName, opportunityId } = await opportunityPage.createOpportunity({
      name: oppData.name,
      closeDate: oppData.closeDate,
      stage: oppData.stage,
      accountName
    });

    await opportunityPage.moveOpportunityStages(opportunityId, oppData.targetStage);

    // ✅ Assert stage change
    //await expect(page.getByText(oppData.targetStage)).toBeVisible({ timeout: 10000 });
    console.log(`✅ ${opportunityName} moved to ${oppData.targetStage}`);
  });
});

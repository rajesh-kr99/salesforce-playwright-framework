import { Page, Locator, expect } from '@playwright/test';
import { waitForRecordUrl } from '../utils/waitHelpers';
import { extractSalesforceId } from '../utils/idExtractionHelpers';

type OpportunityData = {
  name: string;
  closeDate: string;
  stage: string;
  accountName: string;
};
type StageData = {
  stage: string;
  probability: string;
};

export class OpportunityPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly opportunityNameInput: Locator;
  readonly accountLookupInput: Locator;
  readonly stageDropdown: Locator;
  readonly closeDateInput: Locator;
  readonly saveButton: Locator;
  readonly stageValue: Locator;
  readonly detailsTab: Locator;
  readonly saveEditButton: Locator;
  readonly showMoreOptionsButton: Locator;
  readonly menuItemEdit: Locator;
  //readonly editSelectStage: Locator;
  readonly editSave: Locator;
  readonly editSelect: Locator;
   
 

  constructor(page: Page) {
    this.page = page;

    // Locators
    this.newButton = page.getByRole('button', { name: 'New' });
    this.opportunityNameInput = page.getByRole('textbox', { name: 'Opportunity Name' });
    this.accountLookupInput = page.getByRole('combobox', { name: 'Account Name' });
    this.stageDropdown = page.getByRole('combobox', { name: 'Stage' });
    this.closeDateInput = page.getByRole('textbox', { name: '*Close Date' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.stageValue = page.getByLabel('New Opportunity');
    this.detailsTab = page.getByRole('tab', { name: 'Details' });
    this.saveEditButton = page.getByRole('button', { name: 'Save', exact: true });
    this.showMoreOptionsButton = page.getByRole('button', { name: 'Show more actions' });
    this.menuItemEdit = page.getByRole('menuitem', { name: 'Edit' });
    //this.editSelectStage = page.getByLabel('Edit Automation');
    this.editSelect = page.getByLabel('Edit');
    this.editSave = page.getByRole('button', { name: 'Save', exact: true });
  }


  async navigateToOpportunities() {
    const oppUrl = process.env.SALESFORCE_OPPORTUNITIES_URL!;
    await this.page.goto(oppUrl, { waitUntil: 'domcontentloaded' });
  }

  async createOpportunity({name, closeDate, stage, accountName}: OpportunityData) {
    await this.navigateToOpportunities();

    // Use timestamp to keep name unique per run
    const oppName = `${name}_${Date.now()}`;

    await this.newButton.click();
    await this.opportunityNameInput.fill(oppName);

    await this.accountLookupInput.dblclick();
    await this.page.getByText(accountName).isVisible();
    await this.page.getByText(accountName).click();

    await this.closeDateInput.click();
    await this.closeDateInput.fill(closeDate);

    await this.stageDropdown.click();
    await this.stageValue.getByText(stage).click();
  
    await this.saveButton.click();

    // Verify success
    await expect(this.page.getByText('was created')).toBeVisible({ timeout: 10000 });

   // Wait for navigation and capture the new record URL
   
     await waitForRecordUrl(this.page, 10000);
   
     // ✅ Extract and return the record ID
     const opportunityId = await extractSalesforceId(this.page, 'Opportunity', 10000);
   
  if (!opportunityId) {
    throw new Error('❌ Unable to extract Opportunity ID from URL');
  }

  console.log(`✅ Created Opportunity: ${oppName}, ID: ${opportunityId}`);

  // Step 5: Return both name and ID for downstream use
  return { opportunityName: oppName, opportunityId };

  }

  
   // Reusable method to move an Opportunity through stages
  async moveOpportunityStages(oppId: string, targetStage: string) {
  const baseOppRUrl = process.env.SALESFORCE_OPPORTUNITIES_R_URL!;

  await this.page.goto(`${baseOppRUrl}${oppId}/view`, { waitUntil: 'domcontentloaded' });


  console.log(`🚀 Starting stage movement for: ${oppId}`);

  //for (const targetStage of targetStage) {
  console.log(`→ Moving to stage: ${targetStage}`);

  await this.detailsTab.click();
  await this.showMoreOptionsButton.click();
  await this.menuItemEdit.click();

  await this.stageDropdown.click();
  
  //await this.editSelectStage.getByText(targetStage).click();
  //await this.editSelect.getByText(targetStage, { exact: true })
  await this.page.getByRole('option', { name: targetStage, exact: true }).click();
  
  await this.editSave.click();

    //await expect(this.page.getByText(targetStage)).toBeVisible({ timeout: 10000 });
  console.log(`✅ Successfully moved to: ${targetStage}`);

  //}
}}
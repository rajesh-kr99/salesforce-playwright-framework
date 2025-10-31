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

    // Account lookup with retry mechanism (similar to ContactPage)
    let accountSelected = false;
    const maxAttempts = 3;
    
    for (let attempt = 1; attempt <= maxAttempts && !accountSelected; attempt++) {
      try {
        if (attempt > 1) {
          console.log(`🔄 Retrying account lookup (attempt ${attempt}/${maxAttempts})...`);
          await this.accountLookupInput.click();
          await this.accountLookupInput.clear();
        }
        
        await this.accountLookupInput.click();
        await this.accountLookupInput.fill(accountName);
        
        // Wait for dropdown results to appear
        await this.page.waitForTimeout(1500);
        
        // Wait for dropdown options to be visible
        await this.page.waitForSelector(`text=${accountName}`, { timeout: 8000 });
        
        // Click the account from dropdown
        await this.page.getByText(accountName, { exact: true }).click();
        
        // Press Tab to commit the selection
        await this.page.keyboard.press('Tab');
        await this.page.waitForTimeout(500);
        
        accountSelected = true;
        console.log(`✅ Account selected on attempt ${attempt}`);
      } catch (error) {
        if (attempt === maxAttempts) {
          throw new Error(`❌ Failed to select account '${accountName}' after ${maxAttempts} attempts: ${error}`);
        }
        console.log(`⚠️  Attempt ${attempt} failed, retrying...`);
        await this.page.waitForTimeout(1000);
      }
    }

    await this.closeDateInput.click();
    await this.closeDateInput.fill(closeDate);

    await this.stageDropdown.click();
    await this.stageValue.getByText(stage).click();
  
    await this.saveButton.click();

    // Verify success - use .first() to avoid strict mode violation
    await expect(this.page.getByText('was created').first()).toBeVisible({ timeout: 10000 });

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

  // Navigate to the opportunity record (only if not already on it)
  const currentUrl = this.page.url();
  if (!currentUrl.includes(oppId)) {
    await this.page.goto(`${baseOppRUrl}${oppId}/view`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1500); // Wait for page to stabilize
  }

  console.log(`🚀 Starting stage movement for: ${oppId}`);
  console.log(`→ Moving to stage: ${targetStage}`);

  // Click Details tab and wait for it to be active
  await this.detailsTab.click();
  await this.page.waitForTimeout(500);
  
  // Open edit menu
  await this.showMoreOptionsButton.click();
  await this.page.waitForTimeout(300);
  await this.menuItemEdit.click();
  
  // Wait for edit dialog to open
  await this.page.waitForTimeout(1500);

  // Click stage dropdown
  await this.stageDropdown.click();
  await this.page.waitForTimeout(800);
  
  // Select the target stage - filter to combobox options (not path indicator)
  // Use .last() to get the combobox dropdown option (path indicator is .first())
  await this.page.getByRole('option', { name: targetStage, exact: true }).last().click();
  
  // Save and wait for save to complete
  await this.editSave.click();
  
  // Wait for save to complete and page to refresh
  await this.page.waitForTimeout(2000);

  console.log(`✅ Successfully moved to: ${targetStage}`);
}}
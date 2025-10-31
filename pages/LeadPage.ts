import { Page, Locator, expect } from '@playwright/test';
//import { waitForRecordUrl } from '../utils/waitHelpers';
import { extractSalesforceId } from '../utils/idExtractionHelpers';
import {
  waitForLightningLoad,
  waitForRecordUrl,
  expectTextVisible,
  waitForLocatorVisible,
  retry
} from '../utils/waitHelpers';

type LeadData = {
  firstName: string;
  lastName: string;
  company: string;
  status: string;
  leadSource: string;
};

export class LeadPage {
  readonly page: Page;
  readonly newButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly companyInput: Locator;
  readonly statusDropdown: Locator;
  readonly leadSourceDropdown: Locator;
  readonly saveButton: Locator;
  readonly convertButton: Locator;
  readonly convertConfirmButton: Locator;
  readonly showMoreActionsButton: Locator;
  readonly confirmAndCloseButton: Locator;
  readonly menuItemEditButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newButton = page.getByRole('button', { name: 'New' });
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.companyInput = page.getByRole('textbox', { name: 'Company' });
    this.statusDropdown = page.getByRole('combobox', { name: 'Lead Status' });
    this.leadSourceDropdown = page.getByRole('combobox', { name: 'Lead Source' });
    this.saveButton = page.getByRole('button', { name: 'Save', exact: true });
    this.showMoreActionsButton = page.getByRole('button', { name: 'Show more actions' });
    this.convertButton = page.getByRole('menuitem', { name: 'Convert' });
    this.convertConfirmButton = page.getByRole('button', { name: 'Convert', exact: true });
    this.confirmAndCloseButton = page.getByRole('button', { name: 'Cancel and close', exact: true });
    this.menuItemEditButton = page.getByRole('menuitem', { name: 'Edit' });
  }

  async navigateToLeads() {
    const leadsUrl = process.env.SALESFORCE_LEADS_URL!;
    await this.page.goto(leadsUrl, { waitUntil: 'domcontentloaded' });
    await waitForLightningLoad(this.page);
  }

  async createLead(data: LeadData) {
    await this.navigateToLeads();

    const uniqueLastName = `${data.lastName}_${Date.now()}`;

    await this.newButton.click();
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(uniqueLastName);
    await this.companyInput.fill(data.company);

    await this.statusDropdown.click();
    await this.page.waitForTimeout(500); // Wait for dropdown to populate
    await this.page.getByRole('option', { name: data.status, exact: true }).click();

    await this.leadSourceDropdown.click();
    await this.page.waitForTimeout(500); // Wait for dropdown to populate
    await this.page.getByRole('option', { name: data.leadSource, exact: true }).click();

    await this.saveButton.click();

    // Wait for success and record URL
    await expectTextVisible(this.page, 'was created', 15000);
    await waitForRecordUrl(this.page, 15000);

    const leadId = await extractSalesforceId(this.page, 'Lead', 15000);
    if (!leadId) throw new Error('❌ Unable to extract Lead ID');

    console.log(`✅ Created Lead: ${data.firstName} ${uniqueLastName} (${leadId})`);
    return { leadId, leadName: `${data.firstName} ${uniqueLastName}` };
  }

  async convertLead(leadId: string) {
    const baseLeadUrl = process.env.SALESFORCE_LEADS_R_URL!;
    await this.page.goto(`${baseLeadUrl}${leadId}/view`, { waitUntil: 'domcontentloaded' });
    await this.page.waitForTimeout(1000);

    await this.showMoreActionsButton.click();
    await this.page.waitForTimeout(300);
    await this.convertButton.click();
    await this.page.waitForTimeout(1000);
    await this.convertConfirmButton.click();
    await this.page.waitForTimeout(500);
    await this.confirmAndCloseButton.click();

    await expectTextVisible(this.page, 'Your lead has been converted', 60000);

    await this.page.getByRole('button', { name: 'Cancel and close', exact: true }).first().click();
    console.log(`✅ Lead ${leadId} successfully converted.`);
  }

  async validateLead(leadId: string, expectedStatus: string) {
    const baseLeadUrl = process.env.SALESFORCE_LEADS_R_URL!;
    await this.page.goto(`${baseLeadUrl}${leadId}/view`, { waitUntil: 'domcontentloaded' });
    await expect(this.page.getByText(expectedStatus)).toBeVisible({ timeout: 10000 });
    console.log(`✅ Lead ${leadId} validated with status: ${expectedStatus}`);
  }

  async moveThroughStatuses(leadId: string, statuses: string[]) {
    const baseLeadUrl = process.env.SALESFORCE_LEADS_R_URL!;

    for (const status of statuses) {
      await this.page.goto(`${baseLeadUrl}${leadId}/view`, { waitUntil: 'domcontentloaded' });
      await waitForLightningLoad(this.page);

      await this.showMoreActionsButton.click();
      await this.page.waitForTimeout(300);
      await this.menuItemEditButton.click();
      await this.page.waitForTimeout(1000);

      await this.statusDropdown.click();
      await this.page.waitForTimeout(500);
      await this.page.getByRole('option', { name: status, exact: true }).click();

      await this.saveButton.click();
      await expectTextVisible(this.page, status, 15000);
      console.log(`✅ Moved Lead ${leadId} to ${status}`);
    }
  }
}

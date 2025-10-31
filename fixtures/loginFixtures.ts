// fixtures/loginFixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const STORAGE_STATE_PATH = 'auth.json';

type MyFixtures = {
  loginPage: LoginPage;
};

/**
 * Check if the current page is a login page (session expired)
 */
async function isLoginPageDisplayed(page: any): Promise<boolean> {
  try {
    // First, check if we're already on a Salesforce app page (positive indicator of valid session)
    const currentUrl = page.url();
    const isOnSalesforceApp = currentUrl.includes('lightning') || 
                              currentUrl.includes('/home') ||
                              currentUrl.includes('/setup') ||
                              currentUrl.includes('/one/one.app');
    
    if (isOnSalesforceApp) {
      // We're clearly logged in if we're on any Salesforce app page
      return false;
    }

    // Only if we're NOT on a Salesforce app page, check for login elements
    const loginIndicators = [
      page.getByLabel('Username'),
      page.getByLabel('Password'),
      page.locator('#username'), // Salesforce login page ID
    ];

    // ALL indicators must be visible to confirm it's truly a login page (reduce false positives)
    let visibleCount = 0;
    for (const indicator of loginIndicators) {
      const isVisible = await indicator.isVisible({ timeout: 1000 }).catch(() => false);
      if (isVisible) {
        visibleCount++;
      }
    }
    
    // Return true only if we see at least 2 login indicators (username field + one other)
    return visibleCount >= 2;
  } catch {
    return false;
  }
}

/**
 * Perform fresh login and save session
 */
async function performFreshLogin(page: any, context: any, loginPage: LoginPage) {
  console.log('🔐 Performing fresh login...');
  console.log('⚠️  Session expired or invalid - Manual authentication required');
  console.log('ℹ️  The test will pause after entering credentials for OTP/2FA');
  
  await loginPage.login(
    process.env.SALESFORCE_URL!,
    process.env.SALESFORCE_USERNAME!,
    process.env.SALESFORCE_PASSWORD!
  );

  // Wait for page to process after clicking login
  await page.waitForTimeout(3000);

  // Check current state - are we logged in or need OTP?
  const currentUrl = page.url();
  const isLoggedIn = currentUrl.includes('lightning') || 
                     currentUrl.includes('home') || 
                     currentUrl.includes('setup');
  
  if (!isLoggedIn) {
    // Not logged in yet - likely on OTP/verification page
    console.log('🔐 Waiting for OTP/2FA verification...');
    console.log('📱 Please enter the OTP code sent to your device');
    console.log('⏸️  Test will pause now - Complete login and press Resume in Playwright Inspector');
    
    // Always pause for manual OTP entry
    await page.pause();
    
    // After resume, wait for successful login
    await page.waitForTimeout(2000);
    
    // Verify we're now logged in
    const finalUrl = page.url();
    if (!finalUrl.includes('lightning') && !finalUrl.includes('home')) {
      throw new Error('❌ Login failed - Not on Salesforce home page after resume');
    }
  }

  console.log('✅ Login completed successfully');
  
  // Wait a bit more to ensure page is fully loaded
  await page.waitForTimeout(2000);

  // Save the new session
  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log('✅ New session saved to auth.json');
  console.log('ℹ️  Future test runs will use this session until it expires');
}

export const test = base.extend<MyFixtures>({
  loginPage: async ({ page, context }, use) => {
    const loginPage = new LoginPage(page);
    let sessionValid = false;

    // Check if auth.json exists
    if (fs.existsSync(STORAGE_STATE_PATH)) {
      console.log('📂 Found existing auth.json, validating session...');
      
      try {
        // Load existing session
        const storageState = JSON.parse(fs.readFileSync(STORAGE_STATE_PATH, 'utf-8'));
        await context.addCookies(storageState.cookies);
        await page.goto(process.env.SALESFORCE_URL!, { waitUntil: 'domcontentloaded' });
        
        // Wait a bit for page to load
        await page.waitForTimeout(2000);
        
        // Check if we're still on login page (session expired)
        const isLoginPage = await isLoginPageDisplayed(page);
        
        if (isLoginPage) {
          console.log('❌ Session has expired, re-authentication required');
          console.log('🗑️  Removing expired auth.json...');
          fs.unlinkSync(STORAGE_STATE_PATH);
          sessionValid = false;
        } else {
          console.log('✅ Session is still valid, using existing authentication');
          sessionValid = true;
        }
      } catch (error) {
        console.log('⚠️  Error validating session, will re-authenticate');
        if (fs.existsSync(STORAGE_STATE_PATH)) {
          fs.unlinkSync(STORAGE_STATE_PATH);
        }
        sessionValid = false;
      }
    } else {
      console.log('📂 No existing session found, fresh login required');
    }

    // If no valid session, perform fresh login
    if (!sessionValid) {
      try {
        await performFreshLogin(page, context, loginPage);
        
        // Verify login was successful
        const stillOnLoginPage = await isLoginPageDisplayed(page);
        if (stillOnLoginPage) {
          throw new Error('❌ Login failed - still on login page after authentication attempt');
        }
      } catch (error) {
        console.error('❌ Authentication failed:', error);
        throw new Error('Authentication required but failed. Please ensure credentials are correct and OTP is provided if needed.');
      }
    }

    await use(loginPage);
  },
});

export { expect } from '@playwright/test';

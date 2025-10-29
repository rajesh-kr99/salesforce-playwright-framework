import { Page, Locator, expect } from '@playwright/test';


export class LoginPage {
  readonly page: Page;
  readonly userNameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userNameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Log In' });
  }

//UI Login
  async login(url: string, username: string, password: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    await this.userNameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    
    
    
  }



}


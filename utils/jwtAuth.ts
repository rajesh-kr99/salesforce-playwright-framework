import jwt from 'jsonwebtoken';
import { request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

interface JWTAuthConfig {
  clientId: string;
  username: string;
  privateKey: string;
  loginUrl: string;
}

interface TokenResponse {
  access_token: string;
  instance_url: string;
  id: string;
  token_type: string;
  issued_at: string;
  signature: string;
}

/**
 * Authenticate with Salesforce using JWT Bearer Token Flow
 * @param config JWT configuration
 * @returns Access token and instance URL
 */
export async function authenticateWithJWT(config: JWTAuthConfig): Promise<TokenResponse> {
  // Create JWT assertion
  const jwtPayload = {
    iss: config.clientId,
    sub: config.username,
    aud: config.loginUrl,
    exp: Math.floor(Date.now() / 1000) + 300, // 5 minutes from now
  };

  // Sign the JWT with the private key
  const assertion = jwt.sign(jwtPayload, config.privateKey, {
    algorithm: 'RS256',
  });

  // Make token request
  const apiContext = await request.newContext();
  const tokenUrl = `${config.loginUrl}/services/oauth2/token`;

  const response = await apiContext.post(tokenUrl, {
    form: {
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertion,
    },
  });

  if (!response.ok()) {
    const errorBody = await response.text();
    throw new Error(`JWT Authentication failed: ${response.status()} - ${errorBody}`);
  }

  const tokenResponse: TokenResponse = await response.json();
  
  console.log('✅ JWT Authentication successful');
  console.log(`📍 Instance URL: ${tokenResponse.instance_url}`);
  
  await apiContext.dispose();
  return tokenResponse;
}

/**
 * Get JWT authentication configuration from environment variables
 */
export function getJWTConfig(): JWTAuthConfig {
  const clientId = process.env.SALESFORCE_JWT_CLIENT_ID || process.env.SALESFORCE_CLIENT_ID;
  const username = process.env.SALESFORCE_USERNAME;
  const loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com';
  
  // Check for private key in environment variable (for CI/CD)
  let privateKey = process.env.SALESFORCE_PRIVATE_KEY;
  
  // If not in env var, try to read from file (for local development)
  if (!privateKey) {
    const keyPath = path.join(process.cwd(), 'server.key');
    if (fs.existsSync(keyPath)) {
      privateKey = fs.readFileSync(keyPath, 'utf8');
    }
  }
  
  // Convert escaped newlines to actual newlines (for keys stored in GitHub Secrets)
  // GitHub Secrets store multi-line strings with literal \n characters
  if (privateKey) {
    // Replace literal \n with actual newlines
    privateKey = privateKey.replace(/\\n/g, '\n');
    
    // Also handle if the key doesn't have proper BEGIN/END markers
    if (!privateKey.includes('-----BEGIN')) {
      console.error('❌ Private key format error: Missing BEGIN marker');
      console.error('Key preview (first 50 chars):', privateKey.substring(0, 50));
    }
    
    // Debug: Show key format (first and last 50 chars)
    console.log('🔑 Private key loaded, length:', privateKey.length);
    console.log('🔑 Key starts with:', privateKey.substring(0, 50));
    console.log('🔑 Key ends with:', privateKey.substring(privateKey.length - 50));
  }

  if (!clientId || !username || !privateKey) {
    throw new Error(
      'Missing JWT configuration. Required: SALESFORCE_JWT_CLIENT_ID, SALESFORCE_USERNAME, SALESFORCE_PRIVATE_KEY (or server.key file)'
    );
  }

  return {
    clientId,
    username,
    privateKey,
    loginUrl,
  };
}

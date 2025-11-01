import dotenv from 'dotenv';
dotenv.config();

import { authenticateWithJWT, getJWTConfig } from './utils/jwtAuth';

async function testJWT() {
  try {
    console.log('🔐 Testing JWT Authentication...\n');
    
    const config = getJWTConfig();
    console.log(`Client ID: ${config.clientId}`);
    console.log(`Username: ${config.username}`);
    console.log(`Login URL: ${config.loginUrl}`);
    console.log(`Private Key: ${config.privateKey ? '✅ Loaded' : '❌ Missing'}\n`);
    
    const tokenResponse = await authenticateWithJWT(config);
    
    console.log('\n✅ JWT Authentication Successful!');
    console.log(`Access Token: ${tokenResponse.access_token.substring(0, 50)}...`);
    console.log(`Instance URL: ${tokenResponse.instance_url}`);
    console.log(`Token Type: ${tokenResponse.token_type}`);
    
  } catch (error) {
    console.error('\n❌ JWT Authentication Failed:');
    console.error(error);
    process.exit(1);
  }
}

testJWT();

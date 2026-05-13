#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Run this to diagnose your database connection issue
 */

const fs = require('fs');
const path = require('path');

console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║                                                                              ║');
console.log('║                  🔍 Database Connection Diagnostic                          ║');
console.log('║                                                                              ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envContent;

try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (error) {
  console.error('❌ ERROR: Cannot read .env file');
  console.error('   Make sure .env file exists in the project root\n');
  process.exit(1);
}

// Parse DATABASE_URL
const databaseUrlMatch = envContent.match(/DATABASE_URL="([^"]+)"/);
const directUrlMatch = envContent.match(/DIRECT_URL="([^"]+)"/);

if (!databaseUrlMatch) {
  console.error('❌ ERROR: DATABASE_URL not found in .env file\n');
  process.exit(1);
}

const databaseUrl = databaseUrlMatch[1];
const directUrl = directUrlMatch ? directUrlMatch[1] : 'Not found';

console.log('📋 Current Configuration:\n');
console.log('DATABASE_URL:');
console.log(`  ${databaseUrl}\n`);
console.log('DIRECT_URL:');
console.log(`  ${directUrl}\n`);

// Parse connection string
const urlPattern = /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)(\?.*)?/;
const match = databaseUrl.match(urlPattern);

if (!match) {
  console.error('❌ ERROR: Invalid DATABASE_URL format\n');
  console.error('Expected format:');
  console.error('postgresql://USER:PASSWORD@HOST:PORT/DATABASE?params\n');
  process.exit(1);
}

const [, user, password, host, port, database, params] = match;

console.log('🔍 Parsed Connection Details:\n');
console.log(`  User:     ${user}`);
console.log(`  Password: ${password.substring(0, 5)}... (${password.length} chars)`);
console.log(`  Host:     ${host}`);
console.log(`  Port:     ${port}`);
console.log(`  Database: ${database}`);
console.log(`  Params:   ${params || 'none'}\n`);

// Validation checks
console.log('✅ Validation Checks:\n');

let hasErrors = false;

// Check 1: Port number
if (port === '6543') {
  console.log('  ✅ Port 6543 (Transaction Pooler) - Correct');
} else if (port === '5432') {
  console.log('  ⚠️  Port 5432 (Direct Connection) - Should be 6543 for DATABASE_URL');
  console.log('     Use port 6543 for DATABASE_URL (Transaction Pooler)');
  console.log('     Use port 5432 for DIRECT_URL only\n');
  hasErrors = true;
} else {
  console.log(`  ❌ Port ${port} - Invalid port number`);
  console.log('     Should be 6543 for DATABASE_URL\n');
  hasErrors = true;
}

// Check 2: pgbouncer parameter
if (params && params.includes('pgbouncer=true')) {
  console.log('  ✅ pgbouncer=true parameter - Correct');
} else {
  console.log('  ⚠️  Missing pgbouncer=true parameter');
  console.log('     Add ?pgbouncer=true to the end of DATABASE_URL\n');
  hasErrors = true;
}

// Check 3: User format
if (user.startsWith('postgres.')) {
  console.log('  ✅ User format - Correct');
} else {
  console.log('  ⚠️  User format might be incorrect');
  console.log(`     Expected: postgres.PROJECT_ID`);
  console.log(`     Got: ${user}\n`);
  hasErrors = true;
}

// Check 4: Host format
if (host.includes('pooler.supabase.com')) {
  console.log('  ✅ Host format - Correct');
} else {
  console.log('  ⚠️  Host format might be incorrect');
  console.log(`     Expected: aws-0-REGION.pooler.supabase.com`);
  console.log(`     Got: ${host}\n`);
  hasErrors = true;
}

// Check 5: Password encoding
const specialChars = ['@', '#', '$', '%', '&', '+', '=', '?', '/', ':', ' '];
const hasSpecialChars = specialChars.some(char => password.includes(char));
const hasEncodedChars = password.includes('%');

if (hasSpecialChars && !hasEncodedChars) {
  console.log('  ⚠️  Password contains special characters but is not URL-encoded');
  console.log('     Special characters must be URL-encoded:');
  console.log('       @ → %40');
  console.log('       # → %23');
  console.log('       $ → %24');
  console.log('       % → %25');
  console.log('       & → %26\n');
  hasErrors = true;
} else if (hasEncodedChars) {
  console.log('  ✅ Password appears to be URL-encoded');
} else {
  console.log('  ✅ Password has no special characters');
}

console.log('\n');

// Summary
if (hasErrors) {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║   ⚠️  ISSUES FOUND - Your DATABASE_URL needs to be fixed                    ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('🔧 How to Fix:\n');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Click your project: clzkcwjhyjddknyzphgf');
  console.log('3. Click: Settings → Database');
  console.log('4. Copy the EXACT connection string from "Transaction Pooler" tab');
  console.log('5. Make sure it uses port 6543');
  console.log('6. URL-encode your password if it has special characters');
  console.log('7. Update your .env file\n');
  
  console.log('📖 Detailed Guide: QUICK_FIX_NOW.txt\n');
} else {
  console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                              ║');
  console.log('║   ✅ Configuration looks correct!                                           ║');
  console.log('║                                                                              ║');
  console.log('╚══════════════════════════════════════════════════════════════════════════════╝\n');
  
  console.log('If you\'re still getting "Tenant or user not found" error:\n');
  console.log('1. Verify your Supabase project is not paused');
  console.log('2. Check if the password is correct');
  console.log('3. Try resetting your database password in Supabase');
  console.log('4. Make sure you\'re copying from the correct project\n');
  
  console.log('Next Steps:\n');
  console.log('1. Test connection: npx prisma db pull');
  console.log('2. Create tables: npx prisma db push');
  console.log('3. Seed data: npx prisma db seed\n');
}

console.log('═══════════════════════════════════════════════════════════════════════════════\n');

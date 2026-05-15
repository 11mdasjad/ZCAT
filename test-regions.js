const { PrismaClient } = require('@prisma/client');

const regions = [
  "aws-0-ap-south-1.pooler.supabase.com",
  "aws-0-ap-southeast-1.pooler.supabase.com",
  "aws-0-eu-central-1.pooler.supabase.com",
  "aws-0-us-west-1.pooler.supabase.com",
  "aws-0-us-east-2.pooler.supabase.com"
];

async function test(host) {
  const url = `postgresql://postgres.clzkcwjhyjddknyzphgf:Asjad%409934%23@${host}:6543/postgres?pgbouncer=true`;
  const prisma = new PrismaClient({ datasources: { db: { url } } });
  try {
    await prisma.$connect();
    console.log("✅ SUCCESS on region:", host);
    return true;
  } catch (err) {
    if (err.message.includes('Tenant or user not found') || err.message.includes('getaddrinfo ENOTFOUND')) {
      // expected failure
    } else {
      console.log(`❌ Failed on ${host} with different error:`, err.message);
    }
  } finally {
    await prisma.$disconnect();
  }
  return false;
}

async function main() {
  for (const r of regions) {
    console.log("Testing", r);
    const success = await test(r);
    if (success) break;
  }
}
main();

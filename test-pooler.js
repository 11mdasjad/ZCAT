const { PrismaClient } = require('@prisma/client');

async function test(url) {
  const prisma = new PrismaClient({
    datasources: { db: { url } }
  });
  try {
    await prisma.$connect();
    console.log("✅ SUCCESS:", url);
  } catch (err) {
    console.log("❌ FAILED:", url, "->", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await test("postgresql://postgres.clzkcwjhyjddknyzphgf:Asjad%409934%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true");
  await test("postgresql://postgres:Asjad%409934%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true");
  await test("postgresql://postgres:Asjad%409934%23@db.clzkcwjhyjddknyzphgf.supabase.co:5432/postgres");
}

main();

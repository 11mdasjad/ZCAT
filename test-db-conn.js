const { Client } = require('pg');

const urls = [
  "postgresql://postgres.clzkcwjhyjddknyzphgf:Asjad%409934%23@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true",
  "postgresql://postgres:Asjad%409934%23@db.clzkcwjhyjddknyzphgf.supabase.co:5432/postgres",
  "postgresql://postgres.clzkcwjhyjddknyzphgf:Asjad%409934%23@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
];

async function testUrl(url) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    console.log("✅ SUCCESS:", url);
    await client.end();
  } catch (err) {
    console.log("❌ FAILED:", url, "->", err.message);
  }
}

async function main() {
  for (const url of urls) {
    await testUrl(url);
  }
}

main();

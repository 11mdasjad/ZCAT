const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:Asjad%409934%23@db.clzkcwjhyjddknyzphgf.supabase.co:5432/postgres"
    }
  }
});
prisma.question.count().then(console.log).catch(console.error).finally(() => prisma.$disconnect());

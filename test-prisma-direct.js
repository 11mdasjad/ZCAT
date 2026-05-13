const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
});
prisma.question.count().then(console.log).catch(console.error).finally(() => prisma.$disconnect());

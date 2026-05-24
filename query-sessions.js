const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const sessions = await prisma.examSession.findMany({
      include: {
        user: true,
        assessment: true,
        violations: true,
        snapshots: true,
      }
    });
    console.log("Total Exam Sessions in DB:", sessions.length);
    if (sessions.length > 0) {
      console.log("Sessions details:");
      sessions.forEach(s => {
        console.log(`- ID: ${s.id}, User: ${s.user?.name}, Assessment: ${s.assessment?.title}, Status: ${s.status}, Violations: ${s.violations?.length}, Snapshots: ${s.snapshots?.length}`);
        if (s.snapshots && s.snapshots.length > 0) {
          console.log("  Snapshots URLs:", s.snapshots.map(sn => sn.imageUrl));
        }
      });
    }

    const snaps = await prisma.proctoringSnapshot.findMany();
    console.log("Total Proctoring Snapshots in DB:", snaps.length);
    if (snaps.length > 0) {
      console.log("Snapshots Details:", snaps);
    }
  } catch (err) {
    console.error("Prisma query failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

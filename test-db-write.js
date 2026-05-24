const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Checking users in database...");
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);

    console.log("Finding first user...");
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log("❌ No user found in database!");
      return;
    }
    console.log("Found User ID:", user.id, "Email:", user.email);

    console.log("Creating dummy InterviewSession...");
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        title: "Test Job Role",
        duration: 15,
        transcript: "",
      }
    });
    console.log("✅ Created session:", session.id);

    console.log("Creating dummy InterviewQuestion...");
    const question = await prisma.interviewQuestion.create({
      data: {
        sessionId: session.id,
        question: "Test question?",
        category: "Technical",
        order: 1,
      }
    });
    console.log("✅ Created question:", question.id);

    console.log("Creating dummy InterviewResponse...");
    const response = await prisma.interviewResponse.create({
      data: {
        sessionId: session.id,
        questionId: question.id,
        response: "Test candidate answer.",
        score: 8.5,
        feedback: "Clear and direct.",
      }
    });
    console.log("✅ Created response:", response.id);

    console.log("All DB writes succeeded successfully!");
  } catch (err) {
    console.error("❌ Prisma DB write failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();

import { PrismaClient, Difficulty } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface LeetCodeQuestion {
  title: string;
  slug: string;
  difficulty: string;
  description: string;
  examples: string[];
  constraints: string[];
  tags: string[];
  leetcodeNumber: number;
  timeLimit: number;
  memoryLimit: number;
  sourceFile: string;
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Load questions from JSON
  const questionsPath = path.join(__dirname, '../scripts/leetcode-questions.json');
  const questionsData: LeetCodeQuestion[] = JSON.parse(
    fs.readFileSync(questionsPath, 'utf-8')
  );

  console.log(`📚 Found ${questionsData.length} questions to seed\n`);

  // Create default test cases for each question
  const defaultTestCases = [
    {
      input: '[]',
      expectedOutput: '[]',
      isHidden: false,
      explanation: 'Sample test case',
    },
  ];

  let successCount = 0;
  let errorCount = 0;

  for (const [index, questionData] of questionsData.entries()) {
    try {
      // Map difficulty string to enum
      const difficulty = questionData.difficulty as Difficulty;

      // Create question with test cases
      const question = await prisma.question.create({
        data: {
          title: questionData.title,
          slug: questionData.slug,
          difficulty,
          description: questionData.description,
          examples: questionData.examples,
          constraints: questionData.constraints,
          tags: questionData.tags,
          timeLimit: questionData.timeLimit,
          memoryLimit: questionData.memoryLimit,
          isActive: true,
          testCases: {
            create: defaultTestCases.map((tc, idx) => ({
              input: tc.input,
              expectedOutput: tc.expectedOutput,
              isHidden: tc.isHidden,
              explanation: tc.explanation,
              orderIndex: idx,
            })),
          },
        },
        include: {
          testCases: true,
        },
      });

      successCount++;
      console.log(
        `✅ [${index + 1}/${questionsData.length}] Created: ${question.title} (${question.difficulty})`
      );
    } catch (error) {
      errorCount++;
      console.error(
        `❌ [${index + 1}/${questionsData.length}] Failed: ${questionData.title}`,
        error
      );
    }
  }

  console.log('\n📊 Seed Summary:');
  console.log(`  ✅ Success: ${successCount} questions`);
  console.log(`  ❌ Errors: ${errorCount} questions`);
  console.log(`  📝 Total: ${questionsData.length} questions\n`);

  // Print difficulty distribution
  const stats = await prisma.question.groupBy({
    by: ['difficulty'],
    _count: true,
  });

  console.log('📈 Difficulty Distribution:');
  stats.forEach((stat) => {
    console.log(`  ${stat.difficulty}: ${stat._count} questions`);
  });

  console.log('\n✨ Database seed completed!\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

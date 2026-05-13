#!/bin/bash

# ZCAT - LeetCode Questions Setup Script
# This script sets up the database and seeds all 203 LeetCode questions

set -e  # Exit on error

echo "🚀 ZCAT LeetCode Questions Setup"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0.32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please create .env file with DATABASE_URL and DIRECT_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo -e "${RED}❌ Error: DATABASE_URL not found in .env${NC}"
    exit 1
fi

# Check if questions JSON exists
if [ ! -f scripts/leetcode-questions.json ]; then
    echo -e "${RED}❌ Error: scripts/leetcode-questions.json not found${NC}"
    echo "Please run: python3 scripts/parse-leetcode-pdfs.py"
    exit 1
fi

echo -e "${BLUE}📦 Step 1: Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"
echo ""

echo -e "${BLUE}📊 Step 2: Pushing database schema...${NC}"
npx prisma db push --skip-generate
echo -e "${GREEN}✅ Database schema updated${NC}"
echo ""

echo -e "${BLUE}🌱 Step 3: Seeding database with 203 questions...${NC}"
npm run prisma:seed
echo -e "${GREEN}✅ Database seeded successfully${NC}"
echo ""

echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Start the development server: npm run dev"
echo "  2. Visit: http://localhost:3001/candidate/challenges"
echo "  3. Browse and solve 203 LeetCode questions!"
echo ""
echo "📊 Question Distribution:"
echo "  • Easy: 47 questions"
echo "  • Medium: 123 questions"
echo "  • Hard: 33 questions"
echo "  • Total: 203 questions"
echo ""

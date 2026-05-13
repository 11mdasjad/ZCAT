#!/usr/bin/env python3
"""
Parse LeetCode PDF files and extract question data for database seeding.
Generates a JSON file with all question details.
"""

import os
import json
import re
from pathlib import Path
import PyPDF2

def extract_text_from_pdf(pdf_path):
    """Extract text content from PDF file."""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return ""

def parse_difficulty(text):
    """Extract difficulty level from text."""
    text_lower = text.lower()
    if 'easy' in text_lower:
        return 'EASY'
    elif 'medium' in text_lower:
        return 'MEDIUM'
    elif 'hard' in text_lower:
        return 'HARD'
    return 'MEDIUM'  # Default

def parse_question_number(filename):
    """Try to extract question number from filename or content."""
    # Some filenames might have numbers
    match = re.search(r'(\d+)', filename)
    if match:
        return int(match.group(1))
    return None

def clean_title(filename):
    """Extract clean title from filename."""
    # Remove " - LeetCode.pdf" suffix
    title = filename.replace(' - LeetCode.pdf', '')
    return title.strip()

def parse_question_data(pdf_path, index):
    """Parse a single PDF and extract question data."""
    filename = os.path.basename(pdf_path)
    title = clean_title(filename)
    
    # Extract text content
    text = extract_text_from_pdf(pdf_path)
    
    # Parse difficulty
    difficulty = parse_difficulty(text)
    
    # Try to extract question number
    question_num = parse_question_number(filename) or (index + 1)
    
    # Generate slug from title
    slug = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-')
    
    # Extract description (first substantial paragraph after title)
    lines = text.split('\n')
    description_lines = []
    start_collecting = False
    
    for line in lines:
        line = line.strip()
        if len(line) > 50 and not start_collecting:
            start_collecting = True
        if start_collecting and line:
            description_lines.append(line)
            if len(description_lines) >= 10:  # Get first 10 lines
                break
    
    description = '\n'.join(description_lines) if description_lines else f"Solve the {title} problem."
    
    # Extract examples (look for "Example" keyword)
    examples = []
    example_pattern = r'Example\s*\d*:?\s*\n(.*?)(?=Example|\n\n|Constraints|$)'
    example_matches = re.finditer(example_pattern, text, re.DOTALL | re.IGNORECASE)
    
    for match in example_matches:
        examples.append(match.group(1).strip())
        if len(examples) >= 3:  # Limit to 3 examples
            break
    
    # Extract constraints
    constraints = []
    constraints_section = re.search(r'Constraints?:?\s*\n(.*?)(?=\n\n|Follow|$)', text, re.DOTALL | re.IGNORECASE)
    if constraints_section:
        constraint_lines = constraints_section.group(1).strip().split('\n')
        constraints = [line.strip() for line in constraint_lines if line.strip()][:5]
    
    # Determine tags based on title keywords
    tags = []
    title_lower = title.lower()
    
    if any(word in title_lower for word in ['tree', 'binary']):
        tags.append('Tree')
    if any(word in title_lower for word in ['array', 'sum', 'sort']):
        tags.append('Array')
    if any(word in title_lower for word in ['string', 'substring', 'palindrome']):
        tags.append('String')
    if any(word in title_lower for word in ['dynamic', 'dp', 'climb', 'fibonacci']):
        tags.append('Dynamic Programming')
    if any(word in title_lower for word in ['graph', 'course', 'clone']):
        tags.append('Graph')
    if any(word in title_lower for word in ['linked', 'list']):
        tags.append('Linked List')
    if any(word in title_lower for word in ['hash', 'map', 'duplicate']):
        tags.append('Hash Table')
    if any(word in title_lower for word in ['search', 'binary search']):
        tags.append('Binary Search')
    if any(word in title_lower for word in ['dfs', 'bfs', 'traversal']):
        tags.append('Depth-First Search')
    if any(word in title_lower for word in ['backtrack', 'combination', 'permutation']):
        tags.append('Backtracking')
    
    if not tags:
        tags = ['Algorithm']
    
    # Create question object
    question = {
        'title': title,
        'slug': slug,
        'difficulty': difficulty,
        'description': description[:1000],  # Limit description length
        'examples': examples[:3],
        'constraints': constraints[:5],
        'tags': tags,
        'leetcodeNumber': question_num,
        'timeLimit': 2000,  # 2 seconds default
        'memoryLimit': 256,  # 256 MB default
        'sourceFile': filename
    }
    
    return question

def main():
    """Main function to parse all PDFs and generate JSON."""
    # Path to extracted PDFs
    pdf_dir = Path('/Users/asjadmac/Desktop/ZCAT/temp_leetcode/leetcode ques')
    
    if not pdf_dir.exists():
        print(f"Error: Directory {pdf_dir} does not exist")
        return
    
    # Get all PDF files
    pdf_files = sorted(list(pdf_dir.glob('*.pdf')))
    print(f"Found {len(pdf_files)} PDF files")
    
    questions = []
    
    for index, pdf_path in enumerate(pdf_files):
        print(f"Processing {index + 1}/{len(pdf_files)}: {pdf_path.name}")
        question_data = parse_question_data(pdf_path, index)
        questions.append(question_data)
    
    # Save to JSON file
    output_path = Path('/Users/asjadmac/Desktop/ZCAT/scripts/leetcode-questions.json')
    output_path.parent.mkdir(exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Successfully parsed {len(questions)} questions")
    print(f"📄 Output saved to: {output_path}")
    
    # Print summary
    difficulty_count = {}
    for q in questions:
        diff = q['difficulty']
        difficulty_count[diff] = difficulty_count.get(diff, 0) + 1
    
    print("\n📊 Summary:")
    for diff, count in sorted(difficulty_count.items()):
        print(f"  {diff}: {count} questions")

if __name__ == '__main__':
    main()

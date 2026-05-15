/**
 * Test Case Parser
 * Extracts structured test cases from LeetCode-style example strings
 */

export interface TestCase {
  id: number;
  input: string;      // Raw input line e.g. 'nums = [-1,0,1,2,-1,-4]'
  expected: string;    // Raw expected output e.g. '[[-1,-1,2],[-1,0,1]]'
  explanation?: string;
}

export interface TestResult {
  testCase: TestCase;
  passed: boolean;
  actual: string;
  executionTime: number;
  error?: string;
}

/**
 * Parse example strings into structured test cases
 */
export function parseTestCases(examples: string[]): TestCase[] {
  const cases: TestCase[] = [];
  let id = 1;

  for (const ex of examples) {
    // Match Input: ... and Output: ... patterns
    const inputMatch = ex.match(/Input:\s*([\s\S]+?)(?:\nOutput:)/);
    const outputMatch = ex.match(/Output:\s*([\s\S]+?)(?:\n(?:Explanation:|$))/);

    if (!inputMatch || !outputMatch) {
      // Try alternate format with extra spaces
      const altInput = ex.match(/Input:\s*([\s\S]+?)(?:\s*Output:)/);
      const altOutput = ex.match(/Output:\s*([\s\S]+?)(?:\s*(?:Explanation:|[\d.]+K|\n\n|$))/);
      if (altInput && altOutput) {
        const explanation = ex.match(/Explanation:\s*([\s\S]+?)$/)?.[1]?.trim();
        cases.push({
          id: id++,
          input: altInput[1].trim(),
          expected: altOutput[1].trim(),
          explanation: explanation?.replace(/\n.*leetcode.*/gi, '').replace(/\n.*Probl.*/gi, '').trim() || undefined,
        });
      }
      continue;
    }

    const explanation = ex.match(/Explanation:\s*([\s\S]+?)$/)?.[1]?.trim();
    cases.push({
      id: id++,
      input: inputMatch[1].trim(),
      expected: outputMatch[1].trim(),
      explanation: explanation?.replace(/\n.*leetcode.*/gi, '').replace(/\n.*Probl.*/gi, '').replace(/\n.*\d+\.\d+K.*/gi, '').trim() || undefined,
    });
  }

  return cases;
}

/**
 * Generate function stub code based on question title and test cases
 */
export function generateStub(language: string, title: string, testCases: TestCase[]): string {
  // Convert title to camelCase function name
  const fnName = title
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(/\s+/)
    .map((w, i) => i === 0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('');

  // Parse parameters from first test case input
  const params = testCases.length > 0
    ? testCases[0].input.split(',').map(p => p.split('=')[0].trim()).filter(Boolean)
    : ['input'];

  if (language === 'python') {
    return `import json
import sys

def ${fnName}(${params.join(', ')}):
    # Write your solution here
    pass

# --- Do not modify below this line ---
if __name__ == "__main__":
    input_data = sys.stdin.read().strip()
    if input_data:
        parts = input_data.split("\\n")
        args = []
        for part in parts:
            key_val = part.split("=", 1)
            if len(key_val) == 2:
                args.append(json.loads(key_val[1].strip()))
            else:
                args.append(json.loads(part.strip()))
        result = ${fnName}(*args)
        print(json.dumps(result))
`;
  }

  if (language === 'javascript') {
    return `function ${fnName}(${params.join(', ')}) {
  // Write your solution here
  
}

// --- Do not modify below this line ---
const fs = require('fs');
const inputData = fs.readFileSync('/dev/stdin', 'utf8').trim();
if (inputData) {
  const parts = inputData.split("\\n");
  const args = parts.map(part => {
    const eqIdx = part.indexOf("=");
    if (eqIdx !== -1) return JSON.parse(part.slice(eqIdx + 1).trim());
    return JSON.parse(part.trim());
  });
  const result = ${fnName}(...args);
  console.log(JSON.stringify(result));
}
`;
  }

  return `// ${language} is not supported for live execution\n// Write your ${fnName} solution here\n`;
}

/**
 * Format test case input as stdin string
 * e.g. "nums = [-1,0,1,2,-1,-4]" → "nums = [-1,0,1,2,-1,-4]"
 */
export function formatInputAsStdin(input: string): string {
  // Split by comma-separated params but respect brackets/quotes
  // e.g. "nums = [-1,0,1,2,-1,-4], target = 0" → two lines
  const params: string[] = [];
  let current = '';
  let depth = 0;
  let inStr = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"' && input[i - 1] !== '\\') inStr = !inStr;
    if (!inStr) {
      if (ch === '[' || ch === '(' || ch === '{') depth++;
      if (ch === ']' || ch === ')' || ch === '}') depth--;
      if (ch === ',' && depth === 0) {
        params.push(current.trim());
        current = '';
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) params.push(current.trim());

  return params.join('\n');
}

/**
 * Normalize output for comparison (trim whitespace, normalize JSON)
 */
export function normalizeOutput(output: string): string {
  const trimmed = output.trim();
  try {
    // Try to parse as JSON and re-stringify for consistent formatting
    const parsed = JSON.parse(trimmed);
    return JSON.stringify(parsed);
  } catch {
    return trimmed;
  }
}

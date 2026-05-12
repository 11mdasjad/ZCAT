'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, ChevronDown, Terminal, CheckCircle } from 'lucide-react';
import SectionHeading from '@/components/shared/SectionHeading';

const languages = ['Python', 'JavaScript', 'Java', 'C++', 'C'];

const codeSnippets: Record<string, string> = {
  Python: `def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test
print(two_sum([2, 7, 11, 15], 9))`,
  JavaScript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

console.log(twoSum([2, 7, 11, 15], 9));`,
  Java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
  'C++': `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> m;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (m.find(complement) != m.end()) {
                return {m[complement], i};
            }
            m[nums[i]] = i;
        }
        return {};
    }
};`,
  C: `int* twoSum(int* nums, int size, int target, int* returnSize) {
    *returnSize = 2;
    int* result = malloc(2 * sizeof(int));
    for (int i = 0; i < size; i++) {
        for (int j = i + 1; j < size; j++) {
            if (nums[i] + nums[j] == target) {
                result[0] = i;
                result[1] = j;
                return result;
            }
        }
    }
    return result;
}`,
};

export default function CodeEditorSection() {
  const [selectedLang, setSelectedLang] = useState('Python');
  const [showOutput, setShowOutput] = useState(false);
  const [running, setRunning] = useState(false);

  const handleRun = () => {
    setRunning(true);
    setShowOutput(false);
    setTimeout(() => {
      setRunning(false);
      setShowOutput(true);
    }, 1200);
  };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Code Editor"
          title="Professional Coding"
          gradient="Environment"
          description="Feature-rich code editor with multi-language support, auto-evaluation, and real-time test case feedback."
        />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <div className="glass-card rounded-2xl overflow-hidden border border-[#21262d]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#21262d] bg-[#0d1117]/80">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ef4444]" />
                  <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                  <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                </div>
                <span className="text-xs text-[#484f58] font-mono">solution.py</span>
              </div>
              <div className="flex items-center gap-3">
                {/* Language Selector */}
                <div className="relative">
                  <select
                    value={selectedLang}
                    onChange={(e) => { setSelectedLang(e.target.value); setShowOutput(false); }}
                    className="appearance-none bg-[#161b22] border border-[#21262d] rounded-lg px-3 py-1.5 text-xs text-[#8b949e] pr-7 outline-none focus:border-[#00d4ff]/50 cursor-pointer"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#484f58] pointer-events-none" />
                </div>

                {/* Run Button */}
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#10b981] to-[#059669] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all duration-200 disabled:opacity-50"
                >
                  {running ? (
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3 h-3" />
                  )}
                  {running ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            {/* Code Area */}
            <div className="relative bg-[#0d1117] p-5 min-h-[320px]">
              {/* Line numbers + code */}
              <div className="flex font-mono text-sm leading-relaxed">
                <div className="pr-4 text-right select-none text-[#484f58]/60 border-r border-[#21262d] mr-4">
                  {codeSnippets[selectedLang].split('\n').map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <pre className="flex-1 text-[#e4e8f1] overflow-x-auto">
                  <code>{codeSnippets[selectedLang]}</code>
                </pre>
              </div>
            </div>

            {/* Console Output */}
            {showOutput && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="border-t border-[#21262d]"
              >
                <div className="flex items-center gap-2 px-4 py-2 bg-[#161b22]/50 border-b border-[#21262d]">
                  <Terminal className="w-3.5 h-3.5 text-[#10b981]" />
                  <span className="text-xs font-medium text-[#8b949e]">Console Output</span>
                </div>
                <div className="p-4 bg-[#0d1117] font-mono text-sm space-y-1">
                  <div className="text-[#10b981]">$ Compiling {selectedLang}...</div>
                  <div className="text-[#8b949e]">  Compilation successful (0.12s)</div>
                  <div className="text-[#8b949e]" />
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Test Case 1: Passed — Output: [0, 1]
                  </div>
                  <div className="flex items-center gap-2 text-[#10b981]">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Test Case 2: Passed — Output: [1, 2]
                  </div>
                  <div className="mt-2 text-[#00d4ff]">═══ 2/2 test cases passed | Runtime: 42ms | Memory: 14.2MB ═══</div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { create } from 'zustand';
import { Language } from '@/types/exam';

interface ExamStore {
  currentLanguage: Language;
  code: string;
  isRunning: boolean;
  output: string;
  timeRemaining: number;
  isSubmitting: boolean;
  setLanguage: (lang: Language) => void;
  setCode: (code: string) => void;
  setOutput: (output: string) => void;
  setIsRunning: (running: boolean) => void;
  setTimeRemaining: (time: number) => void;
  runCode: () => void;
  submitCode: () => void;
}

const defaultCode: Record<Language, string> = {
  python: '# Write your solution here\ndef solution(nums, target):\n    pass\n',
  javascript: '// Write your solution here\nfunction solution(nums, target) {\n  \n}\n',
  java: '// Write your solution here\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        \n    }\n}\n',
  cpp: '// Write your solution here\n#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};\n',
  c: '// Write your solution here\n#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    \n}\n',
};

export const useExamStore = create<ExamStore>((set, get) => ({
  currentLanguage: 'python',
  code: defaultCode.python,
  isRunning: false,
  output: '',
  timeRemaining: 7200,
  isSubmitting: false,
  setLanguage: (lang) => set({ currentLanguage: lang, code: defaultCode[lang] }),
  setCode: (code) => set({ code }),
  setOutput: (output) => set({ output }),
  setIsRunning: (running) => set({ isRunning: running }),
  setTimeRemaining: (time) => set({ timeRemaining: time }),
  runCode: () => {
    set({ isRunning: true, output: '' });
    setTimeout(() => {
      set({
        isRunning: false,
        output: `$ Running ${get().currentLanguage}...\n\nTest Case 1: ✓ Passed\n  Input: nums = [2,7,11,15], target = 9\n  Expected: [0,1]\n  Output: [0,1]\n\nTest Case 2: ✓ Passed\n  Input: nums = [3,2,4], target = 6\n  Expected: [1,2]\n  Output: [1,2]\n\n═══════════════════════════\n  2/2 test cases passed\n  Runtime: 42ms | Memory: 14.2MB\n═══════════════════════════`,
      });
    }, 1500);
  },
  submitCode: () => {
    set({ isSubmitting: true });
    setTimeout(() => set({ isSubmitting: false }), 2000);
  },
}));

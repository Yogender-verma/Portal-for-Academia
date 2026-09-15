import type { CodingQuestion } from '../types/assessment';

export const CODING_QUESTIONS: CodingQuestion[] = [
  {
    id: 'q_js_largest',
    title: 'Find Largest Number in Array',
    skill: 'JavaScript',
    difficulty: 'Easy',
    description: 'Write a JavaScript function `largest(arr)` that accepts an array of numbers and returns the largest number in the array.',
    examples: [
      { input: '[10, 5, 20, 8, 15]', output: '20', explanation: '20 is the highest numerical value in the array.' },
      { input: '[-5, -10, -2, -20]', output: '-2', explanation: '-2 is the maximum value among negative integers.' },
    ],
    constraints: [
      '1 <= arr.length <= 1000',
      '-10^6 <= arr[i] <= 10^6',
    ],
    supportedLanguages: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'nodejs'],
    defaultCode: {
      javascript: `function largest(arr) {
  // Write your code here
  let max = arr[0];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > max) max = arr[i];
  }
  return max;
}`,
      python: `def largest(arr):
    # Write your code here
    return max(arr)

print(largest([10, 5, 20, 8, 15]))
`,
      java: `public class Main {
    public static int largest(int[] arr) {
        int max = arr[0];
        for (int num : arr) {
            if (num > max) max = num;
        }
        return max;
    }

    public static void main(String[] args) {
        int[] nums = {10, 5, 20, 8, 15};
        System.out.println(largest(nums));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int largest(vector<int>& arr) {
    int maxVal = arr[0];
    for (int x : arr) {
        if (x > maxVal) maxVal = x;
    }
    return maxVal;
}

int main() {
    vector<int> nums = {10, 5, 20, 8, 15};
    cout << largest(nums) << endl;
    return 0;
}`,
      c: `#include <stdio.h>

int largest(int arr[], int n) {
    int max = arr[0];
    for (int i = 1; i < n; i++) {
        if (arr[i] > max) max = arr[i];
    }
    return max;
}

int main() {
    int arr[] = {10, 5, 20, 8, 15};
    printf("%d\\n", largest(arr, 5));
    return 0;
}`,
      csharp: `using System;
using System.Linq;

class Program {
    static int Largest(int[] arr) {
        return arr.Max();
    }

    static void Main() {
        int[] nums = {10, 5, 20, 8, 15};
        Console.WriteLine(Largest(nums));
    }
}`,
    },
    testCases: [
      { id: 't1', input: '[10, 5, 20, 8, 15]', expectedOutput: '20', isPublic: true, description: 'Positive integers' },
      { id: 't2', input: '[-5, -10, -2, -20]', expectedOutput: '-2', isPublic: true, description: 'Negative numbers' },
      { id: 't3', input: '[99]', expectedOutput: '99', isPublic: false, description: 'Single element array' },
      { id: 't4', input: '[0, 0, 0, 0]', expectedOutput: '0', isPublic: false, description: 'All zeros' },
    ],
  },
  {
    id: 'q_react_counter',
    title: 'Interactive Counter Component',
    skill: 'React',
    difficulty: 'Easy',
    description: 'Create a functional React component named `App` with an state increment button, decrement button, and a count display.',
    examples: [
      { input: 'Initial state', output: 'Count: 0', explanation: 'Initial count starts at 0.' },
    ],
    constraints: ['Must use useState hook', 'Must render buttons with readable text'],
    supportedLanguages: ['react', 'html', 'css', 'javascript'],
    defaultCode: {
      react: `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', textAlign: 'center', color: '#fff', background: '#0f172a', borderRadius: '12px' }}>
      <h2>SkillBridge Counter</h2>
      <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#38bdf8' }}>{count}</p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={() => setCount(count + 1)} style={{ padding: '8px 16px', background: '#22c55e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Increment (+)
        </button>
        <button onClick={() => setCount(count - 1)} style={{ padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
          Decrement (-)
        </button>
      </div>
    </div>
  );
}`,
      html: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: sans-serif; background: #0f172a; color: white; padding: 20px; text-align: center; }
    button { padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; margin: 5px; font-weight: bold; }
    .inc { background: #22c55e; color: white; }
    .dec { background: #ef4444; color: white; }
  </style>
</head>
<body>
  <h1>SkillBridge Interactive Web Page</h1>
  <p id="counter" style="font-size: 2rem; color: #38bdf8;">0</p>
  <button class="inc" onclick="change(1)">Increment (+)</button>
  <button class="dec" onclick="change(-1)">Decrement (-)</button>

  <script>
    let count = 0;
    function change(val) {
      count += val;
      document.getElementById('counter').innerText = count;
    }
  </script>
</body>
</html>`,
    },
    testCases: [
      { id: 'tr1', input: 'useState', expectedOutput: 'useState', isPublic: true, description: 'React State hook check' },
      { id: 'tr2', input: 'App', expectedOutput: 'App', isPublic: true, description: 'Export App component check' },
    ],
  },
  {
    id: 'q_py_palindrome',
    title: 'Palindrome String Checker',
    skill: 'Python',
    difficulty: 'Medium',
    description: 'Write a function `isPalindrome(s)` that returns `True` if the given string is a palindrome (ignoring casing & non-alphanumeric characters), otherwise `False`.',
    examples: [
      { input: '"A man, a plan, a canal: Panama"', output: 'true', explanation: 'Ignoring punctuation and spaces yields "amanaplanacanalpanama" which reads the same backwards.' },
      { input: '"race a car"', output: 'false', explanation: '"raceacar" is not equal to "racaecar".' },
    ],
    constraints: ['1 <= len(s) <= 2 * 10^5'],
    supportedLanguages: ['python', 'javascript', 'java', 'cpp', 'php', 'r'],
    defaultCode: {
      python: `import re

def isPalindrome(s: str) -> bool:
    cleaned = re.sub(r'[^a-zA-Z0-9]', '', s).lower()
    return cleaned == cleaned[::-1]

print(isPalindrome("A man, a plan, a canal: Panama"))
`,
      javascript: `function isPalindrome(s) {
  const cleaned = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return cleaned === cleaned.split('').reverse().join('');
}

console.log(isPalindrome("A man, a plan, a canal: Panama"));`,
      java: `public class Main {
    public static boolean isPalindrome(String s) {
        String cleaned = s.replaceAll("[^a-zA-Z0-9]", "").toLowerCase();
        String reversed = new StringBuilder(cleaned).reverse().toString();
        return cleaned.equals(reversed);
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama"));
    }
}`,
    },
    testCases: [
      { id: 'tp1', input: '"A man, a plan, a canal: Panama"', expectedOutput: 'true', isPublic: true },
      { id: 'tp2', input: '"race a car"', expectedOutput: 'false', isPublic: true },
      { id: 'tp3', input: '"Was it a car or a cat I saw?"', expectedOutput: 'true', isPublic: false },
    ],
  },
  {
    id: 'q_sql_node_api',
    title: 'REST API Endpoint Builder',
    skill: 'Node.js',
    difficulty: 'Medium',
    description: 'Write a Node.js HTTP server handler that processes incoming JSON payload and calculates total price with tax.',
    examples: [
      { input: '{"price": 100, "taxRate": 0.18}', output: '{"total": 118}', explanation: '100 + (100 * 0.18) = 118.' },
    ],
    constraints: ['Return valid JSON string'],
    supportedLanguages: ['nodejs', 'javascript', 'php', 'python'],
    defaultCode: {
      nodejs: `const http = require('http');

function calculateTotal(price, taxRate) {
  return price + (price * taxRate);
}

console.log(JSON.stringify({ total: calculateTotal(100, 0.18) }));
`,
      javascript: `function calculateTotal(price, taxRate) {
  return price + (price * taxRate);
}
console.log({ total: calculateTotal(100, 0.18) });`,
    },
    testCases: [
      { id: 'tn1', input: '{"price":100,"taxRate":0.18}', expectedOutput: '{"total":118}', isPublic: true },
    ],
  },
];

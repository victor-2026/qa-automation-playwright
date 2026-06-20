#!/usr/bin/env npx tsx
/**
 * Evaluation script for rest-api-qa skill experiment on Buzzhive
 * Checks: valid login test + invalid login test + body validation + tests pass
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const QA_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(__dirname, 'runs');
const TEMP_TEST_FILE = join(QA_ROOT, 'e2e', 'rest-api-qa-test.spec.ts');

interface EvalResult {
  run: number;
  condition: 'without-skill' | 'with-skill';
  timestamp: string;
  hasValidLoginTest: boolean;
  hasInvalidLoginTest: boolean;
  hasBodyValidation: boolean;
  testsPass: boolean;
  overallPass: boolean;
  errors: string[];
  output?: string;
}

function ensureDir(dir: string) {
  execSync(`mkdir -p ${dir}`);
}

function checkPatterns(content: string): { hasValidLoginTest: boolean; hasInvalidLoginTest: boolean; hasBodyValidation: boolean } {
  return {
    hasValidLoginTest: /login|POST\s+\/api\/auth\/login|access_token|200/.test(content),
    hasInvalidLoginTest: /wrongpassword|invalid|401|Unauthorized|400/.test(content),
    hasBodyValidation: /expect\(.*\)\.toHaveProperty|toEqual|toContain|\.body|json\(\)/.test(content),
  };
}

function runTest(file: string): { passes: boolean; output: string } {
  try {
    const output = execSync(`npx playwright test ${file} --reporter=line`, { 
      encoding: 'utf-8', 
      timeout: 120000,
      cwd: QA_ROOT,
      env: { ...process.env, LOCAL: 'true' }
    });
    return { passes: true, output };
  } catch (e: any) {
    const output = e.stdout || e.message;
    return { passes: false, output };
  }
}

function evaluateRun(run: number, condition: 'without-skill' | 'with-skill', testContent: string) {
  const errors: string[] = [];
  
  writeFileSync(TEMP_TEST_FILE, testContent);
  
  // 1. Pattern checks (compile skipped - node_modules issues)
  const patterns = checkPatterns(testContent);
  if (!patterns.hasValidLoginTest) {
    errors.push('Missing valid login test (POST /api/auth/login -> 200 + token)');
  }
  if (!patterns.hasInvalidLoginTest) {
    errors.push('Missing invalid login test (POST /api/auth/login -> 401/400)');
  }
  if (!patterns.hasBodyValidation) {
    errors.push('Missing response body validation (token/fields check)');
  }
  
  // 2. Run test (should PASS for rest-api-qa)
  const runResult = runTest(TEMP_TEST_FILE);
  const testsPass = runResult.passes;
  const testOutput = runResult.output;
  if (!testsPass) {
    errors.push('Test failed - should pass with valid credentials');
  }
  
  const overallPass = patterns.hasValidLoginTest && patterns.hasInvalidLoginTest && patterns.hasBodyValidation && testsPass;
  
  return {
    run,
    condition,
    timestamp: new Date().toISOString(),
    hasValidLoginTest: patterns.hasValidLoginTest,
    hasInvalidLoginTest: patterns.hasInvalidLoginTest,
    hasBodyValidation: patterns.hasBodyValidation,
    testsPass,
    overallPass,
    errors,
    output: testOutput,
  };
}

function main() {
  ensureDir(OUTPUT_DIR);
  
  const args = process.argv.slice(2);
  const runNum = parseInt(args[0] || '1');
  const condition = (args[1] as 'without-skill' | 'with-skill') || 'without-skill';
  const inputFile = args[2];
  
  let testContent = '';
  if (inputFile) {
    testContent = readFileSync(inputFile, 'utf-8');
  } else {
    testContent = readFileSync(0, 'utf-8');
  }
  
  if (!testContent.trim()) {
    console.error('No test content provided');
    process.exit(1);
  }
  
  const result = evaluateRun(runNum, condition, testContent);
  
  const resultFile = join(OUTPUT_DIR, `rest-api-qa-${condition}-run${runNum}.json`);
  writeFileSync(resultFile, JSON.stringify(result, null, 2));
  
  console.log(`\n=== rest-api-qa Run ${runNum} (${condition}) ===`);
  console.log(`Has valid login test: ${result.hasValidLoginTest ? '✅' : '❌'}`);
  console.log(`Has invalid login test: ${result.hasInvalidLoginTest ? '✅' : '❌'}`);
  console.log(`Has body validation: ${result.hasBodyValidation ? '✅' : '❌'}`);
  console.log(`Tests pass: ${result.testsPass ? '✅' : '❌'}`);
  console.log(`OVERALL: ${result.overallPass ? 'PASS' : 'FAIL'}`);
  if (result.errors.length) {
    console.log('Errors:', result.errors.join('; '));
  }
  
  process.exit(result.overallPass ? 0 : 1);
}

main();
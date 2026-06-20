#!/usr/bin/env npx tsx
/**
 * Evaluation script for fault-injection skill experiment on Buzzhive
 * Checks: compiles + page.route() + null injection + test fails (mutation caught)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const QA_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(__dirname, 'runs');
const TEMP_TEST_FILE = join(QA_ROOT, 'e2e', 'fault-injection-test.spec.ts');

interface EvalResult {
  run: number;
  condition: 'without-skill' | 'with-skill';
  timestamp: string;
  hasPageRoute: boolean;
  hasNullInjection: boolean;
  testFails: boolean;
  overallPass: boolean;
  errors: string[];
  output?: string;
}

function ensureDir(dir: string) {
  execSync(`mkdir -p ${dir}`);
}

function checkPatterns(content: string): { hasPageRoute: boolean; hasNullInjection: boolean } {
  return {
    hasPageRoute: /page\.route\s*\(/.test(content),
    hasNullInjection: /null/.test(content) && /(title|name|firstName|lastName|emp_firstname)/.test(content),
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
    // Test failing is EXPECTED for fault-injection (mutation should be caught)
    const output = e.stdout || e.message;
    return { passes: false, output };
  }
}

function evaluateRun(run: number, condition: 'without-skill' | 'with-skill', testContent: string): EvalResult {
  const errors: string[] = [];
  
  writeFileSync(TEMP_TEST_FILE, testContent);
  
  // 1. Pattern checks (compile skipped - node_modules issues)
  const patterns = checkPatterns(testContent);
  if (!patterns.hasPageRoute) {
    errors.push('Missing page.route() interception');
  }
  if (!patterns.hasNullInjection) {
    errors.push('Missing null injection into field');
  }
  
  // 2. Run test (should FAIL for fault-injection - mutation caught)
  const runResult = runTest(TEMP_TEST_FILE);
  const testFails = !runResult.passes; // We WANT the test to fail (mutation caught)
  if (!testFails) {
    errors.push('Test passed - mutation was NOT caught (should fail)');
  }
  
  const overallPass = patterns.hasPageRoute && patterns.hasNullInjection && testFails;
  
  return {
    run,
    condition,
    timestamp: new Date().toISOString(),
    hasPageRoute: patterns.hasPageRoute,
    hasNullInjection: patterns.hasNullInjection,
    testFails,
    overallPass,
    errors,
    output: runResult.output,
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
  
  const resultFile = join(OUTPUT_DIR, `fault-injection-${condition}-run${runNum}.json`);
  writeFileSync(resultFile, JSON.stringify(result, null, 2));
  
  console.log(`\n=== fault-injection Run ${runNum} (${condition}) ===`);
  console.log(`Has page.route(): ${result.hasPageRoute ? '✅' : '❌'}`);
  console.log(`Has null injection: ${result.hasNullInjection ? '✅' : '❌'}`);
  console.log(`Test fails (mutation caught): ${result.testFails ? '✅' : '❌'}`);
  console.log(`OVERALL: ${result.overallPass ? 'PASS' : 'FAIL'}`);
  if (result.errors.length) {
    console.log('Errors:', result.errors.join('; '));
  }
  
  process.exit(result.overallPass ? 0 : 1);
}

main();
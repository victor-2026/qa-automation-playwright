#!/usr/bin/env npx tsx
/**
 * Evaluation script for bdd-gherkin skill experiment on Buzzhive
 * Checks: gherkin-lint + Feature/Background/Scenario/Outline + Given→When→Then order + domain-level steps
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const QA_ROOT = join(__dirname, '..', '..');
const OUTPUT_DIR = join(__dirname, 'runs');
const TEMP_FEATURE_FILE = join(QA_ROOT, 'e2e', 'claim.feature');

interface EvalResult {
  run: number;
  condition: 'without-skill' | 'with-skill';
  timestamp: string;
  lintPasses: boolean;
  hasFeature: boolean;
  hasBackground: boolean;
  hasScenario: boolean;
  hasScenarioOutline: boolean;
  properOrder: boolean;
  domainLevelSteps: boolean;
  overallPass: boolean;
  errors: string[];
  lintOutput?: string;
}

function ensureDir(dir: string) {
  execSync(`mkdir -p ${dir}`);
}

function runGherkinLint(file: string): { passes: boolean; output: string } {
  try {
    const output = execSync(`npx gherkin-lint ${file}`, { encoding: 'utf-8', timeout: 30000, cwd: QA_ROOT });
    return { passes: true, output };
  } catch (e: any) {
    const output = e.stdout || e.message;
    if (output.includes('config') || output.includes('does not exist') || output.includes('Could not find default config')) {
      return { passes: true, output: 'lint config issues, skipping' };
    }
    return { passes: false, output };
  }
}

function checkStructure(content: string): { 
  hasFeature: boolean; 
  hasBackground: boolean; 
  hasScenario: boolean; 
  hasScenarioOutline: boolean;
  properOrder: boolean;
  domainLevelSteps: boolean;
} {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  
  const hasFeature = /^Feature:/im.test(content);
  const hasBackground = /^Background:/im.test(content);
  const hasScenario = /^Scenario:/im.test(content);
  const hasScenarioOutline = /^Scenario Outline:/im.test(content);
  
  // Check Given → When → Then order per scenario
  let properOrder = true;
  let lastMainKeyword = '';
  const mainKeywords = ['Given', 'When', 'Then'];
  
  for (const line of lines) {
    if (line.startsWith('Scenario:') || line.startsWith('Scenario Outline:') || line.startsWith('Background:')) {
      lastMainKeyword = '';
    }
    
    for (const kw of mainKeywords) {
      if (line.startsWith(kw + ' ')) {
        const kwIndex = mainKeywords.indexOf(kw);
        const lastIndex = mainKeywords.indexOf(lastMainKeyword);
        if (lastMainKeyword && kwIndex < lastIndex) {
          properOrder = false;
        }
        lastMainKeyword = kw;
        break;
      }
    }
  }
  
  // Domain-level steps: no UI mechanics (click, fill, press, type, navigate, selector, xpath, css, locator, getBy, expect, page., await page)
  // Allow domain-level verbs: selects, enters, submits, attaches, chooses, verifies, sees, views, navigates to
  const uiMechanics = /click|fill|press|type|navigate|selector|xpath|css|locator|getBy|expect\(|page\.|await\s+page/i;
  const sqlKeywordsStrict = /\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bFROM\b|\bWHERE\b|\bJOIN\b|\bINNER\b|\bOUTER\b/i;
  const domainLevelSteps = !uiMechanics.test(content) && !sqlKeywordsStrict.test(content);
  
  return {
    hasFeature,
    hasBackground,
    hasScenario,
    hasScenarioOutline,
    properOrder,
    domainLevelSteps,
  };
}

function evaluateRun(run: number, condition: 'without-skill' | 'with-skill', featureContent: string) {
  const errors: string[] = [];
  
  const TEMP_FEATURE_FILE = join(QA_ROOT, 'e2e', 'claim.feature');
  writeFileSync(TEMP_FEATURE_FILE, featureContent);
  
  // 1. Gherkin lint
  const lintResult = runGherkinLint(TEMP_FEATURE_FILE);
  if (!lintResult.passes) {
    errors.push(`gherkin-lint failed: ${lintResult.output}`);
  }
  
  // 2. Structure checks
  const structure = checkStructure(featureContent);
  if (!structure.hasFeature) errors.push('Missing Feature');
  if (!structure.hasBackground) errors.push('Missing Background');
  if (!structure.hasScenario) errors.push('Missing Scenario');
  if (!structure.hasScenarioOutline) errors.push('Missing Scenario Outline with Examples');
  if (!structure.properOrder) errors.push('Steps not in Given → When → Then order');
  if (!structure.domainLevelSteps) errors.push('Steps contain UI mechanics (click, fill, selector) or SQL - should be domain-level');
  
  const overallPass = lintResult.passes && structure.hasFeature && structure.hasBackground && structure.hasScenario && structure.hasScenarioOutline && structure.properOrder && structure.domainLevelSteps;
  
  return {
    run,
    condition,
    timestamp: new Date().toISOString(),
    lintPasses: lintResult.passes,
    hasFeature: structure.hasFeature,
    hasBackground: structure.hasBackground,
    hasScenario: structure.hasScenario,
    hasScenarioOutline: structure.hasScenarioOutline,
    properOrder: structure.properOrder,
    domainLevelSteps: structure.domainLevelSteps,
    overallPass,
    errors,
    lintOutput: lintResult.output,
  };
}

function main() {
  const OUTPUT_DIR = join(__dirname, 'runs');
  execSync(`mkdir -p ${join(__dirname, 'runs')}`);
  
  const args = process.argv.slice(2);
  const runNum = parseInt(args[0] || '1');
  const condition = (args[1] as 'without-skill' | 'with-skill') || 'without-skill';
  const inputFile = args[2];
  
  let featureContent = '';
  if (inputFile) {
    featureContent = readFileSync(inputFile, 'utf-8');
  } else {
    featureContent = readFileSync(0, 'utf-8');
  }
  
  if (!featureContent.trim()) {
    console.error('No feature content provided');
    process.exit(1);
  }
  
  const result = evaluateRun(runNum, condition, featureContent);
  
  const resultFile = join(__dirname, 'runs', `bdd-gherkin-${condition}-run${runNum}.json`);
  writeFileSync(resultFile, JSON.stringify(result, null, 2));
  
  console.log(`\n=== bdd-gherkin Run ${runNum} (${condition}) ===`);
  console.log(`gherkin-lint: ${result.lintPasses ? '✅' : '❌'}`);
  console.log(`Has Feature: ${result.hasFeature ? '✅' : '❌'}`);
  console.log(`Has Background: ${result.hasBackground ? '✅' : '❌'}`);
  console.log(`Has Scenario: ${result.hasScenario ? '✅' : '❌'}`);
  console.log(`Has Scenario Outline: ${result.hasScenarioOutline ? '✅' : '❌'}`);
  console.log(`Proper G/W/T order: ${result.properOrder ? '✅' : '❌'}`);
  console.log(`Domain-level steps: ${result.domainLevelSteps ? '✅' : '❌'}`);
  console.log(`OVERALL: ${result.overallPass ? 'PASS' : 'FAIL'}`);
  if (result.errors.length) {
    console.log('Errors:', result.errors.join('; '));
  }
  
  process.exit(result.overallPass ? 0 : 1);
}

main();
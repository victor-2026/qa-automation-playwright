#!/usr/bin/env npx tsx
/**
 * Master runner for Skill Reliability Experiment on Buzzhive
 * Usage: npx tsx run-experiment.ts <skill> <condition> <run> <input-file>
 * Example: npx tsx run-experiment.ts fault-injection without-skill 1 generated/fault-injection-without-skill-run1.spec.ts
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const SKILLS = ['fault-injection', 'rest-api-qa', 'bdd-gherkin'] as const;
const CONDITIONS = ['without-skill', 'with-skill'] as const;

function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 4) {
    console.log(`
Skill Reliability Experiment Runner

Usage:
  npx tsx run-experiment.ts <skill> <condition> <run> <input-file>

Skills: ${SKILLS.join(', ')}
Conditions: ${CONDITIONS.join(', ')}
Run: 1, 2, or 3
Input-file: path to generated test/feature file

Examples:
  npx tsx run-experiment.ts fault-injection without-skill 1 ./generated/fault-injection-without-skill-run1.spec.ts
  npx tsx run-experiment.ts rest-api-qa with-skill 2 ./generated/rest-api-qa-with-skill-run2.spec.ts
  npx tsx run-experiment.ts bdd-gherkin without-skill 3 ./generated/claim-with-skill-run3.feature
`);
    process.exit(1);
  }
  
  const [skill, condition, runStr, inputFile] = args;
  const run = parseInt(runStr);
  const absoluteInputFile = join(__dirname, inputFile);
  
  if (!['fault-injection', 'rest-api-qa', 'bdd-gherkin'].includes(skill)) {
    console.error(`Invalid skill: ${skill}. Must be one of: fault-injection, rest-api-qa, bdd-gherkin`);
    process.exit(1);
  }
  
  if (!['without-skill', 'with-skill'].includes(condition)) {
    console.error(`Invalid condition: ${condition}. Must be one of: without-skill, with-skill`);
    process.exit(1);
  }
  
  if (run < 1 || run > 3) {
    console.error('Run must be 1, 2, or 3');
    process.exit(1);
  }
  
  const evalScript = join(__dirname, `eval-${skill}.ts`);
  
  console.log(`Running ${skill} - ${condition} - run ${run}`);
  console.log(`Input: ${inputFile}`);
  console.log(`Eval script: ${evalScript}`);
  
  try {
    execSync(`npx tsx ${evalScript} ${run} ${condition} ${absoluteInputFile}`, { 
      encoding: 'utf-8', 
      stdio: 'inherit', 
      timeout: 180000,
      cwd: __dirname
    });
    console.log('\n✅ Evaluation complete');
  } catch (e: any) {
    console.error('\n❌ Evaluation failed');
    process.exit(1);
  }
}

main();
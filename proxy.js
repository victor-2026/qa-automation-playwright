#!/usr/bin/env node
/**
 * OpenCode Proxy - streams GPT-5 Nano responses directly to terminal
 * 
 * Usage: node proxy.js
 * Then type your input - responses stream automatically
 * Press Ctrl+C to exit
 */

const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

const OPENCODE_PATH = '/usr/local/bin/opencode';

console.log('\n🤖 OpenCode Proxy - GPT-5 Nano\n');
console.log('Type your question and press Enter');
console.log('Response will stream automatically');
console.log('Press Ctrl+C to exit\n');

function ask(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function runOpenCode(input) {
  return new Promise((resolve) => {
    let output = '';
    const child = spawn(OPENCODE_PATH, ['--yes', input], {
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    child.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
      output += data.toString();
    });
    
    child.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
    
    child.on('close', (code) => {
      resolve(output);
    });
  });
}

async function chat() {
  while (true) {
    const question = await ask('\n👤 You: ');
    if (!question.trim() || question.toLowerCase() === 'exit') {
      console.log('\n👋 Bye!');
      process.exit(0);
    }
    
    console.log('\n🤖 AI: ');
    await runOpenCode(question);
    console.log('\n');
  }
}

chat();
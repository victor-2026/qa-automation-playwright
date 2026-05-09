/**
 * Environment configuration for E2E tests
 * All credentials should come from ENV variables
 */

export const requireEnv = (name: string): string => {
  const v = process.env[name];
  if (!v) {
    throw new Error(`Environment variable ${name} is required`);
  }
  return v;
};

// Optional with defaults
export const API_BASE = process.env.API_BASE_URL || process.env.API_BASE || 'https://buzzhive-test.onrender.com/api';
export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000';

// Legacy exports for backward compatibility
export const TEST_USERNAME = process.env.TEST_USERNAME || 'alice@buzzhive.com';
export const TEST_PASSWORD = process.env.TEST_PASSWORD || 'alice123';

// Test account roles (optional - use defaults if not set)
export const TEST_ACCOUNTS = {
  user: {
    email: process.env.TEST_USERNAME || 'alice@buzzhive.com',
    password: process.env.TEST_PASSWORD || 'alice123',
  },
  admin: {
    email: process.env.TEST_ADMIN_EMAIL || 'admin@buzzhive.com',
    password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
  },
  mod: {
    email: process.env.TEST_MOD_EMAIL || 'mod@buzzhive.com',
    password: process.env.TEST_MOD_PASSWORD || 'mod123',
  },
  bob: {
    email: process.env.TEST_BOB_EMAIL || 'bob@buzzhive.com',
    password: process.env.TEST_BOB_PASSWORD || 'bob123',
  },
  frank: {
    email: process.env.TEST_FRANK_EMAIL || 'frank@buzzhive.com',
    password: process.env.TEST_FRANK_PASSWORD || 'frank123',
  },
};

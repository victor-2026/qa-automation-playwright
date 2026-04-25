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

// Required environment variables
export const APP_BASE_URL = requireEnv('APP_BASE_URL');
export const TEST_USERNAME = requireEnv('TEST_USERNAME');
export const TEST_PASSWORD = requireEnv('TEST_PASSWORD');

// Optional with defaults
export const API_BASE = process.env.API_BASE || 'https://buzzhive-test.onrender.com/api';

// Test account roles
export const TEST_ACCOUNTS = {
  user: {
    email: TEST_USERNAME,
    password: TEST_PASSWORD,
  },
  admin: {
    email: requireEnv('TEST_ADMIN_EMAIL'),
    password: requireEnv('TEST_ADMIN_PASSWORD'),
  },
  mod: {
    email: requireEnv('TEST_MOD_EMAIL'),
    password: requireEnv('TEST_MOD_PASSWORD'),
  },
  bob: {
    email: requireEnv('TEST_BOB_EMAIL'),
    password: requireEnv('TEST_BOB_PASSWORD'),
  },
};

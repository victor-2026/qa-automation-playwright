import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 15000,
  roots: ['<rootDir>/pbt', '<rootDir>/db', '<rootDir>/components', '<rootDir>/contracts'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['pbt/**/*.ts', 'db/**/*.ts', 'components/**/*.tsx'],
  coverageDirectory: 'coverage',
  transformIgnorePatterns: [
    '/node_modules/(?!(https-proxy-agent|@pact-foundation)/)',
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { 
      useESM: true,
      tsconfig: {
        jsx: 'react-jsx'
      }
    }],
  },
};

export default config;

import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/pbt', '<rootDir>/db', '<rootDir>/components'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['pbt/**/*.ts', 'db/**/*.ts', 'components/**/*.tsx'],
  coverageDirectory: 'coverage',
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

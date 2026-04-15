import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/pbt', '<rootDir>/db'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['pbt/**/*.ts', 'db/**/*.ts'],
  coverageDirectory: 'coverage',
};

export default config;

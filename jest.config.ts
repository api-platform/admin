import type { JestConfigWithTsJest } from 'ts-jest';

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['/lib/'],
  maxWorkers: 1,
  moduleNameMapper: {
    '^(\\.{1,2}/.*/llhttp\\.wasm\\.js)$': '$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^@tanstack/react-query$':
      '<rootDir>/node_modules/@tanstack/react-query/build/modern/index.cjs',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },
};

export default config;

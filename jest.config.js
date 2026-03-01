const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: '.' });

module.exports = createJestConfig({
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: ['components/**/*.{js,jsx}', 'lib/**/*.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
});

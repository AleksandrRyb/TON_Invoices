module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/api/controllers/$1',
    '^@routes/(.*)$': '<rootDir>/src/api/routes/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@generated/prisma$': '<rootDir>/src/generated/prisma',
  },
  testTimeout: 30000,
  globalSetup: '<rootDir>/tests/setup/globalSetup.ts',
  globalTeardown: '<rootDir>/tests/setup/globalTeardown.ts',

}; 
module.exports = {
  testEnvironment: 'node',
  testTimeout: 60000,
  maxWorkers: 1,
  
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/*.js',
    '!src/database/seedData.js'
  ],
  
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  detectOpenHandles: true,
  forceExit: true,
  verbose: true
};
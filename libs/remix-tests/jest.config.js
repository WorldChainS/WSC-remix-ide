module.exports = {
    name: 'remix-tests',
    preset: '../../jest.config.js',
    verbose: true,
    silent: true, // Silent console messages, specially the 'remix-simulator' ones
    transform: {
      '^.+\\.[tj]sx?$': 'ts-jest',
    },
    rootDir: "./",
    testTimeout: 30000,
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html', 'json'],
    // Coverage
    collectCoverage: true,
    coverageReporters: ['text', 'text-summary'],
    collectCoverageFrom: [
      "**/*.ts",
      "!**/sol/**",
      "!src/types.ts",
      "!src/logger.ts"
    ],
    coverageDirectory: '../../coverage/libs/remix-tests',
  };
  
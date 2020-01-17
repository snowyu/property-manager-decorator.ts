module.exports = {
  setupFilesAfterEnv: [
    'jest-extended',
  ],
  // noStackTrace: true,
  bail: true,
  cache: false,
  verbose: true,
  collectCoverage: false,
  // coverageDirectory: '<rootDir>/test/jest/coverage',
  collectCoverageFrom: [
    '!<rootDir>/src/(assets|environment|types|router|boot|i18n)/**',
    '<rootDir>/src/**/*.js',
    '<rootDir>/src/**/*.ts',
  ],
  coverageThreshold: {
    global: {
    //  branches: 50,
    //  functions: 50,
    //  lines: 50,
    //  statements: 50
    }
  },
  // "testRegex": "src/.*(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testMatch: [
    // '<rootDir>/test/jest/__tests__/**/*.spec.js',
    // '<rootDir>/test/jest/__tests__/**/*.test.js',
    '<rootDir>/src/**/__tests__/*_jest.spec.(t|j)s',
    '<rootDir>/src/**/*.(spec|test).(t|j)s',
  ],
  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/$1',
    // '^src/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
    '.*\\.jsx?$': '<rootDir>/node_modules/babel-jest',
    // "\\.(gql|graphql)$": "jest-transform-graphql",
  },
  transformIgnorePatterns: [
    // all exceptions which need to transform must be first line
    "/node_modules/(?!@ngrx|@ionic-native|@ionic|json-canonicalize/src|pouchdb-transform/src)",
  ],
}

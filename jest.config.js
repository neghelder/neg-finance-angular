/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  moduleNameMapper: {
    // Mock CSS imports that AG Grid loads directly in TypeScript
    '\\.(css|scss|sass)$': '<rootDir>/src/__mocks__/style-mock.ts',
  },
  transformIgnorePatterns: [
    'node_modules/(?!.*\\.mjs$|ag-grid-angular|ag-grid-community|highcharts-angular)',
  ],
};

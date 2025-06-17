module.exports = {
  preset: 'react-native',
  verbose: true,
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./test-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-navigation|@react-native-community|redux-persist|@realm)',
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: ['src/services/electrum/**/*.ts', 'src/services/wallets/**/*.ts'],
  coverageReporters: ['text', 'lcov'],
  moduleNameMapper: {
    '^@react-native-clipboard/clipboard$': '<rootDir>/__mocks__/react-native-clipboard.js',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/react-native-community-netinfo.js',
  },
  moduleDirectories: ['node_modules', 'src'],
};

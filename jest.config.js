module.exports = {
  preset: 'react-native',
  verbose: true,
  setupFiles: ['./node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['./test-setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-navigation|@react-native-community|redux-persist|@realm)',
  ],

  moduleNameMapper: {
    '^realm$': '<rootDir>/__mocks__/realm.js',
    '\\.svg$': '<rootDir>/__mocks__/svgMock.js',
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
    '^react-native-nfc-manager$': '<rootDir>/__mocks__/react-native-nfc-manager.js',
    '^redux-persist/lib/storage$': '<rootDir>/__mocks__/redux-persist/lib/storage.js',
    '^@react-native-clipboard/clipboard$': '<rootDir>/__mocks__/react-native-clipboard.js',
    '^@react-native-community/netinfo$': '<rootDir>/__mocks__/react-native-community-netinfo.js',
    '^@react-native-firebase/messaging$': '<rootDir>/__mocks__/react-native-firebase-messaging.js',
  },
  moduleDirectories: ['node_modules', 'src'],
};

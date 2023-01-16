module.exports = {
    verbose: true,
    preset: 'react-native',
    setupFiles: [
        // "./test-setup.js",
        './node_modules/react-native-gesture-handler/jestSetup.js'
    ],
    setupFilesAfterEnv: [
        "./test-setup.js",
    ],
    transformIgnorePatterns: [
        'node_modules/(?!(jest-)?@?react-native|@react-native-community|@react-navigation)',
    ],
    moduleNameMapper: {
        "\\.svg": "<rootDir>/__mocks__/svgMock.js"
    },
    moduleDirectories: [
        'node_modules',
        './src/utils',
        './src/core',
        // './',
    ],
}
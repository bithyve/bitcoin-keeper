module.exports = {
  presets: ['module:metro-react-native-babel-preset', '@babel/preset-env'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./'],
        alias: {
          /**
           * Regular expression is used to match all files inside `./src` directory and map each `.src/folder/[..]` to `~folder/[..]` path
           */
          '^~(.+)': './src/\\1',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.tsx', '.ts', '.native.js'],
      },
    ],
    'react-native-reanimated/plugin',
    ['@babel/plugin-proposal-private-methods', { loose: true }],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
  ],
};

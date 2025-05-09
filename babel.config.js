module.exports = function override(api) {
  const isProd = api.cache(() => process.env.NODE_ENV === 'production');

  const commonConfig = {
    presets: ['module:@react-native/babel-preset'],
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
          extensions: [
            '.ios.js',
            '.android.js',
            '.js',
            '.jsx',
            '.json',
            '.tsx',
            '.ts',
            '.native.js',
          ],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };

  if (isProd) {
    commonConfig.plugins = [...commonConfig.plugins, ['transform-remove-console']];
  }
  return commonConfig;
};

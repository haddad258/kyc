module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@components': './src/components',
            '@screens': './src/screens',
            '@store': './src/store',
            '@services': './src/services',
            '@navigation': './src/navigation',
            '@constants': './src/constants',
          },
        },
      ],
      'react-native-reanimated/plugin', // must be last
    ],
  };
};

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // Required by react-native-reanimated (which the drawer relies on); the
    // worklets plugin has to stay last in the list.
    plugins: ['react-native-worklets/plugin'],
  };
};

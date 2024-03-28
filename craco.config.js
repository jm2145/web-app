module.exports = {
    webpack: {
      configure: (webpackConfig, { env, paths }) => {
        webpackConfig.resolve.fallback = {
          "util": require.resolve("util/"), // Already correct
          "path": require.resolve("path-browserify/") // Add this line for 'path' fallback
        };
        return webpackConfig;
      },
    },
  };
  
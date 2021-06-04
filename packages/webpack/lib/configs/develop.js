const { dirname, relative } = require('path');
const { EnvironmentPlugin, HotModuleReplacementPlugin } = require('webpack');
const { join, trimSlashes } = require('pathifist');
const getModules = require('../utils/modules');

module.exports = function getConfig(config, name) {
  const getAssetPath = (...arg) => trimSlashes(join(config.assetPath, ...arg));

  const jsLoaderConfig = {
    test: [/\.m?js$/],
    // eslint-disable-next-line no-useless-escape
    exclude: [/node_modules[\/\\](webpack[\/\\]buildin|core-js)/],
    loader: require.resolve('babel-loader'),
    options: {
      babelrc: false,
      compact: false,
      cacheDirectory: true,
      cacheIdentifier: `development:${name}`,
      presets: [
        [
          require.resolve('@babel/preset-env'),
          {
            modules: false,
            useBuiltIns: 'usage',
            targets: { browsers: config.browsers },
            corejs: 3,
            include: [],
            exclude: [],
          },
        ],
      ],
      plugins: [],
      sourceType: 'unambiguous',
    },
  };

  const fileLoaderConfig = {
    exclude: [/\.(?:m?js|html|json)$/],
    type: 'asset/resource',
    generator: {
      filename: getAssetPath('[name]-[contenthash:16].[ext]'),
    },
  };

  const urlLoaderConfig = {
    test: [/\.(png|gif|jpe?g|webp)$/],
    oneOf: [
      {
        resourceQuery: /noinline/,
        ...fileLoaderConfig,
      },
      {
        type: 'asset',
        generator: {
          filename: getAssetPath('[name]-[contenthash:16].[ext]'),
        },
        parser: {
          dataUrlCondition: {
            maxSize: 10000,
          },
        },
      },
    ],
  };

  const allLoaderConfigs = [jsLoaderConfig, urlLoaderConfig, fileLoaderConfig];

  return {
    // invalid for webpack, needed with hops mixins
    loaderConfigs: {
      jsLoaderConfig,
      urlLoaderConfig,
      fileLoaderConfig,
      allLoaderConfigs,
    },
    name,
    // fixme
    target: ['web', 'es5'],
    mode: 'development',
    context: config.rootDir,
    entry: require.resolve('../shims/develop'),
    output: {
      path: config.buildDir,
      publicPath: '/',
      pathinfo: true,
      filename: getAssetPath(`${config.name}.js`),
      chunkFilename: getAssetPath(`${config.name}-[id].js`),
      devtoolModuleFilenameTemplate: (info) =>
        relative(config.rootDir, info.absoluteResourcePath),
    },
    // fixme
    cache: {
      type: 'memory',
    },
    resolve: {
      modules: getModules(config.rootDir),
      alias: {
        'hops/entrypoint': config.rootDir,
        'regenerator-runtime': dirname(
          require.resolve('regenerator-runtime/package.json')
        ),
        'core-js': dirname(require.resolve('core-js/package.json')),
      },
      extensions: ['.mjs', '.js'],
      mainFields: [
        'esnext:browser',
        'jsnext:browser',
        'browser',
        'module',
        'esnext',
        'jsnext',
        'esnext:main',
        'jsnext:main',
        'main',
      ],
    },
    module: {
      rules: [{ oneOf: allLoaderConfigs }],
    },
    externals: [],
    optimization: {
      splitChunks: { chunks: 'all' },
      moduleIds: 'named',
    },
    plugins: [
      new HotModuleReplacementPlugin(),
      new EnvironmentPlugin({ NODE_ENV: 'development' }),
    ],
    performance: {
      hints: false,
      maxEntrypointSize: 5242880,
      maxAssetSize: 52428800,
    },
    infrastructureLogging: {
      level: 'none',
    },
    devtool: 'eval-cheap-module-source-map',
    watchOptions: { aggregateTimeout: 300, ignored: /node_modules/ },
  };
};

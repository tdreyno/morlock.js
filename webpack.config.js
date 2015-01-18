var webpack = require('webpack');

module.exports = {
  entry: './src/morlock/index.js',

  resolve: {
    root: __dirname + '/src'
  },

  output: {
    path: __dirname + '/dist',
    filename: 'morlock.js'
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|dist|demos|src\/vendor/,
        loader: 'jshint-loader'
      }
    ],

    loaders: [
      {
        test: require.resolve('./src/morlock/index'),
        loader: 'expose?morlock'
      },
      {
        test: /\.js$/,
        exclude: /node_modules|dist|demos/,
        loader: '6to5-loader?runtime'
      }
    ]
  },

  plugins: [
    new webpack.ProvidePlugin({
      to5Runtime: 'imports?global=>{}!exports-loader?global.to5Runtime!6to5/runtime'
    })
  ],

  jshint: {}
};

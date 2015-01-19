var webpack = require('webpack');

module.exports = {
  entry: './index.js',

  output: {
    path: __dirname + '/dist',
    filename: 'morlock.js'
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|dist|demos|vendor|test|externs/,
        loader: 'jshint-loader'
      }
    ],

    loaders: [
      {
        test: require.resolve('./index'),
        loader: 'expose?morlock'
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

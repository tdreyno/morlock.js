module.exports = {
  entry: "./index.js",

  resolve: {
    root: __dirname
  },

  output: {
    path: __dirname + "/dist",
    filename: "morlock.js"
  },

  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|vendor|dist|demo/,
        loader: "jshint-loader"
      }
    ],

    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules|vendor|dist|demo/,
        loader: 'esnext'
      }
    ]
  },

  jshint: {
    browser: true,
    esnext: true,
    unused: true,
    strict: true,
    trailing: true,
    eqnull: true,
    expr: true,
    boss: true,
    "-W097": true, // Module strict checking
    "-W041": true, // Comparing == against 0
    globals: {
      window: true,
      document: true,
      jQuery: true
    }
  }
};
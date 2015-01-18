var webpack = require('webpack');

module.exports = function(config) {
  config.set({
    browsers: ['PhantomJS'],

    singleRun: process.env.CONTINUOUS_INTEGRATION === 'true',

    frameworks: ['mocha'],

    files: [
      'test/*_tests.js'
    ],

    preprocessors: {
      'test/*_tests.js': [ 'webpack' ]
    },

    reporters: [ 'dots' ],

    webpack: require('./webpack.config.js'),

    webpackServer: {
      noInfo: true
    }
  });
};

module.exports = function (grunt) {
  "use strict";

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  var webpack = require('webpack');
  var webpackConfig = require('./webpack.config.js');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    clean: {
      build: {
        src: ["dist", "tmp"]
      }
    },

    'mocha_phantomjs': {
      all: ["test/*.html"]
    },

    webpack: {
      options: webpackConfig,

      dist: {
        watch: false
      },
      minimize: {
        watch: false,
        output: {
          filename: 'morlock.min.js'
        },
        plugins: webpackConfig.plugins.concat(
          new webpack.DefinePlugin({
            "process.env": {
              "NODE_ENV": JSON.stringify("production")
            }
          }),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin()
        )
      }
    },

    "webpack-dev-server": {
      options: {
        webpack: webpackConfig,
        publicPath: "/" + webpackConfig.output.publicPath
      },
      start: {
        keepAlive: true,
        webpack: {
          devtool: "eval",
          debug: true
        }
      }
    },

    release: {
      options: {
        additionalFiles: ['bower.json'],
        github: {
          repo: 'tdreyno/morlock.js',
          usernameVar: 'GITHUB_USERNAME',
          passwordVar: 'GITHUB_MORLOCK_KEY'
        }
      }
    }
  });

  grunt.registerTask('watch', ['clean', 'webpack-dev-server:start']);
  grunt.registerTask('build', ['clean', 'webpack:dist', 'webpack:minimize']);
  grunt.registerTask('default', ['build']);
};

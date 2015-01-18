module.exports = function (grunt) {
  "use strict";

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

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
        file: 'bower.json',
        npm: false/*,
        github: { 
          repo: 'tdreyno/morlock.js',
          usernameVar: 'GITHUB_USERNAME',
          passwordVar: 'GITHUB_MORLOCK_KEY'
        }*/
      }
    }
  });

  grunt.registerTask('watch', ['clean', 'webpack-dev-server:start']);
  grunt.registerTask('build', ['clean', 'webpack:dist']);
  grunt.registerTask('default', ['build']);
};

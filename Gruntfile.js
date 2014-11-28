module.exports = function (grunt) {
  "use strict";

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'mocha_phantomjs': {
      all: ["test/*.html"]
    },

    release: {
      options: {
        file: 'bower.json',
        npm: false
      }
    }
  });

  grunt.registerTask('test', ['mocha_phantomjs']);
  grunt.registerTask('default', [
    'build'
  ]);
};

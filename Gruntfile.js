module.exports = function (grunt) {
  "use strict";

  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      options: {
        browser: true,
        node: true,
        forin: true,
        curly: true,
        camelcase: true,
        immed: true,
        indent: 2,
        latedef: true,
        newcap: true,
        noempty: true,
        nonbsp: true,
        nonew: true,
        undef: true,
        unused: true,
        strict: true,
        trailing: true,
        eqnull: true,
        "-W041": true, // Comparing == against 0
        globals: {
          define: true,
          Modernizr: true
        }
      },
      all: ['Gruntfile.js', 'dist/morlock/**/*.js']
    },

    clean: {
      build: {
        src: ["dist", "tmp"]
      }
    },

    transpile: {
      amd: {
        type: 'amd',
        files: [{
          expand: true,
          cwd: 'src/',
          src: ['**/*.js'],
          dest: 'dist/'
        }]
      }
    },

    requirejs: {
      options: {
        name: "../vendor/almond",
        include: ["morlock/base"],
        insertRequire: ['morlock/base'],
        baseUrl: "dist/",
        wrap: {
          startFile: ['vendor/modernizr.js', 'frags/start.frag'],
          endFile: 'frags/end.frag'
        }
      },

      dist: {
        options: {
          out: 'dist/<%= pkg.name %>.min.js'
        }
      },

      dev: {
        options: {
          optimize: 'none',
          out: 'dist/<%= pkg.name %>.js'
        }
      }
    },

    'mocha_phantomjs': {
      all: ["test/*.html"]
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

  this.registerTask('build', ['clean', 'transpile:amd', 'requirejs']);
  grunt.registerTask('hint', ['build', 'jshint']);
  grunt.registerTask('test', ['build', 'jshint', 'mocha_phantomjs']);
  grunt.registerTask('default', [
    'build'
  ]);
};

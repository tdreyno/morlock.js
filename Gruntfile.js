module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    jshint: {
      all: ['Gruntfile.js', 'src/**/*.js']
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
          dest: 'tmp/'
        }]
      }
    },

    requirejs: {
      dist: {
        options: {
          name: "../vendor/almond",
          include: ["morlock"],
          insertRequire: ['morlock'],
          baseUrl: "tmp/",
          out: 'dist/<%= pkg.name %>-<%= pkg.version %>.min.js',
          wrap: {
            startFile: 'frags/start.frag',
            endFile: 'frags/end.frag'
          }
        }
      }
    },

    compress: {
      dist: {
        options: {
          mode: 'gzip'
        },
        expand: true,
        cwd: 'dist/',
        src: ['*.js'],
        dest: 'dist/'
      }
    },

    mocha_phantomjs: {
      all: ["test/*.html"]
    },

    casperjs: {
      options: {
        async: {
          parallel: true
        }
      },
      files: ['test/casperjs/**/*.js']
    }
  });

  this.registerTask('build', ['clean', 'transpile:amd', 'requirejs:dist', 'compress:dist']);
  grunt.registerTask('test', ['build', 'mocha_phantomjs', 'casperjs']);
  grunt.registerTask('default', [
    'build'
  ]);
};

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
        src: ["dist"]
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
      dist: {
        options: {
          name: "../vendor/almond",
          include: ["morlock/base"],
          insertRequire: ['morlock/base'],
          baseUrl: "dist/",
          out: 'dist/<%= pkg.name %>.min.js',
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
    },

    release: {
      options: {
        bump: false,
        file: 'bower.json',
        npm: false,
        github: { 
          repo: 'tdreyno/morlock.js',
          usernameVar: 'GITHUB_USERNAME',
          passwordVar: 'GITHUB_MORLOCK_KEY'
        }
      }
    }
  });

  this.registerTask('build', ['clean', 'transpile:amd', 'requirejs:dist', 'compress:dist']);
  grunt.registerTask('test', ['build', 'mocha_phantomjs', 'casperjs']);
  grunt.registerTask('default', [
    'build'
  ]);
};

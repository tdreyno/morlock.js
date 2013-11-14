module.exports = function (grunt) {
  // load all grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

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
      dist: {
        options: {
          name: "../vendor/almond",
          include: ["morlock"],
          insertRequire: ['morlock'],
          baseUrl: "dist/",
          out: 'dist/<%= pkg.name %>-<%= pkg.version %>.js',
          wrap: {
            startFile: 'frags/start.frag',
            endFile: 'frags/end.frag'
          }
        }
      }
    },

    // concat: {
    //   dist: {
    //     src: ['dist/<%= pkg.name %>/*.js'],
    //     dest: 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
    //   },
    //   test: {
    //     src: ['dist/<%= pkg.name %>-<%= pkg.version %>.min.js'],
    //     dest: 'tmp/<%= pkg.name %>.min.js'
    //   }
    // },

    // uglify: {
    //   dist: {
    //     options: {
    //       banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
    //       '<%= grunt.template.today("yyyy-mm-dd") %> */',
    //       mangle: true
    //     },
    //     files: {
    //       'dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['dist/<%= pkg.name %>-<%= pkg.version %>.js'],
    //     }
    //   }
    // },

    mocha_phantomjs: {
      all: ["test/**/*.html"]
    }
  });

  this.registerTask('build', ['clean', 'transpile:amd', 'requirejs:dist']);
  grunt.registerTask('test', ['build', 'mocha_phantomjs']);
  grunt.registerTask('default', [
    'build'
  ]);
};

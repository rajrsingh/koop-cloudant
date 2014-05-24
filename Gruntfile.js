/**
 * Gruntfile
 *
 */

module.exports = function (grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    mochaTest: {
      test: {
        options: {
          reporter: 'nyan',
          timeout: 30000
        },
        src: ['./test/*.js'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.registerTask('test', [ 'mochaTest:test' ]);
};

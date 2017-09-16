module.exports = function (grunt) {
    
      grunt.initConfig({
        copy: {
          main: {
            files: [
              {
              cwd: 'bower_components',
              src: ['**/*.js'],
              dest: 'app/lib',
              expand: true
              }
            ]
          }
        }
      });
    
      grunt.loadNpmTasks('grunt-contrib-copy');
    
      // Default task(s).
      grunt.registerTask('build', ['copy']);
    
    };
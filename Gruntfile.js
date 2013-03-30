module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
  	watch: {
  	    //files: 'css/**/*.less',
        files: ['css/**/*.less', 'js/**/*.js'],
  	    tasks: ['less', 'uglify']
  	},
    less: {
      development: {
        options: {
          paths: ["css/less"]
        },
        files: {
          "css/app.css": "css/less/app.less"
        }
      },
      production: {
        options: {
          paths: ["css/less"],
          yuicompress: true
        },
        files: {
          "css/app-prod.css": "css/less/app.less"
        }
      }
    }, 
    /*minified: {
        dist: {
          src:  ['js/lib/toaster.js', 'js/lib/twit.js', 'js/lib/jquery.autogrowtextarea.min.js', 'js/app.js'],
          dest: 'js/compress.js'
        }
      }*/
    uglify: {
        options: {
          beautify: false,
          mangle: false
        },
        my_target: {
          files: {
            'js/output.min.js': ['js/lib/toaster.js', 'js/lib/twit.js', 'js/lib/jquery.autogrowtextarea.min.js', 'js/app.js']
          }
        }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-minified');
  //grunt.loadNpmTasks('grunt-amd-dist');
  grunt.loadNpmTasks('grunt-contrib-uglify');

};

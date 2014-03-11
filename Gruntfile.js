module.exports = function(grunt) {
  grunt.initConfig({
    sass: {
      dist: {
        options: {
          style: 'compressed',
          compass: true
        },
        files: {
          'assets/css/app.css' : 'assets/sass/app.scss'
        }
      }
    },
    watch: {
      css: {
        files: 'assets/**/*.scss',
        tasks: ['sass']
      },
      frontend: {
        files: [
          './bower_components/jquery/dist/jquery.js',
          './bower_components/jquery-placeholder/jquery.placeholder.js',
          './bower_components/jquery.cookie/jquery.cookie.js',
          './bower_components/fastclick/lib/fastclick.js',
          './bower_components/foundation/js/foundation.js',
          './bower_components/angular/angular.js',
          './bower_components/angular-route/angular-route.js',
          './bower_components/angular-sanitize/angular-sanitize.js',
          './bower_components/ngprogress/build/ngProgress.js',
          './bower_components/modernizr/modernizr.js',
          './bower_components/instantclick/instantclick.js',
          './assets/js/script.js'
        ],   
        tasks: ['concat:frontend','uglify:frontend'],
        options: {
          livereload: true
        }
      },
    },
    concat: {
      options: {
        separator: ';',
      },
      frontend: {
        src: [
          './bower_components/jquery/dist/jquery.js',
          './bower_components/jquery-placeholder/jquery.placeholder.js',
          './bower_components/jquery.cookie/jquery.cookie.js',
          './bower_components/fastclick/lib/fastclick.js',
          './bower_components/foundation/js/foundation.js',
          './bower_components/angular/angular.js',
          './bower_components/angular-route/angular-route.js',
          './bower_components/angular-sanitize/angular-sanitize.js',
          './bower_components/ngprogress/build/ngProgress.js',
          './bower_components/modernizr/modernizr.js',
          './bower_components/instantclick/instantclick.js',
          './assets/js/script.js'
        ],
        dest: './assets/js/package.js',
      },
    },
    uglify: {
      options: {
        mangle: false
      },
      frontend: {
        files: {
          './assets/js/package.js': './assets/js/package.js',
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('default', ['watch']);
};

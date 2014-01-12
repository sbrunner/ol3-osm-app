module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            gc: ['Gruntfile.js', 'js/ol3-osm-map.js']
        },
        uglify: {
            options: {
            },
            gc_tmp: {
                files: {
                    'tmp/ol3-osm-map.min.js': ['js/jquery.js', 'js/jquery-ui-1.10.3.custom.js', 'js/ol3-osm-map.js']
                }
            },
            gc: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    compress: false
                },
                files: {
                    'build/ol3-osm-map.min.js': ['js/ol-simple.js', 'tmp/ol3-osm-map.min.js']
                }
            }
        },
        csslint: {
            gc: {
                options: {
                    "box-model": false,
                    'adjoining-classes': false
                },
                src: ['css/ol3-osm-map.css']
            }
        },
        cssmin: {
            combine: {
                files: {
                    'build/ol3-osm-map.css': ['css/jquery-ui-1.10.3.custom.min.css', 'css/ol.css', 'css/ol3-osm-map.css']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
  

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'csslint', 'uglify', 'cssmin']);

};

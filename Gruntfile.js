module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            "ol3-osm-app": ['Gruntfile.js', 'js/ol3-osm-app.js']
        },
        uglify: {
            options: {
            },
            "ol3-osm-app_tmp": {
                files: {
                    'tmp/ol3-osm-app.min.js': ['js/handlebars-v1.3.0.js', 'js/jquery.js', 'js/jquery-ui-1.10.3.custom.js', 'js/ghrequest.js', 'js/ol3-osm-app.js']
                }
            },
            "ol3-osm-app": {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    compress: false
                },
                files: {
                    'build/ol3-osm-app.min.js': ['js/ol-simple.js', 'tmp/ol3-osm-app.min.js']
                }
            }
        },
        csslint: {
            "ol3-osm-app": {
                options: {
                    "box-model": false,
                    'adjoining-classes': false,
                    'qualified-headings': false,
                    'overqualified-elements': false
                },
                src: ['css/ol3-osm-app.css']
            }
        },
        cssmin: {
            "ol3-osm-app": {
                files: {
                    'build/ol3-osm-app.css': ['css/jquery-ui-1.10.3.custom.min.css', 'css/ol.css', 'css/ol3-osm-app.css']
                }
            }
        },
        copy: {
            copy_images: {
                files: [
                    { expand: true, cwd: 'css', src: ['images/**'], dest: 'build' },
                ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-csslint');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
  

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'csslint', 'uglify', 'cssmin', 'copy']);

};

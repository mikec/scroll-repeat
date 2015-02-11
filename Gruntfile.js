/* global module */

module.exports = function(grunt) {

    var gruntConfig = {
        pkg: grunt.file.readJSON('package.json'),

        karma: {
            unit: {
                configFile: './karma.conf.js',
                autoWatch: false,
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },

        jshint: {
            options: {
                browser: true,
                maxlen: 120,
                unused: true,
                undef: true,
                globals: {
                    angular: false
                }
            },
            src: {
                files: {
                    src: [
                        'src/**/*.js',
                        '!src/**/*_test.js'
                    ]
                }
            }
        },

        clean: { dist: 'dist' },

        copy: {
            unmin: {
                src: 'src/component.js',
                dest: 'dist/component.js'
            }
        },

        uglify: {
            component: {
                files: {
                    'dist/component.min.js': ['src/component.js']
                }
            }
        },

        watch: {
            options: {
                livereload: true
            },
            rebuild: {
                files: [
                    'src/**/*',
                    'demo/**/*'
                ],
                tasks: 'build'
            }
        },

        connect: {
            server: {
                options: {
                    port: 8000,
                    livereload: true
                }
            }
        }
    };

    grunt.initConfig(gruntConfig);

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('check', ['jshint']);

    grunt.registerTask('test', ['karma']);

    grunt.registerTask('package', [
        'clean',
        'copy',
        'uglify'
    ]);

    grunt.registerTask('build', [
        'check',
        'test',
        'package'
    ]);

    grunt.registerTask('default', [
        'build',
        'connect',
        'watch'
    ]);

};

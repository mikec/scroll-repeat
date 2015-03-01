/* global module */

module.exports = function(grunt) {

    var gruntConfig = {
        pkg: grunt.file.readJSON('package.json'),

        karma: {
            unit: {
                configFile: './karma.conf.js',
                autoWatch: false,
                singleRun: true,
                browsers: ['Chrome']
            }
        },

        jshint: {
            options: {
                browser: true,
                maxlen: 120,
                unused: false,
                undef: true,
                globals: {
                    angular: false,
                    console: false
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
                src: 'src/scroll-repeat.js',
                dest: 'dist/scroll-repeat.js'
            }
        },

        less: {
            unmin: {
                files: {
                    'dist/scroll-repeat.css': 'src/scroll-repeat.less'
                }
            }
        },

        uglify: {
            min: {
                files: {
                    'dist/scroll-repeat.min.js': ['src/scroll-repeat.js']
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
        'less',
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

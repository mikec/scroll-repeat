/* global module */

module.exports = function(grunt) {

    var shell = require('shelljs');

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

        clean: {
            dist: ['dist/*.js', 'dist/*.json']
        },

        copy: {
            unmin: {
                src: 'src/scroll-repeat.js',
                dest: 'dist/scroll-repeat.js'
            },
            bower: {
                src: 'bower.json',
                dest: 'dist/bower.json'
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
                    'test/**/*',
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

    grunt.registerTask('check', ['jshint', 'test']);

    grunt.registerTask('test', ['karma']);

    grunt.registerTask('package', [
        'clean',
        'copy',
        'uglify'
    ]);

    grunt.registerTask('build', [
        'check',
        'package'
    ]);

    grunt.registerTask('release-prepare', 'Set up submodule to receive a new release',
    function() {
        // Make sure we have the submodule in dist
        run("git submodule init");
        run("git submodule update");
        run("cd dist; git checkout master");
    });


    grunt.registerTask('release-commit', 'push new build to bower component repo',
    function() {
        // Stamp version
        var comp = grunt.file.readJSON('bower.json');
        var newVer = comp.version;
        grunt.log.writeln("Version: " + newVer);
        // Commit submodule
        run('cd dist; git commit -a -m"Build version '+ newVer +'"', "Commited to bower repo");
        // Tag submodule
        run('cd dist; git tag ' + newVer + ' -m"Release version '+ newVer +'"', "Tagged bower repo");
        // Commit and tag this.
        run('git commit -a -m"Build version '+ newVer +'"', "Commited to source repo");
        run('git tag ' + newVer + ' -m"Release version '+ newVer +'"', "Tagged source repo");
        run("git submodule update");
        // push?
        grunt.log.ok("DON'T FORGET TO PUSH BOTH!");
    });

    grunt.registerTask('release', [
        'release-prepare',
        'package',
        'release-commit'
    ]);

    grunt.registerTask('default', [
        'build',
        'connect',
        'watch'
    ]);

    grunt.registerTask('nocheck', [
        'package',
        'connect',
        'watch'
    ]);

    function run(cmd, msg){
        shell.exec(cmd, {silent:true});
        if( msg ){
            grunt.log.ok(msg);
        }
    }

};

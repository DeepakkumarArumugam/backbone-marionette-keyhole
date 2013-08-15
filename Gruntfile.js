module.exports = function (grunt) {

    'use strict';

    // Project configuration.
    grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                build: {
                    src: 'src/<%= pkg.name %>.js',
                    dest: 'build/<%= pkg.name %>.<%= pkg.version %>.min.js'
                }
            },
            jshint: {
                all: ['Gruntfile.js', 'src/**/*.js', 'test/spec/*.js']
            },
            connect: {
                server: {
                    options: {
                        port: 8000,
                        base: '.'
                    }
                }
            },
            qunit: {
                all: {
                    options: {
                        urls: [
                            'http://localhost:<%= connect.server.options.port %>/test/qunit.html'
                        ]
                    }
                }
            },
            jasmine: {
                taskName: {
                    src: 'src/**/*.js',
                    options: {
                        specs: 'test/spec/*.spec.js',
//                        helpers: 'spec/*.helper.js',
                        host: 'http://127.0.0.1:<%= connect.server.options.port %>/',
                        keepRunner: true,
                        template: require('grunt-template-jasmine-requirejs'),
                        templateOptions: {
                            requireConfig: {
                                baseUrl: './',
                                paths: {
                                    'jquery': 'test/lib/jquery/jquery-1.9.0.min',
                                    'underscore': 'test/lib/underscore/underscore-min',
                                    'backbone': 'test/lib/backbone/backbone',
                                    'marionette': 'test/lib/marionette/backbone.marionette',
                                    'backbone.wreqr': 'test/lib/backbone/backbone.wreqr.min',
                                    'backbone.babysitter': 'test/lib/backbone/backbone.babysitter.min'
                                },
                                shim: {
                                    'jquery': {
                                        exports: '$'
                                    },
                                    'underscore': {
                                        exports: '_'
                                    },
                                    'backbone': {
                                        deps: ['underscore', 'jquery'],
                                        exports: 'Backbone'
                                    },
                                    'marionette': {
                                        deps: ['backbone'],
                                        exports: 'Backbone.Marionette'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            bumpup: {
                file: 'package.json'
            },
            tagrelease: {
                file: 'package.json',
                commit: true,
                message: 'Release %version%',
                annotate: true
            }
        }
    );

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-bumpup');
    grunt.loadNpmTasks('grunt-tagrelease');

    grunt.registerTask('default', ['uglify']);
    grunt.registerTask('test', ['jshint', 'connect', 'jasmine']);
    grunt.registerTask('qunit-test', ['connect', 'qunit']);

    grunt.registerTask('package', ['test', 'uglify']);

    grunt.registerTask('deploy', ['']);

    grunt.registerTask('update-package-json', function () {
        grunt.config.set('pkg', grunt.file.readJSON('package.json'));
    });

    grunt.registerTask('bump-version', function (type) {
        if (type == 'snapshot') {
            var filePath = "package.json";
            var file = grunt.file.read(filePath);
            var meta = JSON.parse(file);
            var oldVersion = meta.version;
            var newVersion;
            if (/-SNAPSHOT$/i.test(oldVersion)) {
                newVersion = oldVersion.replace('-SNAPSHOT', '');
            } else {
                newVersion = oldVersion + '-SNAPSHOT';
            }
            meta.version = newVersion;
            // Stringify new metafile and save
            if (!grunt.file.write(filePath, JSON.stringify(meta, null, '\t'))) {
                grunt.fail.warn('Couldn\'t write to "' + filepath + '"');
            }
        } else {
            grunt.task.run('bumpup:' + type);
        }
    });

    // THIS TASK WILL RELEASE THE CURRENT -SNAPSHOT, TAG IT IN GIT, PACKAGE IT, PUSH IT TO THE CDN, AND INCREMENT TO THE NEXT -SNAPSHOT
    grunt.registerTask('release', function (type) {
        var _version = grunt.config.get('pkg').version;
        if (!/-SNAPSHOT$/i.test(_version)) {
            grunt.fail.warn('You can not release a version, must be a -SNAPSHOT.  Current version: ' + _version);
        }
        type = type ? type : 'patch';
        if (!/^(major|minor|patch)$/i.test(type)) {
            grunt.fail.warn('You can not release a "' + type + '" : must be type "major", "minor", "patch"');
            return;
        }
        grunt.task.run('test');
        grunt.task.run('bump-version:snapshot');
        grunt.task.run('update-package-json');
        grunt.task.run('uglify');

        // TAG IT IN GIT
        grunt.task.run('tagrelease');

        // PUSH TO THE CDN

        grunt.task.run('bump-version:' + type);
        grunt.task.run('bump-version:snapshot');
    });
}
;

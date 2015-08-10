module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        aws: grunt.file.readJSON('aws-keys.json'), // Read the file
        pkg: grunt.file.readJSON('package.json'),
        imagemin: {
            dynamic: {                         // Another target
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'img/',                   // Src matches are relative to this path
                    src: ['**/*.{png,jpg,gif}'],   // Actual patterns to match
                    dest: 'dist/img/'                  // Destination path prefix
                }]
            }
        },
        htmlmin: {                                     // Task
            dist: {                                      // Target
                options: {                                 // Target options
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {                                   // Dictionary of files
                    'dist/index.html': 'dist/index.html'     // 'destination': 'source'
                }
            }
        },
        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: 'dist/index.html'
        },
        copy: {
            main: {
                files: [
                    {
                        expand: true,
                        src: ['index.html'],
                        dest: 'dist/'
                    },
                    {
                        expand: true,
                        cwd: 'font-awesome',
                        src: ['fonts/**'],
                        dest: 'dist/'
                    }
                ]
            }
        },
        clean: {
            before: [".tmp", "dist", "dest", "public"],
            after: [".tmp"]
        },
        compress: {
            main: {
                options: {
                    mode: 'gzip'
                },
                expand: true,
                cwd: 'assets/',
                src: ['**/*'],
                dest: 'public/'
            }
        },
        aws_s3: {
            options: {
                accessKeyId: '<%= aws.AWSAccessKeyId %>', // Use the variables
                secretAccessKey: '<%= aws.AWSSecretKey %>', // You can also use env variables
                region: 'us-west-2',
                uploadConcurrency: 5, // 5 simultaneous uploads
                downloadConcurrency: 5 // 5 simultaneous downloads
            },
            production: {
                options: {
                    bucket: 'quantessential.io'
                },
                files: [
                    {
                        expand: true,
                        cwd: 'dist/',
                        src: ['**'],
                        dest: '/'
                    }
                    //,
                    //{expand: true, cwd: 'assets/prod/large', src: ['**'], dest: 'assets/large/', stream: true}, // enable stream to allow large files
                    //{expand: true, cwd: 'assets/prod/', src: ['**'], dest: 'assets/', params: {CacheControl: '2000'}},
                    //// CacheControl only applied to the assets folder
                    // LICENCE inside that folder will have ContentType equal to 'text/plain'
                ]
            }
            ,
            clean_production: {
                options: {
                    bucket: 'quantessential.io',
                    debug: false // Doesn't actually delete but shows log
                },
                files: [
                    {
                        dest: '/',
                        action: 'delete'
                    }
                ]
            }
        },
        less: {
            development: {
                options: {
                    paths: ["less"]
                },
                files: {
                    "less/grayscale.css": "less/grayscale.less"
                }
            }
            //,
            //production: {
            //    options: {
            //        paths: ["assets/css"],
            //        plugins: [
            //            new require('less-plugin-autoprefix')({browsers: ["last 2 versions"]}),
            //            new require('less-plugin-clean-css')(cleanCssOptions)
            //        ],
            //        modifyVars: {
            //            imgPath: '"http://mycdn.com/path/to/images"',
            //            bgColor: 'red'
            //        }
            //    },
            //    files: {
            //        "path/to/result.css": "path/to/source.less"
            //    }
            //}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-aws-s3');
    grunt.loadNpmTasks('grunt-contrib-compress');

    // Default task(s).
    grunt.registerTask('default', ['clean:before']);

    // Build Task
    grunt.registerTask('build', ['clean:before'
        , 'useminPrepare'
        , 'concat:generated'
        , 'cssmin:generated'
        , 'uglify:generated'
        , 'copy'
        , 'usemin'
        , 'htmlmin'
        , 'imagemin'
        , 'clean:after'
    ]);

    // Default task(s).
    grunt.registerTask('dist', ['build'
        , 'aws_s3:clean_production'
        , 'aws_s3:production'
    ]);

    grunt.registerTask('play',['less'])

};

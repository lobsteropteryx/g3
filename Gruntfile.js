/**
 * Created by Ian on 1/24/14.
 */
module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            components: {
                src: [
                    'www/js/**/*js'
                ],
                options: {
                    specs: 'www/spec/javascripts/**/*Spec.js',
                    keepRunner : true,
                    helpers: 'www/spec/*.js',
                    vendor: 'www/spec/javascripts/lib/jasmine-jquery.js'
                }
            }
        }
    });

    // Load the plugin that provides the task.
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Default task(s).
//    grunt.registerTask('travis', [
//        /*'jshint',*/'jasmine'
//    ]);
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('default', ['test']);

};
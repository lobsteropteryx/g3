require.config({
    baseUrl: "js",
    paths: {
        src: '.',
        jquery: 'lib/jquery-2.0.3.min',
        underscore: 'lib/underscore-min',
        backbone: 'lib/backbone-min',
        moment: 'lib/moment.min',
        text: 'lib/text'
    },
    shim: {
        underscore: {
            exports: "_"
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

require(['src/App', 'src/views/ViewExtensions'], function (App, ViewExtensions) { 'use strict';
    document.ontouchmove = function(e){
        e.preventDefault();
    };
    App.initialize();
});
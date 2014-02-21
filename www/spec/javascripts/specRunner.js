(function() {

    require.config({
        //urlArgs: 'cb=' + Math.random(),
        //baseUrl: "../www/",
        paths: {
            'src': '../../js/',
            'jquery': '../../js/lib/jquery-2.0.3.min',
            'underscore': '../../js/lib/underscore-min',
            'backbone': '../../js/lib/backbone-min',
            'jasmine': 'lib/jasmine-2.0.0/jasmine',
            'jasmine-html': 'lib/jasmine-2.0.0/jasmine-html',
            'jasmine-jquery': 'lib/jasmine-jquery/jasmine-jquery',
            'boot': 'lib/jasmine-2.0.0/boot'
        },
        shim: {
            underscore: {
                exports: "_"
            },
            backbone: {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            'jasmine': {
                exports: 'jasmine'
            },
            'jasmine-html': {
                deps: ['jasmine'],
                exports: 'jasmine'
            },
            'jasmine-jquery': {
                deps: ['jasmine', 'jasmine-html', 'jquery'],
                exports: 'jasmine'
            },
            'boot': {
                deps: ['jasmine', 'jasmine-html'],
                exports: 'jasmine'
            }
        }
    });

    var specs = [
        'util/CoordinateConverterSpec',
        'util/DateSpec',
        'util/DBSpec',
        'util/EncoderSpec',
        'util/NearestNeighborSpec',
        'models/CurrentPositionSpec',
        'views/CautionSpec'
    ];

    require(['boot', 'jasmine-jquery'], function () {

        // Load the specs
        require(specs, function () {

            // Initialize the HTML Reporter and execute the environment (setup by `boot.js`)
            window.onload();
        });
    });

})();


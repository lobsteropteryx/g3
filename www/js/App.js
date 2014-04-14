define(['jquery',
    'underscore',
    'backbone',
    'src/Router',
    'src/util/Geolocation',
    'src/util/DB',
    'src/util/Controller',
    'src/models/Splash',
    'src/views/Splash'
    ], function($, _, Backbone, Router, Geolocation, DB, Controller, Splash, SplashView) { 'use strict';

     var my = {};
    _.extend(my, Backbone.Events);

    my.isInitialized = false;

    my.initialize = function () {
        document.addEventListener('deviceready', _.bind(this.onDeviceReady, this), false);
    };

    my.onDeviceReady = function () {
        Controller.router = new Router();
        Backbone.history.start();

        if (this.isInitialized) {
            Controller.router.navigate('home', {trigger: true, replace: true});
        } else {
            this.showSplash();
        }
    };

    my.showSplash = function () {
        this.Startup = new Splash();
        Controller.router.loadView(new SplashView({model: this.Startup}));
        this.Startup.set('message', 'Initializing filesystem...');
        DB.initialize().then(_.bind(this.initSites, this));
    };

    my.initSites = function() {
        this.Startup.set('message', 'Loading sites from file...');
        DB.getSitesFiles().then(_.bind(function(sitesFiles) {
            if (sitesFiles.length > 0) {
                _.bind(loadSites, this, (sitesFiles.first().get('fileEntry')))();
            } else {
                exitApplication("No sites files found; please load at least one set of sites.");
            }
        }, this));
    };

    var loadSites = function(sitesFile) {
        DB.loadSites(sitesFile).then(_.bind(function (data) {
            Geolocation.SitesList = data;
            _.bind(this.initializeGps, this)();
        }, this));
    };

    var exitApplication = function(message) {
        alert(message);
        if (navigator.app) {
            navigator.app.exitApp();
        } else if (navigator.device) {
            navigator.device.exitApp();
        }
    };

    my.initializeGps = function() {
        this.Startup.set('message', 'Acquiring Satellites');
        Geolocation.start();
        this.listenTo(Geolocation.currentLatLon, 'change', this.gotGpsSignal);
        if (Geolocation.gotSignal) {
            this.gotGpsSignal();
        }
    };

     my.gotGpsSignal = function() {
         console.log("Got GPS!");
         this.stopListening(Geolocation.currentLatLon);
         Controller.router.navigate('home', {trigger: true, replace: true});
     };

    my.fail = function (error) {
        console.log('G3 error: ' + error.message);
    };

    return my;
});
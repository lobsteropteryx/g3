var app = {
    views: {},
    models: {},
    router: {},
    CoordinateConverter: {},
    NearestNeighbor: {},
    db: {},
    DateFormatter: {},
    SitesList: [],
    Here: {},
    isInitialized: false,
    startGeolocation: function() {},
    onDeviceReady: function() {}
};

$(document).on("ready", function () {
    'use strict';

    app.pageRouter = new app.Router();
    Backbone.history.start();

    app.startGeolocation = function() {
        app.watchId = app.watchId || navigator.geolocation.watchPosition(app.onPositionUpdate,
            function(error) {
                console.log(error.message);
            },
            {enableHighAccuracy:true, timeout:1000, maximumAge:0 }
        );
    };

    app.onPositionUpdate = function (position) {
        app.Startup.set('gotSignal', true); //Tell the splash screen we're good now
        var p = app.CoordinateConverter.datumShift({ Lon:position.coords.longitude, Lat:position.coords.latitude});
        var utm = app.CoordinateConverter.project(p);
        var latLon = {
            Latitude: position.coords.latitude,
            Longitude: position.coords.longitude,
            Accuracy: position.coords.accuracy
        };
        var nearest = app.NearestNeighbor.Nearest(utm, app.SitesList);
        app.Here.set({currentLatLon: latLon, currentUtm: utm, relativePosition: nearest.relativePosition, site: nearest.site});
    };

    app.stopGeolocation = function() {
        if (app.watchId !== null) {
            navigator.geolocation.clearWatch(app.watchId);
            app.watchId = null;
        }
    };

    app.onDeviceReady = function() {
        console.log("G3 Device Ready!");

        if (app.isInitialized) {
            app.pageRouter.navigate('home', true);
        } else {
            app.Startup = new app.models.Splash();
            app.Here = new app.models.CurrentPosition();
            app.pageRouter.navigate('splash', true);
        }
    };

    app.fail = function(error) {
        console.log('G3 error: ' + error.message);
    };

    document.addEventListener('deviceready', app.onDeviceReady, false);
});
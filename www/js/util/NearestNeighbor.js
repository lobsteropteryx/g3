define (['underscore',
    'src/models/RelativePosition',
    'src/models/NearestSite',
    'src/collections/NearestSiteCollection'],
    function (_, RelativePosition, NearestSite, NearestSiteCollection) { 'use strict';

    var my = {};

    my.getNearestSites = function(currentLocation, sites, numberToReturn) {
        
        var currentPoint = this.currentLocationToPoint(currentLocation),
             point,
             distance,
             currentSite,
             i,
             siteToReplace,
             nearestSites = new NearestSiteCollection();

        numberToReturn = this.checkNumberOfSites(numberToReturn, sites.length);

        nearestSites = this.initializeNearestSites(numberToReturn);

        for (i = 0; i < sites.length; i++) {
            currentSite = sites[i];
            if (currentSite.zone === currentLocation.Zone) {
                point = this.getPoint(currentSite);
                distance = getDistance(point, currentPoint);
                siteToReplace = this.getSiteToReplace(distance, nearestSites);
                if (siteToReplace !== 'undefined' && siteToReplace !== null) {
                    this.assignSite(siteToReplace, distance, currentSite, currentPoint);
                }
            }
        }
        nearestSites.comparator = function(site){return site.get('relativePosition').get('distance'); };
        nearestSites.sort();

        return nearestSites;
    };

    my.currentLocationToPoint = function(currentLocation) {
        return {x: currentLocation.Easting, y: currentLocation.Northing};
    };

    my.initializeNearestSites = function(numberOfPoints) {
        var nearestPoints = new NearestSiteCollection(),
            i;
        for (i = 0; i < numberOfPoints; i++) {
            nearestPoints.add(new NearestSite({site: {quad: '', site_id: ''}, relativePosition: new RelativePosition()}));
        }
        return nearestPoints;
    };

    my.checkNumberOfSites = function(numberOfPoints, totalNumberOfSites) {
        return numberOfPoints > totalNumberOfSites ? totalNumberOfSites : numberOfPoints;
    };

    my.getPoint = function(site) {
        return {x: site.xact || site.xth, y: site.yact || site.yth};
    };

    my.getSiteToReplace = function(distance, nearestSites) {
        var siteToReplace = null;
        nearestSites.comparator = function(nearest) {
            return -(nearest.get('relativePosition').get('distance'));
        };
        nearestSites.sort();

        nearestSites.each(function(site) {
            var currentDistance = site.get('relativePosition').get('distance');
            if (distance < currentDistance) {
                siteToReplace = site;
            }
        });

        return siteToReplace;
    };

    my.getSelectedSite = function(currentLocation, site) {
        var nearestSite = new NearestSite({site: site, relativePosition: new RelativePosition()});
        var currentPoint = this.currentLocationToPoint(currentLocation);
        var point = this.getPoint(site);
        var distance = getDistance(point, currentPoint);
        this.assignSite(nearestSite, distance, site, currentPoint);
        return nearestSite;
    };

    my.assignSite = function (furthest, distance, site, currentPoint) {
        furthest.set('site', site);
        var relativePosition = _.clone(furthest.get('relativePosition'));
        relativePosition.set('distance', Math.round(distance));
        relativePosition.set('distanceOutside', Math.round(distance - (site.grid * 0.3)));
        relativePosition.set('bearing', getBearingString(this.getPoint(site), currentPoint));
        relativePosition.set('found', true);
        furthest.set({relativePosition: relativePosition});
    };

    var getDistance = function(p2, p1) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    };

    var getBearing = function(p2, p1) {
            var dX = p2.x - p1.x;
            var dY = p2.y - p1.y;
            var phi = Math.atan2(dY, dX); // This assumes 0 degrees is at (1,0)

            if (phi < 0) {
                phi += (2 * Math.PI);
            }  // Remap Atan2 from {-180, 180} to {0, 360}

            phi = phi * (180 / Math.PI); // Convert to degrees
            phi = (phi + 270) % 360; // Rotate back 90 degrees, to put north at (0,1)
            return phi;
    };

    var getBearingString = function(p2, p1) {
        var ret = "";
        var b = getBearing(p2, p1);

        if (b >= 337.5 || b < 22.5) ret = "N";
        else if (b >= 22.5 && b < 67.5) ret = "NW";
        else if (b > 67.5 && b < 112.5) ret = "W";
        else if (b > 112.5 && b < 157.5) ret = "SW";
        else if (b >= 157.5 && b < 202.5) ret = "S";
        else if (b > 202.5 && b < 247.5) ret = "SE";
        else if (b > 247.5 && b < 292.5) ret = "E";
        else if (b >= 292.5 && b < 337.5) ret = "NE";

        return ret;
    };

    return my;
});
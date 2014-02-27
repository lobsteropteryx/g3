define(['underscore',
    'backbone',
    'src/App',
    'src/util/Date'
], function(_, Backbone, App, Date) {
    'use strict';

    var PlacementView = Backbone.View.extend({

        tagName: "div",

        className: "view",

        initialize: function(options) {
            this.template = options.template;
            this.setOperationData();
        },

        events: {
            "click #btnPlacementOk": "onOkClicked",
            "click #btnPlacementOmit": "onOmitClicked",
            "click #btnPlacementCancel": "onCancelClicked",
            "change #selectTraptype": "onTraptypeChanged"
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        onOkClicked: function() {
            var site = this.model.get("relativePosition");
            if (site.DistanceOutside > 0) {
                App.pageRouter.navigate('caution', {trigger: true, replace: true});
            } else {
                App.pageRouter.navigate('confirm', {trigger: true, replace: true});
            }
        },

        onOmitClicked: function() {
            alert("Omit is not implemented");
        },

        onCancelClicked: function() {
            App.pageRouter.navigate('home', {trigger: true, replace: true});
        },

        onTraptypeChanged: function(e) {
            var op = this.model.get('operation');
            var newValue = e.target.options[e.target.selectedIndex].text;
            op.traptype = newValue;
        },

        setOperationData: function() {
            var op = this.model.get('operation');
            var utm = this.model.get('currentUtm');
            var site = this.model.get('site');
            var latlon = this.model.get('currentLatLon');
            op.zone = utm.Zone;
            op.easting = utm.Easting;
            op.northing = utm.Northing;
            op.accuracy = latlon.Accuracy;
            op.traptype = site.trap_type;
            op.date = Date.getSitesFormatDate();
        }

    });

    return PlacementView;
});
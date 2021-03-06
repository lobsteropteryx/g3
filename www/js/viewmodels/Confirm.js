define(['jquery',
    'knockout',
    'src/util/DB',
    'src/util/Geolocation',
    'src/util/Encoder',
    'src/util/Controller',
    'src/models/Site'
], function($,
            ko,
            DB,
            Geolocation,
            Encoder,
            Controller,
            Site
    ) {

    'use strict';

    var ConfirmView = function() {

        this.site = Controller.gadget.selectedSite();

        this.op = Controller.gadget.operationalSite();

        this.confirmOperation = function(){
            var placeHolder = new Site();
            document.getElementById("btnConfirmOk").disabled = true;
            var sites = Controller.gadget.sitesList;
            if (sites.length === 0) {
                sites.push(placeHolder);
            }
            var operation = Encoder.codedString();
            // If placed location exists, retain coordinates for the sites file...
            this.op.xact = this.site.xact || this.op.xact;
            this.op.yact = this.site.yact || this.op.yact;
            this.op.zone = this.site.zone || this.op.zone;
            sites.remove(this.site);
            sites.push(this.op);
            sites.remove(placeHolder);
            DB.initialize().then(function() {
                DB.logOperation(operation).then( function() {
                    DB.saveSites(Controller.gadget.sitesList()).then( function() {
                        Controller.gadget.changeView('home');
                    });
                });
            });
            Controller.gadget.manualLock(false);
        };

        this.message = ko.computed(function(){
            var msg;
            msg = "";//<span>";//Confirm ";
            if (this.op.visit){
                if (this.op.fail_reason){
                    if (this.op.fail_reason === 'Passed'){
                        msg += this.op.fail_reason.toUpperCase() + " ";
                    } else {
                        msg += "FAILED ";
                    }
                    //msg += this.op.visit
                    msg += " QC Inspection of " + this.op.condition + " trap ";
                    if (this.op.fail_reason !== 'Passed'){
                        msg += "(" + this.op.fail_reason + ") "
                    }
                } else {
                    msg += this.op.visit + " Inspection of ";
                    msg += this.op.condition + " trap ";
                    if (this.op.condition === 'GOOD' || this.op.condition === 'DAMAGED') {
                        msg += " with " + this.op.moth_count + " moths ";
                    }
                }
            } else if (this.op.trap_type === 'Omit'){
                msg += "OMIT (" + this.op.omit_reason + ") ";
            } else {
                msg += "Placement of " + this.op.trap_type.toUpperCase() + " trap ";
                if (Controller.gadget.relativePosition().distanceOutside > 0){
                    msg += "(outside target circle) ";
                }
            }
            msg += "at site "
            msg += this.op.quad + ":" + this.op.site_id + ", coordinates ";
            msg += this.op.xact + "E, ";
            msg += this.op.yact + "N?";//</span>";
            return msg;
        }, this);
    };

    return ConfirmView;

});

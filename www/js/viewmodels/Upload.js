define(['jquery',
    'underscore',
    'knockout',
    'src/util/DB',
    'src/util/Date',
    'src/util/Controller'
], function($,
            _,
            ko,
            DB,
            DateFormatter,
            Controller
    ) {

    'use strict';

    var UploadView = function() {

        var initials = Controller.gadget.config().initials;
        var state = Controller.gadget.config().state;
        var loadDate = DateFormatter.getLoadFormatDate(Date.now());
        var batch = 'sts.' + state + '.' + DateFormatter.getBatchDate(Date.now());

        this.tag = ko.observable('');

        this.showTag = ko.observable(false);

        var backupDir = function() {
            var directory;
            DB.root.getDirectory("Backups", {create: false}, function (dirEntry) {
                directory = dirEntry;
            });
            return directory;
        };

        var activity = {
            filename: initials + loadDate,
            backup: "",
            path: DB.root.toURL() + DB.activityLog,
            transfer: new FileTransfer(),
            found: false
        };

        activity.transfer.onprogress = _.bind(function(pe){
            this.logProgress(Math.round(pe.loaded/pe.total*100));
        }, this);

        var track = {
            filename: "Track" + initials + loadDate,
            backup: "",
            path: DB.root.toURL() + DB.trackLog,
            transfer: new FileTransfer(),
            found: false
        };

        track.transfer.onprogress = _.bind(function(pe){
            this.trackProgress(Math.round(pe.loaded/pe.total*100));
        }, this);

        var job = {
            filename: "job.dat",
            path: DB.root.toURL() + "job.dat",
            transfer: new FileTransfer(),
            found: false
        };

        job.transfer.onprogress = _.bind(function(pe){
            this.jobProgress(Math.round(pe.loaded/pe.total*100));
        }, this);

        var uploadFailure = _.bind(function(){
            activity.transfer.abort();
            track.transfer.abort();
            job.transfer.abort();
            DB.root.getDirectory("Backups", {create: true, exclusive: false}, function(dirEntry){
                DB.deleteFile(dirEntry, activity.backup);
                DB.deleteFile(dirEntry, track.backup);
            });
            this.showProgress(false);
        }, this);

        var uploadSuccess = function(){
            alert('Upload Completed Successfully!');
            DB.deleteFile(DB.root, DB.activityLog);
            DB.deleteFile(DB.root, DB.trackLog);
            Controller.gadget.changeView('home');
        };

        var checkFiles = _.bind(function(){

            var deferred = new $.Deferred();

            var tag = this.tag;
            var progress = this.showProgress;
            var show = this.showTag;

            DB.jobFile(job.filename).then(
                function(){
                    DB.fileExists(DB.root, DB.activityLog).then(
                        function(){
                            activity.found = true;
                            document.getElementById("tagInput").blur();
                            DB.root.getDirectory("Backups", {create: true, exclusive: false}, function(dirEntry) {
                                DB.fileExists(dirEntry, activity.filename + tag() + ".txt").then(
                                    function () {
                                        document.getElementById("btnUpload").disabled = false;
                                        alert("A file with the name '" + activity.filename + tag() + "' was previously uploaded. Please add a unique tag (letter or number) in the text box!");
                                        show(true);
                                        progress(false);
                                        tag('');
                                        deferred.reject();
                                    },
                                    function () {
                                        activity.filename = activity.filename + tag();
                                        activity.backup = activity.filename + ".txt";
                                        track.filename = track.filename + tag();
                                        track.backup = track.filename + ".txt";
                                        DB.backUp(DB.activityLog, activity.backup).then(
                                            DB.fileExists(DB.root, DB.trackLog).then(
                                                function (fileEntry) {
                                                    fileEntry.file(function(file){
                                                        track.size = file.size / 1000;
                                                    })
                                                    track.found = true;
                                                    DB.backUp(DB.trackLog, track.backup).then(function () {
                                                        deferred.resolve();
                                                    });
                                                },
                                                function () {
                                                    deferred.resolve();
                                                }
                                            )
                                        );
                                    }
                                );
                            });
                        },
                        function(){
                            alert("No activity log found! Please try again after a placement or inspection has been completed.");
                            Controller.gadget.changeView('home');
                            deferred.reject();
                        }
                    )
                },
                function(){
                    deferred.reject();
                }
            );
            return deferred.promise();
        }, this);

        this.showProgress = ko.observable(false);

        this.logProgress = ko.observable(0);
        this.trackProgress = ko.observable(0);
        this.jobProgress = ko.observable(0);

        this.progress = ko.computed(function(){
            var total = 3;
            var percent = (this.logProgress()/total) + (this.trackProgress()/total) + (this.jobProgress()/total);
            console.log(percent + '%');
            return percent + '%';
        }, this);

        this.cancel = function(){
            uploadFailure();
            Controller.gadget.changeView('home');
        };

        this.upload = function(){

            this.showProgress(true);
            document.getElementById("btnUpload").disabled = true;

            checkFiles().then(
                function(){
                    DB.uploadFile(activity.transfer, activity.path, batch, activity.filename).then(
                        function () {
                            if (Controller.gadget.config().track && track.found && track.size < 30000) {
                                DB.uploadFile(track.transfer, track.path, batch, track.filename).then(
                                    function () {
                                        DB.uploadFile(job.transfer, job.path, batch, job.filename).then(
                                            function () {
                                                uploadSuccess();
                                            },
                                            function () {
                                                uploadFailure();
                                            }
                                        );
                                    },
                                    function () {
                                        uploadFailure();
                                    }
                                );
                            } else {
                                if (track.size >= 30000) {
                                    alert("Track log file size larger than 30MB! File will not be uploaded to server, but a copy has been saved to the backup folder on the device.")
                                }
                                DB.uploadFile(job.transfer, job.path, batch, job.filename).then(
                                    function () {
                                        uploadSuccess();
                                    },
                                    function () {
                                        uploadFailure();
                                    }
                                );
                            }
                        },
                        function() {
                            uploadFailure();
                        }
                    );
                },
                function() {
                    uploadFailure();
                }
            );
        };
    };

    return UploadView;

});

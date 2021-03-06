define(["src/util/Date"], function(DateFormatter) { 'use strict';

    describe("DateFormatter Module", function() {
        it ("Formats the date correctly from sites file to screen", function() {
            var formattedDate = DateFormatter.getScreenFormatDate("2013-02-06T00:00:00-00:00");
            expect(formattedDate).toEqual('2\u20116\u201113');
        });

        it ("Formats the current date correctly to write to a sites file", function() {
            var day = new Date(2014, 1, 6); // month is zero based
            var formattedDate = DateFormatter.getSitesFormatDate(day);
            expect(formattedDate).toEqual('2014-02-06T00:00:00-00:00');
        });

        it("Formats the current date correctly to write to the transaction log", function() {
            var day = new Date(2014, 1, 6); // month is zero based
            var formattedDate = DateFormatter.getOperationFormatDate(day);
            expect(formattedDate).toEqual('Feb-06-2014');
        });

        it("Formats the current time correctly to write to the transaction log", function() {
            var day = '2014-01-06T13:00:00'; //new Date(2014, 1, 6, 13, 0, 0); // month is zero based
            var formattedDate = DateFormatter.getOperationFormatTime(day);
            expect(formattedDate).toEqual('13:00:00');
        });

    });
});
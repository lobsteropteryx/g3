define(["jquery",
    "src/models/CurrentPosition",
    "src/views/Caution"],
    function($, CurrentPosition, CautionView) {'use strict';

    $(describe("Caution View", function() {

        var view;

        beforeEach(function() {
            view = new CautionView({model: new CurrentPosition()});
        });

        it("Can be instantiated", function() {
            expect(view).toBeDefined();
        });

        it("Has a model", function() {
            expect(view.model).toBeDefined();
        });
    }));
});
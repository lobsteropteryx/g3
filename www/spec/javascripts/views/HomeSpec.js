/**
 * Created by Ian on 1/21/14.
 */
$(describe("Home View", function() {
   var view;

   beforeEach(function() {
      loadFixtures('home.html');
      $('body').append();
      view = new app.views.Home({model: new app.models.CurrentPosition(), template: _.template($('#home-template').html())});
   });

   it("Can be instantiated", function() {
      expect(view).toBeDefined();
   });

   it("Has a model", function() {
       expect(view.model).toBeDefined();
   });

   it("Clears the operation on initial load", function() {
       view.model.set({operation: {easting: 123456, northing: 1234567, date: '01/01/14', traptype: 'Delta'}});
       view = new app.views.Home({model: new app.models.CurrentPosition(), template: _.template($('#home-template').html())});
       var op = view.model.get('operation');
       expect(op).toEqual({easting: '', northing: '', date: '', traptype: ''});
   })

   describe("Operation and Target circles", function() {

       var utm = {
           Easting: 300000,
           Northing: 3000000,
           Zone: 15
       };

       var relativePosition = {
           Distance: 100,
           Bearing: 'N',
           DistanceOutside: 0,
           Found: true
       };

       var colorToHex = function(color) {
           if (color.substr(0, 1) === '#') {
               return color;
           }
           var digits = /(.*?)rgb\((\d+), (\d+), (\d+)\)/.exec(color);

           var red = parseInt(digits[2]);
           var green = parseInt(digits[3]);
           var blue = parseInt(digits[4]);

           var rgb = blue | (green << 8) | (red << 16);
           return digits[1] + '#' + rgb.toString(16).toUpperCase();
       };

       var initModel = function(site, distanceOutside) {
           relativePosition.DistanceOutside = distanceOutside;
           view.model.set({currentUtm: utm});
           view.model.set({site: site});
           view.model.set({relativePosition: relativePosition});
           view.render();
       };

       var expectColorToMatchDistanceOutside = function(site, distanceOutside, color) {
           initModel(site, distanceOutside);
           var actualColor = colorToHex(view.$el.find('#siteDiv').css('background-color'));
           expect(actualColor).toEqual(color);
       };

       var expectImageToMatchOperation = function(site, distanceOutside, expectedImageSource) {
           initModel(site, distanceOutside);
           var imgSrc = view.$el.find('#homeImage').attr('src');
           expect(imgSrc).toEqual(expectedImageSource);
       };

       describe("Unaddressed", function() {
           var site = {
               "zone":15,
               "xth":"300000",
               "yth":"3000000",
               "quad":"TEST",
               "site_id":1,
               "grid":"300",
               "trap_type":"Delta",
               "moth_count":0
           };

           it("Shows green tree when we're within the target and the site is unaddressed", function() {
               expectColorToMatchDistanceOutside(site, 0, '#799839');
               expectColorToMatchDistanceOutside(site, -1, '#799839');
               expectImageToMatchOperation(site, 0, 'img/greenTree.gif');
           });

           it("Shows red tree when we're outside the target and the site is unaddresed", function() {
               expectColorToMatchDistanceOutside(site, 1, '#FF0000');
               expectImageToMatchOperation(site, 1, 'img/redTree.gif');
           });
       })

       describe("Delta", function() {
           var site = {
               "zone":15,
               "xth":"300000",
               "yth":"3000000",
               "xact": 400000,
               "yact": 4000000,
               "quad":"TEST",
               "site_id":1,
               "grid":"300",
               "trap_type":"Delta",
               "moth_count":0,
               "txn_date":"2013-02-06T00:00:00-00:00"
           };

           it("Shows green delta when we're within the target and the site has a delta placement", function() {
               expectColorToMatchDistanceOutside(site, 0, '#799839');
               expectColorToMatchDistanceOutside(site, -1, '#799839');
               expectImageToMatchOperation(site, 0, 'img/greenDelta.gif');
           });

           it("Shows red tree when we're outside the target and the site has a delta placement", function() {
               expectColorToMatchDistanceOutside(site, 1, '#FF0000');
               expectImageToMatchOperation(site, 1, 'img/redDelta.gif');
           });
       });

       describe("Milk Carton", function() {
           var site = {
               "zone":15,
               "xth":"300000",
               "yth":"3000000",
               "xact": 400000,
               "yact": 4000000,
               "quad":"TEST",
               "site_id":1,
               "grid":"300",
               "trap_type":"Milk Carton",
               "moth_count":0,
               "txn_date":"2013-02-06T00:00:00-00:00"
           };

           it("Shows green milk carton when we're within the target and the site has a milk carton placement", function() {
               expectColorToMatchDistanceOutside(site, 0, '#799839');
               expectColorToMatchDistanceOutside(site, -1, '#799839');
               expectImageToMatchOperation(site, 0, 'img/greenMilkCarton.gif');
           });

           it("Shows red milk carton when we're outside the target and the site has a milk carton placement", function() {
               expectColorToMatchDistanceOutside(site, 1, '#FF0000');
               expectImageToMatchOperation(site, 1, 'img/redMilkCarton.gif');
           });
       })
   });
}));
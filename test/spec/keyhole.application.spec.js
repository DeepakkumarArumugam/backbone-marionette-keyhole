describe('Keyhole.Application', function () {
    var application;

    beforeEach(function () {
        application = new Backbone.Marionette.Keyhole.Application();
    });

    it('should be able to start w/o options', function () {
        application.on('start', function (options) {
            expect(options).toBeUndefined();
        });
        application.start();
    });

    it('should be able to start w options', function () {
        application.on('start', function (options) {
            expect(options).toBeDefined();
        });
        var options = { 'test': 'value'};
        application.start(options);
    });

    it('should be able to add initializers', function () {
        application.addInitializer(function () {
            expect(true).toBeTruthy();
        });
        application.start();
    });

    it('should be able to fire event: initialize:before', function () {
        application.on('initialize:before', function () {
            expect(true).toBeTruthy();
        });
        application.start();
    });

    it('should be able to fire event: initialize:after', function () {
        application.on('initialize:after', function () {
            expect(true).toBeTruthy();
        });
        application.start();
    });

    it('should be able to fire custom events via EventAggregator', function () {
        application.vent.on("foo", function () {
            expect(true).toBeTruthy();
        });

        application.vent.trigger("foo");
    });

    afterEach(function () {
        application = undefined;
    });
});
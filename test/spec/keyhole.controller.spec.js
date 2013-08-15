describe('Keyhole.Controller', function () {
    var controller;

    beforeEach(function () {
        controller = new Backbone.Marionette.Keyhole.Controller();
    });

    it('should be able to listen to close events', function() {
        controller.on('close', function() {
            expect(true).toBeTruthy();
        });
        controller.close();
    });

    it('should be able to listen for and trigger custom events via an EventBinder', function () {
        controller.listenTo(controller, 'some:event', function (args) {
            expect(args).toEqual('foo');
        });
        controller.trigger('some:event', 'foo');
    });

    afterEach(function () {
        controller = undefined;
    });
});
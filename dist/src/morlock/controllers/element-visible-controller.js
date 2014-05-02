define("morlock/controllers/element-visible-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/element-tracker-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var equals = __dependency1__.equals;
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ElementTrackerStream = __dependency3__;
    var Emitter = __dependency4__;

    /**
     * Provides a familiar OO-style API for tracking element position.
     * @constructor
     * @param {Element} elem The element to track
     * @param {Object=} options The options passed to the position tracker.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ElementVisibleController(elem, options) {
      if (!(this instanceof ElementVisibleController)) {
        return new ElementVisibleController(elem, options);
      }

      Emitter.mixin(this);

      var trackerStream = ElementTrackerStream.create(elem, options);
      Stream.onValue(trackerStream, partial(this.trigger, 'both'));

      // Auto trigger if the last value on the stream is what we're looking for.
      var oldOn = this.on;
      this.on = function wrappedOn(eventName, callback, scope) {
        oldOn.apply(this, arguments);
        
        var val = Stream.getValue(trackerStream);
        if (val === eventName) {
          if (scope) {
            callback.call(scope, val);
          } else {
            callback(val);
          }
        }
      }

      var enterStream = Stream.filter(equals('enter'), trackerStream);
      Stream.onValue(enterStream, partial(this.trigger, 'enter'));

      var exitStream = Stream.filter(equals('exit'), trackerStream);
      Stream.onValue(exitStream, partial(this.trigger, 'exit'));
    }

    __exports__["default"] = ElementVisibleController;
  });
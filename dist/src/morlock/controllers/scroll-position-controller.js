define("morlock/controllers/scroll-position-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-tracker-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ScrollTrackerStream = __dependency3__;
    var Emitter = __dependency4__;

    /**
     * Provides a familiar OO-style API for tracking scroll position.
     * @constructor
     * @param {Element} targetScrollY The position to track.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ScrollPositionController(targetScrollY) {
      if (!(this instanceof ScrollPositionController)) {
        return new ScrollPositionController(targetScrollY);
      }

      Emitter.mixin(this);

      var trackerStream = ScrollTrackerStream.create(targetScrollY);
      Stream.onValue(trackerStream, partial(this.trigger, 'both'));

      var beforeStream = Stream.filterFirst('before', trackerStream);
      Stream.onValue(beforeStream, partial(this.trigger, 'before'));

      var afterStream = Stream.filterFirst('after', trackerStream);
      Stream.onValue(afterStream, partial(this.trigger, 'after'));
    }

    __exports__["default"] = ScrollPositionController;
  });
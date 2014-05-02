define("morlock/controllers/scroll-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var getOption = __dependency1__.getOption;
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;
    var Emitter = __dependency4__;

    /**
     * Provides a familiar OO-style API for tracking scroll events.
     * @constructor
     * @param {Object=} options The options passed to the scroll tracker.
     * @return {Object} The API with a `on` function to attach scrollEnd
     *   callbacks and an `observeElement` function to detect when elements
     *   enter and exist the viewport.
     */
    function ScrollController(options) {
      if (!(this instanceof ScrollController)) {
        return new ScrollController(options);
      }

      Emitter.mixin(this);

      options = options || {};

      var scrollStream = ScrollStream.create();
      Stream.onValue(scrollStream, partial(this.trigger, 'scroll'));

      var scrollEndStream = Stream.debounce(
        getOption(options.debounceMs, 200),
        scrollStream
      );
      Stream.onValue(scrollEndStream, partial(this.trigger, 'scrollEnd'));
    }

    __exports__["default"] = ScrollController;
  });
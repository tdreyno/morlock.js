define("morlock/controllers/scroll-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var getOption = __dependency1__.getOption;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;

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

      options = options || {};

      var scrollStream = ScrollStream.create();

      var debounceMs = getOption(options.debounceMs, 200);
      var scrollEndStream = Stream.debounce(
        debounceMs,
        scrollStream
      );

      this.on = function on_(name, cb) {
        if ('scrollEnd' === name) {
          Stream.onValue(scrollEndStream, cb);
        } else if ('scroll' === name) {
          Stream.onValue(scrollStream, cb);
        }
      };
    }

    __exports__["default"] = ScrollController;
  });
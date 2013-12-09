define("morlock/streams/scroll-stream", 
  ["morlock/core/stream","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Stream = __dependency1__;

    /**
     * Create a new Stream containing scroll events.
     * These events can be debounced (meaning they will only emit after events have
     * ceased for X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {number=200} options.debounceMs What rate to debounce the stream.
     * @return {Stream} The resulting stream.
     */
    function create(options) {
      options = options || {};
      var debounceMs = 'undefined' !== typeof options.debounceMs ? options.debounceMs : 200;

      var scrollEndStream = Stream.debounce(
        debounceMs,
        Stream.createFromEvents(window, 'scroll')
      );

      // It's going to space, will you just give it a second!
      setTimeout(function() {
        window.dispatchEvent(new Event('scroll'));
      }, 10);

      return scrollEndStream;
    }

    __exports__.create = create;
  });
define("morlock/streams/resize-stream", 
  ["morlock/core/stream","exports"],
  function(__dependency1__, __exports__) {
    "use strict";
    var Stream = __dependency1__;

    /**
     * Create a new Stream containing resize events.
     * These events can be throttled (meaning they will only emit once every X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {object} options.resizeStream Custom resize stream.
     * @param {number=200} options.throttleMs What rate to throttle the stream.
     * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
     * @return {Stream} The resulting stream.
     */
    function create(options) {
      options = options || {};
      var throttleMs = 'undefined' !== typeof options.throttleMs ? options.throttleMs : 200;
      var orientationChangeDelayMs = 'undefined' !== typeof options.orientationChangeDelayMs ? options.orientationChangeDelayMs : 100;
      var resizeStream = 'undefined' !== typeof options.resizeStream ?
        options.resizeStream :
        Stream.createFromEvents(window, 'resize');

      var resizedStream = Stream.merge(

        // Watch and throttle resize events;
        Stream.throttle(throttleMs, resizeStream),

        // X milliseconds after an orientation change, send an event.
        Stream.delay(orientationChangeDelayMs,
                     Stream.createFromEvents(window, 'orientationchange'))
      );

      setTimeout(function() {
        var evObj = document.createEvent('HTMLEvents');
        evObj.initEvent( 'resize', true, true );
        window.dispatchEvent(evObj);
      }, 10);

      return resizedStream;
    }


    __exports__.create = create;
  });
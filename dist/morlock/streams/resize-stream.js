define("morlock/streams/resize-stream", 
  ["morlock/core/stream","morlock/core/util","morlock/core/events","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var Stream = __dependency1__;
    var getOption = __dependency2__.getOption;
    var memoize = __dependency2__.memoize;
    var defer = __dependency2__.defer;
    var partial = __dependency2__.partial;
    var dispatchEvent = __dependency3__.dispatchEvent;

    /**
     * Create a new Stream containing resize events.
     * These events can be throttled (meaning they will only emit once every X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
     * @return {Stream} The resulting stream.
     */
    var create = memoize(function create_(options) {
      options = options || {};
      var orientationChangeDelayMs = getOption(options.orientationChangeDelayMs, 100);

      var resizedStream = Stream.merge(

        Stream.createFromEvents(window, 'resize'),

        // X milliseconds after an orientation change, send an event.
        Stream.delay(orientationChangeDelayMs,
                     Stream.createFromEvents(window, 'orientationchange'))
      );

      defer(partial(dispatchEvent, window, 'resize'), 10);

      return Stream.skipDuplicates(Stream.map(windowDimensions_, resizedStream));
    });
    __exports__.create = create;
    function windowDimensions_() {
      return [
        window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth,
        window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      ];
    }
  });
define("morlock/streams/scroll-stream", 
  ["morlock/core/stream","morlock/core/util","morlock/core/dom","morlock/core/events","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var Stream = __dependency1__;
    var memoize = __dependency2__.memoize;
    var defer = __dependency2__.defer;
    var partial = __dependency2__.partial;
    var documentScrollY = __dependency3__.documentScrollY;
    var dispatchEvent = __dependency4__.dispatchEvent;

    /**
     * Create a stream of window.onscroll events, but only calculate their
     * position on requestAnimationFrame frames.
     * @return {Stream}
     */
    var create = memoize(function create_() {
      var oldScrollY;
      var scrollDirty = true;
      var scrollEventsStream = Stream.createFromEvents(window, 'scroll');

      Stream.onValue(scrollEventsStream, function onScrollSetDirtyBit_() {
        scrollDirty = true;
      });

      var rAF = Stream.createFromRAF();

      var didChangeOnRAFStream = Stream.filter(function filterDirtyFramesFromRAF_() {
        if (!scrollDirty) { return false; }
        scrollDirty = false;

        var newScrollY = documentScrollY();
        if (oldScrollY !== newScrollY) {
          oldScrollY = newScrollY;
          return true;
        }

        return false;
      }, rAF);

      // It's going to space, will you just give it a second!
      defer(partial(dispatchEvent, window, 'scroll'), 10);

      return Stream.map(function getWindowPosition_() {
        return oldScrollY;
      }, didChangeOnRAFStream);
    });
    __exports__.create = create;
  });
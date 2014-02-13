define("morlock/streams/scroll-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;

    /**
     * Create a new Stream containing events which fire when an element has
     * entered or exited the viewport.
     * @param {Element} element The element we are tracking.
     * @param {Stream} scrollStream A stream emitting scroll events.
     * @param {Stream} resizeStream A stream emitting resize events.
     * @return {Stream} The resulting stream.
     */
    function create(targetScrollY, scrollPositionStream) {
      scrollPositionStream = scrollPositionStream || ScrollStream.create({ debounceMs: 0 });
      var overTheLineStream = Stream.create();
      var pastScrollY = false;
      var firstRun = true;

      Stream.onValue(scrollPositionStream, function(){
        if ((firstRun || pastScrollY) && (window.scrollY < targetScrollY)) {
          pastScrollY = false;
          Stream.emit(overTheLineStream, ['before', targetScrollY]);
        } else if ((firstRun || !pastScrollY) && (window.scrollY >= targetScrollY)) {
          pastScrollY = true;
          Stream.emit(overTheLineStream, ['after', targetScrollY]);
        }

        firstRun = false;
      });

      setTimeout(function() {
        window.dispatchEvent(new Event('scroll'));
      }, 10);

      return overTheLineStream;
    }

    __exports__.create = create;
  });
define("morlock/streams/scroll-tracker-stream", 
  ["morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var Stream = __dependency1__;
    var ScrollStream = __dependency2__;

    /**
     * Create a new Stream containing events which fire when a position has
     * been scrolled past.
     * @param {number} targetScrollY The position we are tracking.
     * @return {Stream} The resulting stream.
     */
    function create(targetScrollY) {
      var scrollPositionStream = ScrollStream.create();
      var overTheLineStream = Stream.create();
      var pastScrollY = false;
      var firstRun = true;

      Stream.onValue(scrollPositionStream, function onScrollTrackPosition_(currentScrollY) {
        if ((firstRun || pastScrollY) && (currentScrollY < targetScrollY)) {
          pastScrollY = false;
          Stream.emit(overTheLineStream, ['before', targetScrollY]);
        } else if ((firstRun || !pastScrollY) && (currentScrollY >= targetScrollY)) {
          pastScrollY = true;
          Stream.emit(overTheLineStream, ['after', targetScrollY]);
        }

        firstRun = false;
      });

      return overTheLineStream;
    }

    __exports__.create = create;
  });
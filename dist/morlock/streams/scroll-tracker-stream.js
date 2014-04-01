define("morlock/streams/scroll-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    "use strict";
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;

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

      Stream.onValue(scrollPositionStream, function(currentScrollY){
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
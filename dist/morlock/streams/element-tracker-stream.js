define("morlock/streams/element-tracker-stream", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var getViewportHeight = __dependency1__.getViewportHeight;
    var getRect = __dependency1__.getRect;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;
    var ResizeStream = __dependency4__;

    /**
     * Create a new Stream containing events which fire when an element has
     * entered or exited the viewport.
     * @param {Element} element The element we are tracking.
     * @param {object} options Key/value options
     * @return {Stream} The resulting stream.
     */
    function create(element, resizeStream, options) {
      var trackerStream = Stream.create();
      var viewportHeight;
      var isVisible = false;
      var buffer = (options && 'number' === typeof options.buffer) ? options.buffer : 0;

      function updateViewport() {
        viewportHeight = getViewportHeight();
        didUpdateViewport();
      }
      
      function didUpdateViewport(currentScrollY) {
        var r = getRect(element, buffer, currentScrollY);
        var inY = !!r && r.bottom >= 0 && r.top < viewportHeight;

        if (isVisible && !inY) {
          isVisible = false;
          Stream.emit(trackerStream, 'exit');
        } else if (!isVisible && inY) {
          isVisible = true;
          Stream.emit(trackerStream, 'enter');
        }
      }

      Stream.onValue(ScrollStream.create(), didUpdateViewport);
      Stream.onValue(ResizeStream.create(), updateViewport);
      updateViewport();

      return trackerStream;
    }

    __exports__.create = create;
  });
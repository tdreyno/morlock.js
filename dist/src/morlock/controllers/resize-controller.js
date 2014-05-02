define("morlock/controllers/resize-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/resize-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var getOption = __dependency1__.getOption;
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ResizeStream = __dependency3__;
    var Emitter = __dependency4__;

    /**
     * Provides a familiar OO-style API for tracking resize events.
     * @constructor
     * @param {Object=} options The options passed to the resize tracker.
     * @return {Object} The API with a `on` function to attach callbacks
     *   to resize events and breakpoint changes.
     */
    function ResizeController(options) {
      if (!(this instanceof ResizeController)) {
        return new ResizeController(options);
      }

      Emitter.mixin(this);

      options = options || {};

      var resizeStream = ResizeStream.create(options);
      Stream.onValue(resizeStream, partial(this.trigger, 'resize'));

      var debounceMs = getOption(options.debounceMs, 200);
      var resizeEndStream = debounceMs <= 0 ? resizeStream : Stream.debounce(
        debounceMs,
        resizeStream
      );
      Stream.onValue(resizeEndStream, partial(this.trigger, 'resizeEnd'));

      this.destroy = function() {
        Stream.close(resizeStream);
        this.off('resize');
        this.off('resizeEnd');
      };
    }

    __exports__["default"] = ResizeController;
  });
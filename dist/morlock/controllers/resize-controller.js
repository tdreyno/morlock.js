define("morlock/controllers/resize-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/breakpoint-stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var objectKeys = __dependency1__.objectKeys;
    var partial = __dependency1__.partial;
    var first = __dependency1__.first;
    var compose = __dependency1__.compose;
    var isTrue = __dependency1__.isTrue;
    var select = __dependency1__.select;
    var get = __dependency1__.get;
    var getOption = __dependency1__.getOption;
    var Stream = __dependency2__;
    var BreakpointStream = __dependency3__;
    var ResizeStream = __dependency4__;

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

      options = options || {};

      var resizeStream = ResizeStream.create(options);

      var debounceMs = getOption(options.debounceMs, 200);
      var resizeEndStream = Stream.debounce(
        debounceMs,
        resizeStream
      );

      var breakpointStream;
      if ('undefined' !== typeof options.breakpoints) {
        breakpointStream = BreakpointStream.create(options.breakpoints, {
          throttleMs: options.throttleMs,
          debounceMs: getOption(options.breakpointDebounceMs, debounceMs)
        });
      }

      this.on = function(eventType, cb) {
        var subscriptionStream;
        if ('resizeEnd' === eventType) {
          subscriptionStream = resizeEndStream;
        } else if ('resize' === eventType) {
          subscriptionStream = resizeStream;
        } else if ('breakpoint' === eventType) {
          if (breakpointStream) {
            subscriptionStream = Stream.map(mapToNamedEvents_, breakpointStream);
          }
        }

        if (subscriptionStream) {
          Stream.onValue(subscriptionStream, cb);
        }
      };

      var activeBreakpoints = {};

      if (breakpointStream) {
        Stream.onValue(breakpointStream, function(e) {
          activeBreakpoints[e[0]] = e[1];
        });
      }

      this.getActiveBreakpoints = function getActiveBreakpoints() {
        var isActive = compose(isTrue, partial(get, activeBreakpoints));
        return select(isActive, objectKeys(activeBreakpoints));
      };
    }

    var ENTER = 'enter';
    var EXIT = 'exit';

    function mapToNamedEvents_(v) {
      return [first(v), v[1] ? ENTER : EXIT];
    }

    __exports__["default"] = ResizeController;
  });
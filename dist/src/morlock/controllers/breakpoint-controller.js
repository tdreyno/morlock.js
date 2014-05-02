define("morlock/controllers/breakpoint-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/breakpoint-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    "use strict";
    var objectKeys = __dependency1__.objectKeys;
    var compose = __dependency1__.compose;
    var isTrue = __dependency1__.isTrue;
    var select = __dependency1__.select;
    var get = __dependency1__.get;
    var Stream = __dependency2__;
    var BreakpointStream = __dependency3__;
    var Emitter = __dependency4__;

    /**
     * Provides a familiar OO-style API for tracking breakpoint events.
     * @constructor
     * @param {Object=} options The options passed to the breakpoint tracker.
     * @return {Object} The API with a `on` function to attach callbacks
     *   to breakpoint changes.
     */
    function BreakpointController(options) {
      if (!(this instanceof BreakpointController)) {
        return new BreakpointController(options);
      }

      Emitter.mixin(this);

      var breakpointStream = BreakpointStream.create(options.breakpoints, {
        throttleMs: options.throttleMs,
        debounceMs: options.debounceMs
      });

      var activeBreakpoints = {};

      var self = this;
      Stream.onValue(breakpointStream, function(e) {
        activeBreakpoints[e[0]] = e[1];

        var namedState = e[1] ? 'enter' : 'exit';
        self.trigger('breakpoint', [e[0], namedState]);
        self.trigger('breakpoint:' + e[0], [e[0], namedState]);
      });

      this.getActiveBreakpoints = function getActiveBreakpoints() {
        var isActive = compose(isTrue, get(activeBreakpoints));
        return select(isActive, objectKeys(activeBreakpoints));
      };
    }

    __exports__["default"] = BreakpointController;
  });
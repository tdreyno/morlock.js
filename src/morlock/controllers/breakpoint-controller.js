import { objectKeys, partial, first, compose, isTrue, select, get, getOption } from "morlock/core/util";
module Stream from "morlock/core/stream";
module BreakpointStream from "morlock/streams/breakpoint-stream";
module ResizeStream from "morlock/streams/resize-stream";

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

  var resizeStream = ResizeStream.create(options);

  var breakpointStream = BreakpointStream.create(options.breakpoints, {
    throttleMs: options.throttleMs,
    debounceMs: options.debounceMs
  });

  function onOffStream(args, f) {
    var eventType = args[0];
    var cb = args[1];

    var filteredStream;

    if (eventType.match(/^breakpoint/)) {
      var parts = eventType.split(':');

      if (parts.length > 1) {
        filteredStream = Stream.filterFirst(parts[1], breakpointStream);
      } else {
        filteredStream = breakpointStream;
      }

      filteredStream = Stream.map(mapToNamedEvents_, filteredStream);
    }

    if (filteredStream) {
      f(filteredStream, cb);
    }
  }

  return {
    on: function on(/* name, cb */) {
      onOffStream(arguments, Stream.onValue);

      return this;
    },

    off: function(/* name, cb */) {
      onOffStream(arguments, Stream.offValue);

      return this;
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

export default = BreakpointController;

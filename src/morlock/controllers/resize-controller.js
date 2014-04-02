import { objectKeys, partial, first, compose, isTrue, select, get, getOption } from "morlock/core/util";
module Stream from "morlock/core/stream";
module BreakpointStream from "morlock/streams/breakpoint-stream";
module ResizeStream from "morlock/streams/resize-stream";

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

export default = ResizeController;

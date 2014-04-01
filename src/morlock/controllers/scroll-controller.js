import { partial, equals, compose, first, getOption } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module ElementTrackerStream from "morlock/streams/element-tracker-stream";
module ScrollTrackerStream from "morlock/streams/scroll-tracker-stream";

/**
 * Provides a familiar OO-style API for tracking scroll events.
 * @constructor
 * @param {Object=} options The options passed to the scroll tracker.
 * @return {Object} The API with a `on` function to attach scrollEnd
 *   callbacks and an `observeElement` function to detect when elements
 *   enter and exist the viewport.
 */
function ScrollController(options) {
  if (!(this instanceof ScrollController)) {
    return new ScrollController(options);
  }

  options = options || {};

  var scrollStream = ScrollStream.create();

  var debounceMs = getOption(options.debounceMs, 200);
  var scrollEndStream = Stream.debounce(
    debounceMs,
    scrollStream
  );

  this.on = function on_(name, cb) {
    if ('scrollEnd' === name) {
      Stream.onValue(scrollEndStream, cb);
    } else if ('scroll' === name) {
      Stream.onValue(scrollStream, cb);
    }
  };
}

export default = ScrollController;

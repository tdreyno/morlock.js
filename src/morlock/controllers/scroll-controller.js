import { getOption, partial } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module Emitter from "morlock/core/emitter";

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

  Emitter.mixin(this);

  options = options || {};

  var scrollStream = ScrollStream.create();
  Stream.onValue(scrollStream, partial(this.trigger, 'scroll'));

  var scrollEndStream = Stream.debounce(
    getOption(options.debounceMs, 200),
    scrollStream
  );
  Stream.onValue(scrollEndStream, partial(this.trigger, 'scrollEnd'));
}

export default = ScrollController;

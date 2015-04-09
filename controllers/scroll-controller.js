var Util = require('../core/util');
var Stream = require('../core/stream');
var ScrollStream = require('../streams/scroll-stream');
var Emitter = require('../core/emitter');

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

  var scrollStream = ScrollStream.create({
    scrollTarget: options.scrollTarget
  });

  Stream.onValue(scrollStream, Util.partial(this.trigger, 'scroll'));

  var scrollEndStream = Stream.debounce(
    Util.getOption(options.debounceMs, 200),
    scrollStream
  );
  Stream.onValue(scrollEndStream, Util.partial(this.trigger, 'scrollEnd'));
}

module.exports = ScrollController;

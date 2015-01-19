var Util = require('../core/util');
var Stream = require('../core/stream');
var ResizeStream = require('../streams/resize-stream');
var Emitter = require('../core/emitter');

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
  Stream.onValue(resizeStream, Util.partial(this.trigger, 'resize'));

  var debounceMs = Util.getOption(options.debounceMs, 200);
  var resizeEndStream = debounceMs <= 0 ? resizeStream : Stream.debounce(
    debounceMs,
    resizeStream
  );
  Stream.onValue(resizeEndStream, Util.partial(this.trigger, 'resizeEnd'));

  this.destroy = function() {
    Stream.close(resizeStream);
    this.off('resize');
    this.off('resizeEnd');
  };
}

module.exports = ResizeController;

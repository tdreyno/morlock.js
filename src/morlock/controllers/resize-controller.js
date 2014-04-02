import { getOption } from "morlock/core/util";
module Stream from "morlock/core/stream";
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

  // var debounceMs = getOption(options.debounceMs, 200);
  // var resizeEndStream = debounceMs <= 0 ? resizeStream : Stream.debounce(
  //   debounceMs,
  //   resizeStream
  // );

  function onOffStream(args, f) {
    var name = args[0];
    var cb = args[1];

    var filteredStream;
    if (name === 'resizeEnd') {
      filteredStream = resizeEndStream;
    } else if (name === 'resize') {
      filteredStream = resizeStream;
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
    },

    destroy: function() {
      Stream.close(resizeStream);
    }
  };
}

export default = ResizeController;
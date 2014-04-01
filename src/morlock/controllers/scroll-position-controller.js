module Stream from "morlock/core/stream";
module ScrollTrackerStream from "morlock/streams/scroll-tracker-stream";

/**
 * Provides a familiar OO-style API for tracking scroll position.
 * @constructor
 * @param {Element} targetScrollY The position to track.
 * @return {Object} The API with a `on` function to attach scrollEnd
 *   callbacks and an `observeElement` function to detect when elements
 *   enter and exist the viewport.
 */
function ScrollPositionController(targetScrollY) {
  if (!(this instanceof ScrollPositionController)) {
    return new ScrollPositionController(targetScrollY);
  }

  var trackerStream = ScrollTrackerStream.create(targetScrollY);
  var beforeStream = Stream.filterFirst('before', trackerStream);
  var afterStream = Stream.filterFirst('after', trackerStream);

  function onOffStream(args, f) {
    var name = 'both';
    var cb;

    if (args.length === 1) {
      cb = args[0];
    } else {
      name = args[0];
      cb = args[1];
    }

    var filteredStream;
    if (name === 'both') {
      filteredStream = trackerStream;
    } else if (name === 'before') {
      filteredStream = beforeStream;
    } else if (name === 'after') {
      filteredStream = afterStream;
    }

    f(filteredStream, cb);
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
}

export default = ScrollPositionController;

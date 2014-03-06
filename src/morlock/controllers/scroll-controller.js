import { partial, equals, compose, constantly } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module ResizeStream from "morlock/streams/resize-stream";
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

  var scrollEndStream = ScrollStream.create(options);

  this.on = function(name, cb) {
    if ('scrollEnd' === name) {
      Stream.onValue(scrollEndStream, cb);
    }
  };

  var resizeStream = ResizeStream.create();

  this.observeElement = function observeElement(elem) {
    var trackerStream = ElementTrackerStream.create(elem, scrollEndStream, resizeStream);

    return {
      on: function on(name, cb) {
        var matchingStream = Stream.filter(partial(equals, name), trackerStream);
        Stream.onValue(matchingStream, cb);

        return this;
      }
    };
  };

  this.observePosition = function observePosition(targetScrollY) {
    var trackerStream = ScrollTrackerStream.create(targetScrollY, scrollEndStream);

    var first = require('morlock/core/util').first;
    var beforeStream = Stream.filter(compose(partial(equals, 'before'), first), trackerStream);
    var afterStream = Stream.filter(compose(partial(equals, 'after'), first), trackerStream);

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
  };
}

export default = ScrollController;

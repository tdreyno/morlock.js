import { partial, equals } from "morlock/core/util";
module Stream from "morlock/core/stream";
module ScrollEndStream from "morlock/streams/scroll-stream";
module ResizeStream from "morlock/streams/resize-stream";
module ElementTrackerStream from "morlock/streams/element-tracker-stream";

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

  var scrollEndStream = ScrollEndStream.create(options);

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
        Stream.onValue(Stream.filter(partial(equals, name), trackerStream), cb);
      }
    };
  };
}

export default = ScrollController;

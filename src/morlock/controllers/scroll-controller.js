import { partial, equals } from "morlock/core/util";
module Stream from "morlock/core/stream";
import { makeScrollEndStream } from "morlock/streams/scroll-stream";
import { makeResizeStream } from "morlock/streams/resize-stream";
import { makeElementTrackerStream } from "morlock/streams/element-tracker-stream";

var ScrollController = function ScrollController(options) {
  if (!(this instanceof ScrollController)) {
    return new ScrollController(options);
  }

  var scrollEndStream = makeScrollEndStream(options);

  this.on = function(name, cb) {
    if ('scrollEnd' === name) {
      Stream.onValue(scrollEndStream, cb);
    }
  };

  var resizeStream = makeResizeStream();

  this.observeElement = function observeElement(elem) {
    var trackerStream = makeElementTrackerStream(elem, scrollEndStream, resizeStream);

    return {
      on: function(name, cb) {
        Stream.onValue(Stream.filter(partial(equals, name), trackerStream), cb);
      }
    };
  };
};

export { ScrollController };

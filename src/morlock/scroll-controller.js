import { partial, equals } from "morlock/util";
import { makeScrollEndStream } from "morlock/scroll-stream";
import { makeViewportStream, EVENT_TYPES, filterByType } from "morlock/viewport-stream";
import { makeElementTrackerStream } from "morlock/element-tracker";
import { filterStream } from "morlock/event-stream";

var ScrollController = function(options) {
  if (!(this instanceof ScrollController)) {
    return new ScrollController(options);
  }

  var scrollEndStream = makeScrollEndStream(options);

  this.on = function(name, cb) {
    if ('scrollEnd' === name) {
      scrollEndStream.onValue(cb);
    }
  };

  var viewportStream = makeViewportStream();
  var resizeStream = filterByType(viewportStream, EVENT_TYPES.RESIZE);

  this.observeElement = function observeElement(elem) {
    var trackerStream = makeElementTrackerStream(elem, scrollEndStream, resizeStream);

    return {
      on: function(name, cb) {
        filterStream(partial(equals, name), trackerStream).onValue(cb);
      }
    };
  };
};

export { ScrollController }

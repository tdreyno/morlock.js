import { objectKeys, partial, equals, first, compose, isTrue, select, get,
         shift } from "morlock/core/util";
import { mapStream, filterStream } from "morlock/core/stream";
import { makeViewportStream, EVENT_TYPES, filterByType } from "morlock/streams/viewport-stream";

function getActiveBreakpoints(activeBreakpoints) {
  var isActive = compose(isTrue, partial(get, activeBreakpoints));
  return select(isActive, objectKeys(activeBreakpoints));
}

var ResizeController = function ResizeController(options) {
  if (!(this instanceof ResizeController)) {
    return new ResizeController(options);
  }

  var viewportStream = makeViewportStream(options);

  this.on = function(name, cb) {
    var eventType = EVENT_TYPES[name.toUpperCase()];
    if ('undefined' !== typeof eventType) {
      mapStream(shift, filterByType(viewportStream, eventType)).onValue(cb);
    }
  };

  var activeBreakpoints = {};

  filterByType(viewportStream, EVENT_TYPES.BREAKPOINT).onValue(function(e) {
    if ('enter' === e[2]) {
      activeBreakpoints[e[1]] = true;
    } else if ('exit' === e[2]) {
      activeBreakpoints[e[1]] = false;
    }
  });

  this.getActiveBreakpoints = partial(getActiveBreakpoints, activeBreakpoints);
};

export { ResizeController }

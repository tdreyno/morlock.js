import {
  objectKeys,
  partial,
  equals,
  first,
  compose,
  isTrue,
  select,
  get,
  shift
} from "morlock/util";

import { mapStream, filterStream } from "morlock/event-stream";
import { makeViewportStream, EVENT_TYPES } from "morlock/resize-stream";

function filterbyType(stream, type) {
  var doesTypeMatch = compose(partial(equals, type), first);
  return filterStream(doesTypeMatch, stream);
}

var ResizeController = function(options) {
  if (!(this instanceof ResizeController)) {
    return new ResizeController(options);
  }

  var viewportStream = makeViewportStream(options);

  this.on = function(name, cb) {
    var eventType = EVENT_TYPES[name.toUpperCase()];
    if ('undefined' !== typeof eventType) {
      mapStream(shift, filterbyType(viewportStream, eventType)).onValue(cb);
    }
  };

  var activeBreakpoints = {};

  filterbyType(viewportStream, EVENT_TYPES.BREAKPOINT).onValue(function(e) {
    if ('enter' === e[2]) {
      activeBreakpoints[e[1]] = true;
    } else if ('exit' === e[2]) {
      activeBreakpoints[e[1]] = false;
    }
  });

  this.getActiveBreakpoints = function() {
    var isActive = compose(isTrue, partial(get, activeBreakpoints));
    return select(isActive, objectKeys(activeBreakpoints));
  };
};

export { ResizeController }

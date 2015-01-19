var Util = require('../core/util');
var Stream = require('../core/stream');
var ScrollTrackerStream = require('../streams/scroll-tracker-stream');
var Emitter = require('../core/emitter');

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

  Emitter.mixin(this);

  var trackerStream = ScrollTrackerStream.create(targetScrollY);
  Stream.onValue(trackerStream, Util.partial(this.trigger, 'both'));

  var beforeStream = Stream.filterFirst('before', trackerStream);
  Stream.onValue(beforeStream, Util.partial(this.trigger, 'before'));

  var afterStream = Stream.filterFirst('after', trackerStream);
  Stream.onValue(afterStream, Util.partial(this.trigger, 'after'));
}

module.exports = ScrollPositionController;

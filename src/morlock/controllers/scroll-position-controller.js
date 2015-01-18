import { partial } from 'morlock/core/util';
import * as Stream from 'morlock/core/stream';
import * as ScrollTrackerStream from 'morlock/streams/scroll-tracker-stream';
import * as Emitter from 'morlock/core/emitter';

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
  Stream.onValue(trackerStream, partial(this.trigger, 'both'));

  var beforeStream = Stream.filterFirst('before', trackerStream);
  Stream.onValue(beforeStream, partial(this.trigger, 'before'));

  var afterStream = Stream.filterFirst('after', trackerStream);
  Stream.onValue(afterStream, partial(this.trigger, 'after'));
}

export default ScrollPositionController;

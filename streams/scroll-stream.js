var Stream = require('../core/stream');
var Util = require('../core/util');
var DOM = require('../core/dom');
var Events = require('../core/events');

/**
 * Create a stream of onscroll events, but only calculate their
 * position on requestAnimationFrame frames.
 * @param {Element=} options.scrollTarget - Targeted for scroll checking.
 * @return {Stream}
 */
function create(options) {
  options = options || {};

  var scrollParent = options.scrollTarget ? options.scrollTarget.parentNode : window;

  var oldScrollY;
  var scrollDirty = true;
  var scrollEventsStream = Stream.createFromEvents(scrollParent, 'scroll');

  Stream.onValue(scrollEventsStream, function onScrollSetDirtyBit_() {
    scrollDirty = true;
  });

  var rAF = Stream.createFromRAF();

  var didChangeOnRAFStream = Stream.filter(function filterDirtyFramesFromRAF_() {
    if (!scrollDirty) { return false; }
    scrollDirty = false;

    var newScrollY = DOM.documentScrollY(scrollParent);

    if (oldScrollY !== newScrollY) {
      oldScrollY = newScrollY;
      return true;
    }

    return false;
  }, rAF);

  // It's going to space, will you just give it a second!
  Util.defer(Util.partial(Events.dispatchEvent, options.scrollTarget, 'scroll'), 10);

  return Stream.map(function getWindowPosition_() {
    return oldScrollY;
  }, didChangeOnRAFStream);
};

module.exports = {
  create: create
};

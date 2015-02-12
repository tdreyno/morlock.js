var Stream = require('../core/stream');
var Util = require('../core/util');
var DOM = require('../core/dom');
var Events = require('../core/events');

/**
 * Create a stream of window.onscroll events, but only calculate their
 * position on requestAnimationFrame frames.
 * @return {Stream}
 */
var create = Util.memoize(function create_() {
  var oldScrollY;
  var scrollDirty = true;
  var scrollEventsStream = Stream.createFromEvents(window, 'scroll');

  Stream.onValue(scrollEventsStream, function onScrollSetDirtyBit_() {
    scrollDirty = true;
  });

  var rAF = Stream.createFromRAF();

  var didChangeOnRAFStream = Stream.filter(function filterDirtyFramesFromRAF_() {
    if (!scrollDirty) { return false; }
    scrollDirty = false;

    var newScrollY = DOM.documentScrollY();
    if (oldScrollY !== newScrollY) {
      oldScrollY = newScrollY;
      return true;
    }

    return false;
  }, rAF);

  // It's going to space, will you just give it a second!
  Util.defer(Util.partial(Events.dispatchEvent, window, 'scroll'), 10);

  return Stream.map(function getWindowPosition_() {
    return oldScrollY;
  }, didChangeOnRAFStream);
});

module.exports = { create: create };

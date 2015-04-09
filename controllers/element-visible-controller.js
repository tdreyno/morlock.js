var Util = require('../core/util');
var DOM = require('../core/dom');
var Stream = require('../core/stream');
var Emitter = require('../core/emitter');
var ScrollController = require('../controllers/scroll-controller');
var ResizeStream = require('../streams/resize-stream');

/**
 * Provides a familiar OO-style API for tracking element position.
 * @constructor
 * @param {Element} elem The element to track
 * @param {Object=} options The options passed to the position tracker.
 * @return {Object} The API with a `on` function to attach scrollEnd
 *   callbacks and an `observeElement` function to detect when elements
 *   enter and exist the viewport.
 */
function ElementVisibleController(elem, options) {
  if (!(this instanceof ElementVisibleController)) {
    return new ElementVisibleController(elem, options);
  }

  Emitter.mixin(this);

  options = options || {};

  this.elem = elem;
  this.buffer = Util.getOption(options.buffer, 0);
  this.isVisible = false;
  this.rect = null;
  this.scrollTarget = options.scrollTarget;

  // Auto trigger if the last value on the stream is what we're looking for.
  var oldOn = this.on;
  this.on = function wrappedOn(eventName, callback, scope) {
    oldOn.apply(this, arguments);

    if (('enter' === eventName) && this.isVisible) {
      scope ? callback.call(scope) : callback();
    }
  };

  var sc = new ScrollController({
    scrollTarget: this.scrollTarget
  });

  sc.on('scroll', this.didScroll, this);
  sc.on('scrollEnd', this.recalculatePosition, this);

  Stream.onValue(ResizeStream.create(), Util.functionBind(this.didResize, this));

  this.viewportRect = {
    height: window.innerHeight,
    top: 0
  };

  this.recalculateOffsets();
  setTimeout(Util.functionBind(this.recalculateOffsets, this), 100);
}

ElementVisibleController.prototype.didResize = function() {
  this.recalculateOffsets();
};

ElementVisibleController.prototype.didScroll = function(currentScrollY) {
  this.update(currentScrollY);
};

ElementVisibleController.prototype.recalculateOffsets = function() {
  this.viewportRect.height = DOM.getViewportHeight();
  this.recalculatePosition();
  this.update(null, true);
};

ElementVisibleController.prototype.recalculatePosition = function(currentScrollY) {
  currentScrollY || (currentScrollY = DOM.documentScrollY(this.scrollTarget && this.scrollTarget.parentNode));

  this.rect = DOM.getRect(this.elem);
  this.rect.top += currentScrollY;

  this.rect.top -= this.buffer;
  this.rect.height += (this.buffer * 2);
};

ElementVisibleController.prototype.update = function(currentScrollY, ignoreCurrentVisibility) {
  currentScrollY || (currentScrollY = DOM.documentScrollY(this.scrollTarget && this.scrollTarget.parentNode));

  this.viewportRect.top = currentScrollY;

  var inY = this.intersects(this.viewportRect, this.rect);

  var isVisible = ignoreCurrentVisibility ? true : this.isVisible;
  var isNotVisible = ignoreCurrentVisibility ? true : !this.isVisible;

  if (isVisible && !inY) {
    this.isVisible = false;
    this.didExit();
  } else if (isNotVisible && inY) {
    this.isVisible = true;
    this.didEnter();
  }
};

ElementVisibleController.prototype.intersects = function(a, b) {
  // var aRight = a.left + a.width;
  // var bRight = b.left + b.width;
  var aBottom = a.top + a.height;
  var bBottom = b.top + b.height;
  return (/*a.left <= aBottom &&
          b.left <= aRight &&*/
          a.top <= bBottom &&
          b.top <= aBottom);
};

ElementVisibleController.prototype.didEnter = function() {
  this.trigger('enter');
  this.trigger('both');
};

ElementVisibleController.prototype.didExit = function() {
  this.trigger('exit');
  this.trigger('both');
};

module.exports = ElementVisibleController;

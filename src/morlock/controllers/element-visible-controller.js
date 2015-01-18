import { getOption, functionBind } from 'morlock/core/util';
import { getRect, getViewportHeight, documentScrollY } from 'morlock/core/dom';
import * as Stream from 'morlock/core/stream';
import * as Emitter from 'morlock/core/emitter';
import ScrollController from 'morlock/controllers/scroll-controller';
import * as ResizeStream from 'morlock/streams/resize-stream';

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
  this.buffer = getOption(options.buffer, 0);
  this.isVisible = false;
  this.rect = null;

  // Auto trigger if the last value on the stream is what we're looking for.
  var oldOn = this.on;
  this.on = function wrappedOn(eventName, callback, scope) {
    oldOn.apply(this, arguments);
    
    if (('enter' === eventName) && this.isVisible) {
      scope ? callback.call(scope) : callback();
    }
  };

  var sc = new ScrollController();
  sc.on('scroll', this.didScroll, this);
  sc.on('scrollEnd', this.recalculatePosition, this);

  Stream.onValue(ResizeStream.create(), functionBind(this.didResize, this));
  
  this.viewportRect = {
    height: window.innerHeight,
    top: 0
  };

  this.recalculateOffsets();
  setTimeout(functionBind(this.recalculateOffsets, this), 100);
}

ElementVisibleController.prototype.didResize = function() {
  this.recalculateOffsets();
};

ElementVisibleController.prototype.didScroll = function(currentScrollY) {
  this.update(currentScrollY);
};

ElementVisibleController.prototype.recalculateOffsets = function() {
  this.viewportRect.height = getViewportHeight();
  this.recalculatePosition();
  this.update(null, true);
};

ElementVisibleController.prototype.recalculatePosition = function(currentScrollY) {
  currentScrollY || (currentScrollY = documentScrollY());

  this.rect = getRect(this.elem);
  this.rect.top += currentScrollY;

  this.rect.top -= this.buffer;
  this.rect.height += (this.buffer * 2);
};

ElementVisibleController.prototype.update = function(currentScrollY, ignoreCurrentVisibility) {
  currentScrollY || (currentScrollY = documentScrollY());

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

export default ElementVisibleController;

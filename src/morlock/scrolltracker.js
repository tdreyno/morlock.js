var EventTarget = __dependency1__.EventTarget;

import { debounce, rectangle, viewportH } from "./morlock/util";

var h = viewportH();

function ElementTracker(element) {
  this.element_ = element;
  this.isVisible_ = false;
}

EventTarget.mixin(ElementTracker.prototype);

ElementTracker.prototype.updateViewport = function() {
  var r = rectangle(this.element_);
  var inY = !!r && r.bottom >= 0 && r.top <= h;

  if (this.isVisible_ && !inY) {
    this.isVisible_ = false;
    this.trigger('exit');
  } else if (!this.isVisible_ && inY) {
    this.isVisible_ = true;
    this.trigger('enter');
  }
};

function ScrollTracker(breakpointController) {
  this.bc_ = breakpointController;

  this.isWatchingScroll_ = false;

  this.elements_ = {};

  var self = this;
  this.listenerFunc_ = debounce(function() {
    self.trigger('scrollEnd');
    self.update_();
  }, 100);

  this.bc_.on('resize', function() {
    h = viewportH();
    self.update_();
  });
}

EventTarget.mixin(ScrollTracker.prototype);

/**
 * Add tracking for a specific element.
 */
ScrollTracker.prototype.observeElement = function(name, elem) {
  this.elements_[name] = new ElementTracker(elem);
  return this.elements_[name];
};

/**
 * Stop tracking for a specific element.
 */
ScrollTracker.prototype.stopObservingElement = function(name) {
  delete this.elements_[name];
};

/**
 * Start observing window scroll events.
 */
ScrollTracker.prototype.watchScroll = function() {
  if (this.isWatchingScroll_) { return; }

  this.isWatchingScroll_ = true;

  if (window.addEventListener) {
    window.addEventListener('scroll', this.listenerFunc_, false);
  } else if (window.attachEvent) {
    window.attachEvent('onscroll', this.listenerFunc_);
  }

  this.update_();
};

/**
 * Stop observing window scroll events.
 */
ScrollTracker.prototype.stopWatchingScroll = function() {
  if (!this.isWatchingScroll_) { return; }

  if (window.removeEventListener) {
    window.removeEventListener('scroll', this.listenerFunc_, false);
  } else if (window.detachEvent) {
    window.detachEvent('onscroll', this.listenerFunc_);
  }

  this.isWatchingScroll_ = false;
};

ScrollTracker.prototype.update_ = function() {
  if (!this.isWatchingScroll_) { return; }

  for (var key in this.elements_) {
    if (this.elements_.hasOwnProperty(key)) {
      this.elements_[key].updateViewport();
    }
  }
};

export { ScrollTracker }
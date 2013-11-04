import { ElementTracker } from "morlock/element-tracker";
import { debounce, getViewportHeight, getRect } from "morlock/util";

var h = getViewportHeight();

function ScrollController() {
  this.isWatchingScroll_ = false;

  this.elements_ = {};

  var self = this;
  this.listenerFunc_ = debounce(function() {
    self.trigger('scrollEnd');
    self.update_();
  }, 100);
}

// jQuery-style event function names.
// makeEventable(ScrollController.prototype, {
//   'listen': 'on',
//   'unlisten': 'off',
//   'emit': 'trigger',
// });


/**
 * Add tracking for a specific element.
 */
ScrollController.prototype.observeElement = function(name, elem) {
  this.elements_[name] = new ElementTracker(elem);
  return this.elements_[name];
};

/**
 * Stop tracking for a specific element.
 */
ScrollController.prototype.stopObservingElement = function(name) {
  delete this.elements_[name];
};

/**
 * Start observing window scroll events.
 */
ScrollController.prototype.watchScroll = function() {
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
ScrollController.prototype.stopWatchingScroll = function() {
  if (!this.isWatchingScroll_) { return; }

  if (window.removeEventListener) {
    window.removeEventListener('scroll', this.listenerFunc_, false);
  } else if (window.detachEvent) {
    window.detachEvent('onscroll', this.listenerFunc_);
  }

  this.isWatchingScroll_ = false;
};

ScrollController.prototype.update_ = function(h) {
  if (!this.isWatchingScroll_) { return; }

  for (var key in this.elements_) {
    if (this.elements_.hasOwnProperty(key)) {
      this.elements_[key].updateViewport();
    }
  }
};

ScrollController.prototype.onResize = function() {
  var h = getViewportHeight();

  for (var key in this.elements_) {
    if (this.elements_.hasOwnProperty(key)) {
      this.elements_[key].updateViewportHeight(h);
    }
  }
};

export { ScrollController }

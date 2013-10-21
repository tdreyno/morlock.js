import { makeEventable } from "./morlock/eventable";
import { debounce, getViewportHeight } from "./morlock/util";

var h = getViewportHeight();

function rectangle(el, cushion) {
  var o = {};
  el && !el.nodeType && (el = el[0]);
  if (!el || 1 !== el.nodeType) { return false; }
  cushion = typeof cushion == 'number' && cushion || 0;
  el = el.getBoundingClientRect(); // read-only
  o['width'] = (o['right'] = el['right'] + cushion) - (o['left'] = el['left'] - cushion);
  o['height'] = (o['bottom'] = el['bottom'] + cushion) - (o['top'] = el['top'] - cushion);
  return o;
}

function ElementTracker(element) {
  this.element_ = element;
  this.isVisible_ = false;
}

// jQuery-style event function names.
makeEventable(ElementTracker.prototype, {
  'listen': 'on',
  'unlisten': 'off',
  'emit': 'trigger',
});

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
    h = getViewportHeight();
    self.update_();
  });
}

// jQuery-style event function names.
makeEventable(ScrollTracker.prototype, {
  'listen': 'on',
  'unlisten': 'off',
  'emit': 'trigger',
});

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
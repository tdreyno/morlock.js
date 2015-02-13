var Util = require('../core/util');
var DOM = require('../core/dom');
var Stream = require('../core/stream');
var ScrollStream = require('../streams/scroll-stream');
var ResizeStream = require('../streams/resize-stream');
var ScrollPositionController = require('../controllers/scroll-position-controller');

function StickyElementController(elem, container, options) {
  if (!(this instanceof StickyElementController)) {
    return new StickyElementController(elem, container, options);
  }

  this.elem = elem;
  this.container = container;
  this.sticky = false;
  this.fixed = false;
  this.originalZIndex = '';
  this.elemWidth = 0;
  this.elemHeight = 0;
  this.containerTop = 0;
  this.containerHeight = 0;
  this.spacer = document.createElement('div');

  options || (options = {});

  this.zIndex = Util.getOption(options.zIndex, 1000);
  this.marginTop = Util.getOption(options.marginTop, 0);
  this.marginBottom = Util.getOption(options.marginBottom, 0);
  this.fixCallBack = Util.getOption(options.fixCallBack, null);
  this.unfixCallBack = Util.getOption(options.unfixCallBack, null);
  this.debounce = Util.getOption(options.debounce, 64);

  subscribeListeners(this);
  onScroll(this, DOM.documentScrollY());
}

StickyElementController.prototype.onResize = function() {
  if (this.disabled) { return; }

  resetPositions(this);
  setupPositions(this);
  onScroll(this, DOM.documentScrollY());
};

StickyElementController.prototype.disable = function() {
  if (this.disabled) { return; }

  Util.forEach(Util.call, this.subscribedListeners_);
  if (this.topOfContainer_) {
    this.topOfContainer_.off('before', this.onBeforeHandler_);
    this.topOfContainer_.off('after', this.onAfterHandler_);
  }

  resetPositions(this);

  this.disabled = true;
};

StickyElementController.prototype.enable = function() {
  if (this.disabled !== undefined && !this.disabled) { return; }

  subscribeListeners(this);
  setupPositions(this);
  onScroll(this, DOM.documentScrollY())

  this.disabled = false;
};

function resetPositions(stickyElement) {
  DOM.removeClass(stickyElement.elem, 'fixed');

  stickyElement.sticky = false;
  stickyElement.fixed = false;

  stickyElement.currentTop = null;

  DOM.detachElement(stickyElement.spacer);

  DOM.setStyles(stickyElement.elem, {
    'zIndex': '',
    'width': '',
    'height': '',
    'position': '',
    'left': '',
    'top': '',
    'display': ''
  });
}

function setupPositions(stickyElement) {
  var containerPosition = DOM.getStyle(stickyElement.container, 'position');
  if ((containerPosition.length === 0) || ('static' === containerPosition)) {
    DOM.setStyle(stickyElement.container, 'position', 'relative');
  }

  stickyElement.originalZIndex = DOM.getStyle(stickyElement.elem, 'zIndex');
  stickyElement.originalPosition = DOM.getStyle(stickyElement.elem, 'position');
  stickyElement.originalOffsetTop = stickyElement.elem.offsetTop;
  stickyElement.originalOffsetLeft = stickyElement.elem.offsetLeft;
  stickyElement.originalFloat = DOM.getStyle(stickyElement.elem, 'float');
  stickyElement.originalWidth = DOM.getStyle(stickyElement.elem, 'width');
  stickyElement.originalHeight = DOM.getStyle(stickyElement.elem, 'height');
  stickyElement.originalDisplay = DOM.getStyle(stickyElement.elem, 'display');

  var obj = stickyElement.elem;
  var computedTop = 0;
  var computedLeft = 0;

  if (obj.offsetParent) {
    do {
      computedTop += obj.offsetTop;
      computedLeft += obj.offsetLeft;
      obj = obj.offsetParent;
    } while (obj);
  }

  stickyElement.originalPositionLeft = computedLeft;
  stickyElement.originalPositionTop = computedTop;

  // Slow, avoid
  var dimensions = stickyElement.elem.getBoundingClientRect();
  stickyElement.elemWidth = dimensions.width;
  stickyElement.elemHeight = dimensions.height;

  var currentScroll = DOM.documentScrollY();

  // Slow, avoid
  var containerDimensions = stickyElement.container.getBoundingClientRect();
  stickyElement.containerTop = containerDimensions.top + currentScroll;
  stickyElement.containerHeight = containerDimensions.height;
  stickyElement.maxTop = stickyElement.containerHeight - stickyElement.elemHeight - evaluateOption(stickyElement, stickyElement.marginBottom);
  stickyElement.fixedTop = stickyElement.originalOffsetTop + stickyElement.containerHeight - stickyElement.elemHeight;

  DOM.setStyles(stickyElement.elem, {
    'position': 'absolute',
    'top': stickyElement.originalOffsetTop + 'px',
    'left': stickyElement.originalOffsetLeft + 'px',
    'width': stickyElement.elemWidth + 'px',
    'height': stickyElement.elemHeight + 'px',
    'display': 'block'
  });

  if (stickyElement.originalPosition !== 'absolute') {
    DOM.addClass(stickyElement.spacer, 'stick-element-spacer');

    DOM.setStyles(stickyElement.spacer, {
      'width': stickyElement.elemWidth + 'px',
      'height': stickyElement.elemHeight + 'px',
      'display': DOM.getStyle(stickyElement.elem, 'display'),
      'float': stickyElement.originalFloat,
      'pointerEvents': 'none',
      'visibility': 'hidden',
      'opacity': 0,
      'zIndex': -1
    });

    // Insert spacer into DOM
    DOM.insertBefore(stickyElement.spacer, stickyElement.elem);
  }

  stickyElement.whenToStick = stickyElement.containerTop - evaluateOption(stickyElement, stickyElement.marginTop);

  stickyElement.onBeforeHandler_ || (stickyElement.onBeforeHandler_ = Util.partial(unfix, stickyElement));
  stickyElement.onAfterHandler_ || (stickyElement.onAfterHandler_ = Util.partial(fix, stickyElement));

  if (stickyElement.topOfContainer_) {
    stickyElement.topOfContainer_.off('before', stickyElement.onBeforeHandler_);
    stickyElement.topOfContainer_.off('after', stickyElement.onAfterHandler_);
  }

  stickyElement.topOfContainer_ = new ScrollPositionController(stickyElement.whenToStick);
  stickyElement.topOfContainer_.on('before', stickyElement.onBeforeHandler_);
  stickyElement.topOfContainer_.on('after', stickyElement.onAfterHandler_);

  if (currentScroll < stickyElement.whenToStick && stickyElement.originalPositionTop !== 0) {
    stickyElement.onBeforeHandler_();
  } else {
    stickyElement.onAfterHandler_();
  }
}

function subscribeListeners(stickyElement) {
  stickyElement.subscribedListeners_ = [
    Stream.onValue(ScrollStream.create(), onScroll(stickyElement)),
    Stream.onValue(
      Stream.debounce(stickyElement.debounce, ResizeStream.create()),
      Util.functionBind(stickyElement.onResize, stickyElement)
    )
  ];
}

var onScroll = Util.autoCurry(function onScroll_(stickyElement, scrollY) {
  if (!stickyElement.sticky) {
    return;
  }

  if (scrollY < 0) {
    return;
  }

  var newTop = scrollY + evaluateOption(stickyElement, stickyElement.marginTop) - stickyElement.containerTop + stickyElement.originalOffsetTop;
      newTop = Math.max(0, Math.min(newTop, stickyElement.maxTop));

  if (stickyElement.currentTop !== newTop) {
    if (newTop === stickyElement.maxTop && stickyElement.fixed) {
      var evalBottom = evaluateOption(stickyElement, stickyElement.marginBottom);
      DOM.setStyles(stickyElement.elem, {
        'position': 'absolute',
        'top': (evalBottom === 0) ? stickyElement.fixedTop : stickyElement.maxTop + 'px',
        'left': stickyElement.originalOffsetLeft + 'px'
      });

      stickyElement.fixed = false;
    } else if (newTop < stickyElement.maxTop && !stickyElement.fixed) {
      var evalTop = evaluateOption(stickyElement, stickyElement.marginTop);
      DOM.setStyles(stickyElement.elem, {
        'top': (evalTop + stickyElement.originalOffsetTop) + 'px',
        'left': stickyElement.originalPositionLeft + 'px',
        'position': 'fixed'
      });

      stickyElement.fixed = true;
    }

    stickyElement.currentTop = newTop;
  }
});

function fix(stickyElement) {
  if (stickyElement.sticky) { return; }

  DOM.addClass(stickyElement.elem, 'fixed');
  DOM.setStyles(stickyElement.elem, {
    'position': 'absolute',
    'top': stickyElement.originalOffsetTop + 'px',
    'left': stickyElement.originalOffsetLeft + 'px',
    'zIndex': stickyElement.zIndex
  });

  stickyElement.sticky = true;

  if (Util.isFunction(stickyElement.fixCallBack)) {
    stickyElement.fixCallBack(stickyElement);
  }
}

function unfix(stickyElement) {
  if (!stickyElement.sticky) { return; }

  DOM.removeClass(stickyElement.elem, 'fixed');
  DOM.setStyles(stickyElement.elem, {
    'position': 'absolute',
    'top': stickyElement.originalOffsetTop + 'px',
    'left': stickyElement.originalOffsetLeft + 'px',
    'zIndex': stickyElement.originalZIndex
  });

  stickyElement.sticky = false;
  stickyElement.fixed = false;

  if (Util.isFunction(stickyElement.unfixCallBack)) {
    stickyElement.unfixCallBack(stickyElement);
  }
}

function evaluateOption(stickyElement, option) {
  if (Util.isFunction(option)) {
    return option(stickyElement);
  } else {
    return option;
  }
}

module.exports = StickyElementController;

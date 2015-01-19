var Util = require('../core/util');
var DOM = require('../core/dom');
var Stream = require('../core/stream');
var ScrollStream = require('../streams/scroll-stream');
var ResizeStream = require('../streams/resize-stream');
var ScrollPositionController = require('../controllers/scroll-position-controller');
var CustomModernizr = require('../vendor/modernizr');

function StickyElementController(elem, container, options) {
  if (!(this instanceof StickyElementController)) {
    return new StickyElementController(elem, container, options);
  }

  this.elem = elem;
  this.container = container;
  this.fixed = false;
  this.useTransform = true;
  this.originalZIndex = '';
  this.elemWidth = 0;
  this.elemHeight = 0;
  this.containerTop = 0;
  this.containerHeight = 0;
  this.originalTop = 0;
  this.spacer = document.createElement('div');

  options || (options = {});

  this.positionType = Util.getOption(options.positionType, 'absolute');
  this.zIndex = Util.getOption(options.zIndex, 1000);
  this.marginTop = Util.getOption(options.marginTop, 0);
  this.marginBottom = Util.getOption(options.marginBottom, 0);
  this.fixCallBack = Util.getOption(options.fixCallBack, null);
  this.unfixCallBack = Util.getOption(options.unfixCallBack, null);

  this.useTransform = CustomModernizr.csstransforms && Util.getOption(options.useTransform, true);

  this.subscribedListeners_ = [
    Stream.onValue(ScrollStream.create(), onScroll(this)),
    Stream.onValue(
      Stream.debounce(64, ResizeStream.create()),
      Util.functionBind(this.onResize, this)
    )
  ];

  setupPositions(this);
  onScroll(this, DOM.documentScrollY());
}

StickyElementController.prototype.onResize = function() {
  resetPositions(this);
  setupPositions(this);
  onScroll(this, DOM.documentScrollY());
};

StickyElementController.prototype.destroy = function() {
  Util.forEach(Util.call, this.subscribedListeners_);
  resetPositions(this);

  this.spacer = null;
};

function resetPositions(stickyElement) {
  unfix(stickyElement);

  stickyElement.currentTop = null;

  DOM.detachElement(stickyElement.spacer);

  DOM.setStyles(stickyElement.elem, {
    'zIndex': '',
    'width': '',
    'height': '',
    'position': '',
    'left': '',
    'top': '',
    // 'overflow': '',
    'display': ''
  });

  if (stickyElement.useTransform) {
    DOM.setStyle(stickyElement.elem, 'transform', '');
  }
}

function setupPositions(stickyElement) {
  var containerPosition = DOM.getStyle(stickyElement.container, 'position');
  if ((containerPosition.length === 0) || ('static' === containerPosition)) {
    DOM.setStyle(stickyElement.container, 'position', 'relative');
  }

  stickyElement.originalZIndex = DOM.getStyle(stickyElement.elem, 'zIndex');
  stickyElement.originalPosition = DOM.getStyle(stickyElement.elem, 'position');
  stickyElement.originalOffsetTop = DOM.getStyle(stickyElement.elem, 'top');
  stickyElement.originalWidth = DOM.getStyle(stickyElement.elem, 'width');
  stickyElement.originalHeight = DOM.getStyle(stickyElement.elem, 'height');
  stickyElement.originalDisplay = DOM.getStyle(stickyElement.elem, 'display');
  // stickyElement.originalOverflow = DOM.getStyle(stickyElement.elem, 'overflow');

  if (stickyElement.useTransform) {
    stickyElement.originalTransform = DOM.getStyle(stickyElement.elem, 'transform');
  }

  // Slow, avoid
  var dimensions = stickyElement.elem.getBoundingClientRect();
  stickyElement.elemWidth = dimensions.width;
  stickyElement.elemHeight = dimensions.height;

  var currentScroll = DOM.documentScrollY();

  var containerDimensions = stickyElement.container.getBoundingClientRect();
  stickyElement.containerTop = containerDimensions.top + currentScroll;
  stickyElement.containerHeight = containerDimensions.height;
  stickyElement.originalTop = stickyElement.elem.offsetTop;

  DOM.setStyles(stickyElement.elem, {
    'position': 'absolute',
    'top': stickyElement.originalTop + 'px',
    'left': stickyElement.elem.offsetLeft + 'px',
    'width': stickyElement.elemWidth + 'px',
    'height': stickyElement.elemHeight + 'px',
    // 'overflow': 'hidden',
    'display': 'block'
  });

  if (stickyElement.originalPosition !== 'absolute') {
    DOM.addClass(stickyElement.spacer, 'stick-element-spacer');

    DOM.setStyles(stickyElement.spacer, {
      // 'width': stickyElement.elemWidth + 'px',
      'height': stickyElement.elemHeight + 'px',
      'display': DOM.getStyle(stickyElement.elem, 'display'),
      'float': DOM.getStyle(stickyElement.elem, 'float'),
      'pointerEvents': 'none',
      'visibility': 'hidden',
      'opacity': 0,
      'zIndex': -1
    });

    // Insert spacer into DOM
    DOM.insertBefore(stickyElement.spacer, stickyElement.elem);
  }

  var whenToStick = stickyElement.containerTop - evaluateOption(stickyElement, stickyElement.marginTop);

  stickyElement.onBeforeHandler_ || (stickyElement.onBeforeHandler_ = Util.partial(unfix, stickyElement));
  stickyElement.onAfterHandler_ || (stickyElement.onAfterHandler_ = Util.partial(fix, stickyElement));

  if (stickyElement.topOfContainer_) {
    stickyElement.topOfContainer_.off('before', stickyElement.onBeforeHandler_);
    stickyElement.topOfContainer_.off('after', stickyElement.onAfterHandler_);
  }

  stickyElement.topOfContainer_ = new ScrollPositionController(whenToStick);
  stickyElement.topOfContainer_.on('before', stickyElement.onBeforeHandler_);
  stickyElement.topOfContainer_.on('after', stickyElement.onAfterHandler_);

  if (currentScroll < whenToStick) {
    stickyElement.onBeforeHandler_();
  } else {
    stickyElement.onAfterHandler_();
  }
}

var onScroll = Util.autoCurry(function onScroll_(stickyElement, scrollY) {
  if (!stickyElement.fixed) { return; }

  if (scrollY < 0) {
    scrollY = 0;
  }

  var newTop = scrollY + evaluateOption(stickyElement, stickyElement.marginTop) - stickyElement.containerTop;
  var maxTop = stickyElement.containerHeight - stickyElement.elemHeight - evaluateOption(stickyElement, stickyElement.marginBottom);

  if (stickyElement.useTransform) {
    maxTop -= stickyElement.originalTop;
  } else {
    newTop += stickyElement.originalTop;
  }

  newTop = Math.max(0, Math.min(newTop, maxTop));

  if (stickyElement.currentTop !== newTop) {

    if (stickyElement.positionType !== 'fixed') {
      if (stickyElement.useTransform) {
        DOM.setStyle(stickyElement.elem, 'transform', 'translate3d(0, ' + newTop + 'px, 0)');
      } else {
        DOM.setStyle(stickyElement.elem, 'top', newTop + 'px');
      }
    }

    stickyElement.currentTop = newTop;
  }
});

function fix(stickyElement) {
  if (stickyElement.fixed) { return; }

  DOM.addClass(stickyElement.elem, 'fixed');
  DOM.setStyles(stickyElement.elem, {
    'position': stickyElement.positionType,
    'zIndex': stickyElement.zIndex
  });

  stickyElement.fixed = true;

  if (Util.isFunction(stickyElement.fixCallBack)) {
    stickyElement.fixCallBack(stickyElement);
  }

}

function unfix(stickyElement) {
  if (!stickyElement.fixed) { return; }

  DOM.removeClass(stickyElement.elem, 'fixed');
  DOM.setStyles(stickyElement.elem, {
    'position': 'absolute',
    'zIndex': stickyElement.originalZIndex,
    'top': stickyElement.originalTop
  });

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

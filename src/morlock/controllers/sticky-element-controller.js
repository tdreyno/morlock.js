import { getOption, autoCurry, partial, forEach, call,
         functionBind, isFunction } from "morlock/core/util";
import { getStyle, setStyle, setStyles, addClass, removeClass, insertBefore,
         documentScrollY, detachElement } from "morlock/core/dom";
module Stream from "morlock/core/stream";
module ScrollStream from "morlock/streams/scroll-stream";
module ResizeStream from "morlock/streams/resize-stream";
import ScrollPositionController from "morlock/controllers/scroll-position-controller";
import CustomModernizr from "vendor/modernizr";

function StickyElementController(elem, container, options) {
  if (!(this instanceof StickyElementController)) {
    return new StickyElementController(elem, container, options);
  }

  this.elem = elem;
  this.container = container;
  this.fixed = false;
  this.useTransform = false;
  this.originalZIndex = '';
  this.elemWidth = 0;
  this.elemHeight = 0;
  this.containerTop = 0;
  this.containerHeight = 0;
  this.originalTop = 0;
  this.spacer = document.createElement('div');

  options || (options = {});

  this.zIndex = getOption(options.zIndex, 1000);
  this.marginTop = getOption(options.marginTop, 0);
  this.marginBottom = getOption(options.marginBottom, 0);
  this.fixCallBack = getOption(options.fixCallBack, null);
  this.unfixCallBack = getOption(options.unfixCallBack, null);

  this.useTransform = CustomModernizr.csstransforms && getOption(options.useTransform, false);

  this.subscribedListeners_ = [
    Stream.onValue(ScrollStream.create(), onScroll(this)),
    Stream.onValue(
      Stream.debounce(getOption(options.debounce, 64), ResizeStream.create()),
      functionBind(this.onResize, this)
    )
  ];

  setupPositions(this);
  onScroll(this, documentScrollY());
}

StickyElementController.prototype.onResize = function() {
  resetPositions(this);
  setupPositions(this);
  onScroll(this, documentScrollY());
};

StickyElementController.prototype.destroy = function() {
  forEach(call, this.subscribedListeners_);
  resetPositions(this);

  this.spacer = null;
};

function resetPositions(stickyElement) {
  unfix(stickyElement);

  stickyElement.currentTop = null;

  detachElement(stickyElement.spacer);

  setStyles(stickyElement.elem, {
    'zIndex': '',
    'width': '',
    'height': '',
    'position': '',
    'left': '',
    'top': '',
    'display': ''
  });

  if (stickyElement.useTransform) {
    setStyle(stickyElement.elem, 'transform', '');
  }
}

function setupPositions(stickyElement) {
  var containerPosition = getStyle(stickyElement.container, 'position');
  if ((containerPosition.length === 0) || ('static' === containerPosition)) {
    setStyle(stickyElement.container, 'position', 'relative');
  }

  stickyElement.originalZIndex = getStyle(stickyElement.elem, 'zIndex');
  stickyElement.originalPosition = getStyle(stickyElement.elem, 'position');
  stickyElement.originalOffsetTop = stickyElement.elem.offsetTop;
  stickyElement.originalOffsetLeft = stickyElement.elem.offsetLeft;
  stickyElement.originalFloat = getStyle(stickyElement.elem, 'float');
  stickyElement.originalWidth = getStyle(stickyElement.elem, 'width');
  stickyElement.originalHeight = getStyle(stickyElement.elem, 'height');
  stickyElement.originalDisplay = getStyle(stickyElement.elem, 'display');

  var obj = stickyElement.elem;
  var computedTop = 0;
  var computedLeft = 0;
  if (obj.offsetParent) {
    do {
      computedTop += obj.offsetTop;
      computedLeft += obj.offsetLeft;
    } while (obj = obj.offsetParent);
  }

  stickyElement.originalPositionLeft = computedLeft;
  stickyElement.originalPositionTop = computedTop;

  if (stickyElement.useTransform) {
    stickyElement.originalTransform = getStyle(stickyElement.elem, 'transform');
  }

  // Slow, avoid
  var dimensions = stickyElement.elem.getBoundingClientRect();
  stickyElement.elemWidth = dimensions.width;
  stickyElement.elemHeight = dimensions.height;

  var currentScroll = documentScrollY();

  // Slow, avoid
  var containerDimensions = stickyElement.container.getBoundingClientRect();
  stickyElement.containerTop = containerDimensions.top + currentScroll;
  stickyElement.containerHeight = containerDimensions.height;
  stickyElement.maxTop = stickyElement.containerHeight - stickyElement.elemHeight - evaluateOption(stickyElement, stickyElement.marginBottom);

  setStyles(stickyElement.elem, {
    'position': 'absolute',
    'top': stickyElement.originalOffsetTop + 'px',
    'left': stickyElement.originalOffsetLeft + 'px',
    'width': stickyElement.elemWidth + 'px',
    'height': stickyElement.elemHeight + 'px',
    'display': 'block'
  });

  if (stickyElement.originalPosition !== 'absolute') {
    addClass(stickyElement.spacer, 'stick-element-spacer');

    setStyles(stickyElement.spacer, {
      'width': stickyElement.elemWidth + 'px',
      'height': stickyElement.elemHeight + 'px',
      'display': getStyle(stickyElement.elem, 'display'),
      'float': stickyElement.originalFloat,
      'pointerEvents': 'none',
      'visibility': 'hidden',
      'opacity': 0,
      'zIndex': -1
    });

    // Insert spacer into DOM
    insertBefore(stickyElement.spacer, stickyElement.elem);
  }

  var whenToStick = stickyElement.containerTop - evaluateOption(stickyElement, stickyElement.marginTop);

  stickyElement.onBeforeHandler_ || (stickyElement.onBeforeHandler_ = partial(unfix, stickyElement));
  stickyElement.onAfterHandler_ || (stickyElement.onAfterHandler_ = partial(fix, stickyElement));

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

var onScroll = autoCurry(function onScroll_(stickyElement, scrollY) {
  if (!stickyElement.fixed) {
    return;
  }

  if (scrollY < 0) {
    scrollY = 0;
  }

  var newTop = scrollY + evaluateOption(stickyElement, stickyElement.marginTop) - stickyElement.containerTop;
  var maxTop = stickyElement.maxTop;

  if (stickyElement.useTransform) {
    maxTop -= stickyElement.originalOffsetTop;
  } else {
    newTop += stickyElement.originalOffsetTop;
  }

  newTop = Math.max(0, Math.min(newTop, maxTop));

  if (stickyElement.currentTop !== newTop) {
    if (stickyElement.useTransform) {
      setStyle(stickyElement.elem, 'transform', 'translate3d(0, ' + newTop + 'px, 0)');
    } else if (newTop === maxTop) {
      setStyles(stickyElement.elem, {
        'position': 'absolute',
        'top': (stickyElement.originalOffsetTop + stickyElement.containerHeight - stickyElement.elemHeight) + 'px',
        'left': stickyElement.originalOffsetLeft + 'px'
      });

      stickyElement.stuck = true;
    } else if (newTop < maxTop && stickyElement.stuck) {
      stickyElement.stuck = false;
      setStyles(stickyElement.elem, {
        'position': 'fixed',
        'top': stickyElement.marginTop + 'px',
        'left': stickyElement.originalPositionLeft + 'px'
      });
    }

    stickyElement.currentTop = newTop;
  }
});

function fix(stickyElement) {
  if (stickyElement.fixed) { return; }

  addClass(stickyElement.elem, 'fixed');
  setStyles(stickyElement.elem, {
    'position': (stickyElement.useTransform) ? 'absolute' : 'fixed',
    'zIndex': stickyElement.zIndex
  });

  stickyElement.fixed = true;

  if (!stickyElement.useTransform) {
    setStyles(stickyElement.elem, {
      'top': stickyElement.marginTop + 'px',
      'left': stickyElement.originalPositionLeft + 'px'
    });
  }

  if (isFunction(stickyElement.fixCallBack)) {
    stickyElement.fixCallBack(stickyElement);
  }
}

function unfix(stickyElement) {
  if (!stickyElement.fixed) { return; }

  removeClass(stickyElement.elem, 'fixed');
  setStyles(stickyElement.elem, {
    'position': 'absolute',
    'zIndex': stickyElement.originalZIndex,
    'top': stickyElement.originalOffsetTop + 'px',
    'left': stickyElement.originalOffsetLeft + 'px'
  });

  stickyElement.fixed = false;

  if (isFunction(stickyElement.unfixCallBack)) {
    stickyElement.unfixCallBack(stickyElement);
  }
}

function evaluateOption(stickyElement, option) {
  if (isFunction(option)) {
    return option(stickyElement);
  } else {
    return option;
  }
}

export default = StickyElementController;

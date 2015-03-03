/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["morlock"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var ResizeController = __webpack_require__(2);
	var BreakpointController = __webpack_require__(3);
	var ScrollController = __webpack_require__(4);
	var ElementVisibleController = __webpack_require__(5);
	var ScrollPositionController = __webpack_require__(6);
	var StickyElementController = __webpack_require__(7);
	var ResponsiveImage = __webpack_require__(8);
	var API = __webpack_require__(9);
	var jQ = __webpack_require__(10);

	API.enableJQuery = function enableJQuery($) {
	  $ || ($ = jQuery);

	  if (!$) { return; }

	  jQ.defineJQueryPlugins($);
	};

	module.exports = API;
	module.exports.ResizeController = ResizeController;
	module.exports.BreakpointController = BreakpointController;
	module.exports.ResponsiveImage = ResponsiveImage;
	module.exports.ScrollController = ScrollController;
	module.exports.ElementVisibleController = ElementVisibleController;
	module.exports.ScrollPositionController = ScrollPositionController;
	module.exports.StickyElementController = StickyElementController;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var Stream = __webpack_require__(14);
	var ResizeStream = __webpack_require__(15);
	var Emitter = __webpack_require__(16);

	/**
	 * Provides a familiar OO-style API for tracking resize events.
	 * @constructor
	 * @param {Object=} options The options passed to the resize tracker.
	 * @return {Object} The API with a `on` function to attach callbacks
	 *   to resize events and breakpoint changes.
	 */
	function ResizeController(options) {
	  if (!(this instanceof ResizeController)) {
	    return new ResizeController(options);
	  }

	  Emitter.mixin(this);

	  options = options || {};

	  var resizeStream = ResizeStream.create(options);
	  Stream.onValue(resizeStream, Util.partial(this.trigger, 'resize'));

	  var debounceMs = Util.getOption(options.debounceMs, 200);
	  var resizeEndStream = debounceMs <= 0 ? resizeStream : Stream.debounce(
	    debounceMs,
	    resizeStream
	  );
	  Stream.onValue(resizeEndStream, Util.partial(this.trigger, 'resizeEnd'));

	  this.destroy = function() {
	    Stream.close(resizeStream);
	    this.off('resize');
	    this.off('resizeEnd');
	  };
	}

	module.exports = ResizeController;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var Stream = __webpack_require__(14);
	var BreakpointStream = __webpack_require__(17);
	var Emitter = __webpack_require__(16);

	/**
	 * Provides a familiar OO-style API for tracking breakpoint events.
	 * @constructor
	 * @param {Object=} options The options passed to the breakpoint tracker.
	 * @return {Object} The API with a `on` function to attach callbacks
	 *   to breakpoint changes.
	 */
	function BreakpointController(options) {
	  if (!(this instanceof BreakpointController)) {
	    return new BreakpointController(options);
	  }

	  Emitter.mixin(this);

	  var breakpointStream = BreakpointStream.create(options.breakpoints, {
	    throttleMs: options.throttleMs,
	    debounceMs: options.debounceMs
	  });

	  var activeBreakpoints = {};

	  var self = this;
	  Stream.onValue(breakpointStream, function(e) {
	    activeBreakpoints[e[0]] = e[1];

	    var namedState = e[1] ? 'enter' : 'exit';
	    self.trigger('breakpoint', [e[0], namedState]);
	    self.trigger('breakpoint:' + e[0], [e[0], namedState]);
	  });

	  this.getActiveBreakpoints = function getActiveBreakpoints() {
	    var isActive = Util.compose(Util.isTrue, Util.get(activeBreakpoints));
	    return Util.select(isActive, Util.objectKeys(activeBreakpoints));
	  };
	}

	module.exports = BreakpointController;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var Stream = __webpack_require__(14);
	var ScrollStream = __webpack_require__(19);
	var Emitter = __webpack_require__(16);

	/**
	 * Provides a familiar OO-style API for tracking scroll events.
	 * @constructor
	 * @param {Object=} options The options passed to the scroll tracker.
	 * @return {Object} The API with a `on` function to attach scrollEnd
	 *   callbacks and an `observeElement` function to detect when elements
	 *   enter and exist the viewport.
	 */
	function ScrollController(options) {
	  if (!(this instanceof ScrollController)) {
	    return new ScrollController(options);
	  }

	  Emitter.mixin(this);

	  options = options || {};

	  var scrollStream = ScrollStream.create();
	  Stream.onValue(scrollStream, Util.partial(this.trigger, 'scroll'));

	  var scrollEndStream = Stream.debounce(
	    Util.getOption(options.debounceMs, 200),
	    scrollStream
	  );
	  Stream.onValue(scrollEndStream, Util.partial(this.trigger, 'scrollEnd'));
	}

	module.exports = ScrollController;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var DOM = __webpack_require__(18);
	var Stream = __webpack_require__(14);
	var Emitter = __webpack_require__(16);
	var ScrollController = __webpack_require__(4);
	var ResizeStream = __webpack_require__(15);

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
	  currentScrollY || (currentScrollY = DOM.documentScrollY());

	  this.rect = DOM.getRect(this.elem);
	  this.rect.top += currentScrollY;

	  this.rect.top -= this.buffer;
	  this.rect.height += (this.buffer * 2);
	};

	ElementVisibleController.prototype.update = function(currentScrollY, ignoreCurrentVisibility) {
	  currentScrollY || (currentScrollY = DOM.documentScrollY());

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


/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var Stream = __webpack_require__(14);
	var ScrollTrackerStream = __webpack_require__(20);
	var Emitter = __webpack_require__(16);

	/**
	 * Provides a familiar OO-style API for tracking scroll position.
	 * @constructor
	 * @param {Element} targetScrollY The position to track.
	 * @return {Object} The API with a `on` function to attach scrollEnd
	 *   callbacks and an `observeElement` function to detect when elements
	 *   enter and exist the viewport.
	 */
	function ScrollPositionController(targetScrollY) {
	  if (!(this instanceof ScrollPositionController)) {
	    return new ScrollPositionController(targetScrollY);
	  }

	  Emitter.mixin(this);

	  var trackerStream = ScrollTrackerStream.create(targetScrollY);
	  Stream.onValue(trackerStream, Util.partial(this.trigger, 'both'));

	  var beforeStream = Stream.filterFirst('before', trackerStream);
	  Stream.onValue(beforeStream, Util.partial(this.trigger, 'before'));

	  var afterStream = Stream.filterFirst('after', trackerStream);
	  Stream.onValue(afterStream, Util.partial(this.trigger, 'after'));
	}

	module.exports = ScrollPositionController;


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var DOM = __webpack_require__(18);
	var Stream = __webpack_require__(14);
	var ScrollStream = __webpack_require__(19);
	var ResizeStream = __webpack_require__(15);
	var ScrollPositionController = __webpack_require__(6);

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


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var DOM = __webpack_require__(18);
	var ResizeController = __webpack_require__(2);
	var ElementVisibleController = __webpack_require__(5);
	var Emitter = __webpack_require__(16);

	/**
	 * Ghetto Record implementation.
	 */
	function ResponsiveImage() {
	  if (!(this instanceof ResponsiveImage)) {
	    return new ResponsiveImage();
	  }

	  this.element = null;
	  this.loadedSizes = {};
	  this.knownSizes = [];
	  this.currentBreakpoint = null;
	  this.src = null;
	  this.isFlexible = false;
	  this.hasRetina = false;
	  this.preserveAspectRatio = false;
	  this.knownDimensions = null;
	  this.hasLoaded = false;
	}

	function create(imageMap) {
	  var image = new ResponsiveImage();
	  image.getPath = Util.getOption(imageMap.getPath, getPath);

	  Util.mapObject(Util.flip(Util.set(image)), imageMap);

	  if (image.knownDimensions && image.preserveAspectRatio) {
	    applyAspectRatioPadding(image);
	  }

	  if (image.lazyLoad) {
	    image.observer = new ElementVisibleController(image.element);

	    image.observer.on('enter', function onEnter_() {
	      if (!image.checkIfVisible(image)) { return; }

	      image.observer.off('enter', onEnter_);

	      image.lazyLoad = false;
	      update(image);
	    });
	  }

	  var controller = new ResizeController({
	    debounceMs: Util.getOption(imageMap.debounceMs, 200)
	  });

	  controller.on('resizeEnd', Util.partial(update, image));

	  Emitter.mixin(image);

	  return image;
	}

	function createFromElement(elem, options) {
	  options || (options = {});

	  var imageMap = {
	    element: elem,
	    src: Util.getOption(options.src, elem.getAttribute('data-src')),
	    lazyLoad: Util.getOption(options.lazyLoad, elem.getAttribute('data-lazyload') === 'true'),
	    isFlexible: Util.getOption(options.isFlexible, elem.getAttribute('data-isFlexible') !== 'false'),
	    hasRetina: Util.getOption(options.hasRetina, (elem.getAttribute('data-hasRetina') === 'true') && (window.devicePixelRatio > 1.5)),
	    preserveAspectRatio: Util.getOption(options.preserveAspectRatio, elem.getAttribute('data-preserveAspectRatio') === 'true'),
	    checkIfVisible: Util.getOption(options.checkIfVisible, function() {
	      return true;
	    })
	  };

	  if ('function' === typeof options.getPath) {
	    imageMap.getPath = options.getPath;
	  }

	  imageMap.knownDimensions = Util.getOption(options.knownDimensions, function() {
	    var dimensionsString = elem.getAttribute('data-knownDimensions');
	    if (dimensionsString && (dimensionsString !== 'false')) {
	      return [
	        Util.parseInteger(dimensionsString.split('x')[0]),
	        Util.parseInteger(dimensionsString.split('x')[1])
	      ];
	    }
	  }, true);

	  imageMap.knownSizes = getBreakpointSizes(elem);

	  if (imageMap.knownDimensions && imageMap.preserveAspectRatio) {
	    applyAspectRatioPadding(imageMap);
	  }

	  return create(imageMap);
	}

	/**
	 * Set a padding percentage which allows the image to scale proportionally.
	 * @param {ResponsiveImage} image The image data.
	 */
	function applyAspectRatioPadding(image) {
	  var ratioPadding = (image.knownDimensions[1] / image.knownDimensions[0]) * 100.0;
	  DOM.setStyle(image.element, 'paddingBottom', ratioPadding + '%');
	}

	/**
	 * Parse the breakpoints = require(the `data-breakpoints` attribute.
	 * @param {Element} element The source element.
	 * @return {Array} Sorted array of known sizes.
	 */
	function getBreakpointSizes(element) {
	  var breakpointString = element.getAttribute('data-breakpoints');

	  var knownSizes = Util.map(function(s) {
	    return Util.parseInteger(s);
	  }, breakpointString ? breakpointString.split(',') : []);

	  if (knownSizes.length <= 0) {
	    return [0];
	  } else {
	    return Util.sortBy(knownSizes, function sortAscending(a, b) {
	      return b - a;
	    });
	  }
	}

	/**
	 * Detect the current breakpoint and update the element if necessary.
	 */
	function update(image) {
	  if (image.lazyLoad) {
	    return;
	  }

	  var rect = DOM.getRect(image.element);
	  var foundBreakpoint;

	  for (var i = 0; i < image.knownSizes.length; i++) {
	    var s = image.knownSizes[i];

	    if (rect.width <= s) {
	      foundBreakpoint = s;
	    } else {
	      break;
	    }
	  }

	  if (!foundBreakpoint) {
	    foundBreakpoint = image.knownSizes[0];
	  }

	  if (foundBreakpoint !== image.currentBreakpoint) {
	    image.currentBreakpoint = foundBreakpoint;
	    loadImageForBreakpoint(image, image.currentBreakpoint);
	  }
	}

	function checkVisibility(image) {
	  if (!image.lazyLoad) {
	    return;
	  }

	  image.observer.recalculateOffsets();
	}

	/**
	 * Load the requested image.
	 * @param {ResponsiveImage} image The ResponsiveImage instance.
	 * @param {String} s Filename.
	 */
	function loadImageForBreakpoint(image, s) {
	  var alreadyLoaded = image.loadedSizes[s];

	  if ('undefined' !== typeof alreadyLoaded) {
	    setImage(image, alreadyLoaded);
	  } else {
	    var img = new Image();

	    img.onload = function() {
	      image.loadedSizes[s] = img;
	      setImage(image, img);
	    };

	    // If requesting retina fails
	    img.onerror = function() {
	      if (image.hasRetina) {
	        img.src = image.getPath(image, s, false);
	      } else {
	        image.trigger('error', img);
	      }
	    };

	    img.src = image.getPath(image, s, image.hasRetina);
	  }
	}

	/**
	 * Set the image on the element.
	 * @param {Element} img Image element.
	 */
	function setImage(image, img) {
	  if (!image.hasLoaded) {
	    image.hasLoaded = true;

	    setTimeout(function() {
	      image.element.className += ' loaded';
	    }, 100);
	  }

	  image.trigger('load', img);

	  if (image.element.tagName.toLowerCase() === 'img') {
	    return setImageTag(image, img);
	  } else {
	    return setDivTag(image, img);
	  }
	}

	/**
	 * Set the image on the img element.
	 * @param {Element} img Image element.
	 */
	function setImageTag(image, img) {
	  image.element.src = img.src;
	}

	/**
	 * Set the image on the div element.
	 * @param {Element} img Image element.
	 */
	function setDivTag(image, img) {
	  var setElemStyle = DOM.setStyle(image.element);
	  setElemStyle('backgroundImage', 'url(' + img.src + ')');

	  if (image.preserveAspectRatio) {
	    var w, h;

	    if (image.knownDimensions) {
	      w = image.knownDimensions[0];
	      h = image.knownDimensions[1];
	    } else {
	      w = img.width;
	      h = img.height;
	    }

	    setElemStyle('backgroundSize', 'cover');

	    if (image.isFlexible) {
	      setElemStyle('paddingBottom', ((h / w) * 100.0) + '%');
	    } else {
	      setElemStyle('width', w + 'px');
	      setElemStyle('height', h + 'px');
	    }
	  }
	}

	/**
	 * Get the path for the image given the current breakpoints and
	 * browser features.
	 * @param {ResponsiveImage} image The image data.
	 * @param {String} s Requested path.
	 * @param {boolean} wantsRetina If we should look for retina.
	 * @return {String} The resulting path.
	 */
	function getPath(image, s, wantsRetina) {
	  if (s === 0) { return image.src; }

	  var parts = image.src.split('.');
	  var ext = parts.pop();

	  return parts.join('.') + '-' + s + (wantsRetina ? '@2x' : '') + '.' + ext;
	}

	module.exports = {
	  create: create,
	  createFromElement: createFromElement,
	  update: update,
	  checkVisibility: checkVisibility
	};


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var ResizeController = __webpack_require__(2);
	var BreakpointController = __webpack_require__(3);
	var ScrollController = __webpack_require__(4);
	var ElementVisibleController = __webpack_require__(5);
	var ScrollPositionController = __webpack_require__(6);
	var StickyElementController = __webpack_require__(7);
	var Util = __webpack_require__(11);
	var Events = __webpack_require__(12);
	var Buffer = __webpack_require__(13);
	var Stream = __webpack_require__(14);

	var getResizeTracker = Util.memoize(function(options) {
	  return new ResizeController(options);
	});

	var getScrollTracker = Util.memoize(function(options) {
	  return new ScrollController(options);
	});

	var getPositionTracker = Util.memoize(function(pos) {
	  return morlock.observePosition(pos);
	});

	var sharedBreakpointDefs = [];
	var sharedBreakpointsVals = [];
	function getBreakpointTracker(def) {
	  var found = false;

	  for (var i = 0; i < sharedBreakpointDefs.length; i++) {
	    if (Util.equals(sharedBreakpointDefs[i], def)) {
	      found = true;
	      break;
	    }
	  }

	  if (found) {
	    return sharedBreakpointsVals[i];
	  } else {
	    var controller = new BreakpointController(def);
	    sharedBreakpointDefs.push(def);
	    sharedBreakpointsVals.push(controller);
	    return controller;
	  }
	}

	module.exports = {
	  onResize: function onResize(cb) {
	    var st = getResizeTracker({ debounceMs: 0 });
	    return st.on('resize', cb);
	  },

	  onResizeEnd: function onResizeEnd(cb, options) {
	    var st = getResizeTracker(options);
	    return st.on('resizeEnd', cb);
	  },

	  onScroll: function onScroll(cb) {
	    var st = getScrollTracker();
	    return st.on('scroll', cb);
	  },

	  onScrollEnd: function onScrollEnd(cb) {
	    var st = getScrollTracker();
	    return st.on('scrollEnd', cb);
	  },

	  observeElement: function observeElement(elem, options) {
	    return new ElementVisibleController(elem, options);
	  },

	  observePosition: function observePosition(positionY) {
	    return new ScrollPositionController(positionY);
	  },

	  stickyElement: function stickyElement(elem, container, options) {
	    return new StickyElementController(elem, container, options);
	  },

	  breakpoint: {
	    enter: function(def, cb) {
	      var controller = getBreakpointTracker({
	        breakpoints: {
	          singleton: def
	        }
	      });

	      controller.on('breakpoint:singleton', function(data) {
	        if (data[1] === 'enter') {
	          cb(data);
	        }
	      });
	    },

	    exit: function(def, cb) {
	      var controller = getBreakpointTracker({
	        breakpoints: {
	          singleton: def
	        }
	      });

	      controller.on('breakpoint:singleton', function(data) {
	        if (data[1] === 'exit') {
	          cb(data);
	        }
	      });
	    }
	  },

	  position: {
	    before: function(pos, cb) {
	      var observer = getPositionTracker(pos);
	      return observer.on('before', cb);
	    },

	    after: function(pos, cb) {
	      var observer = getPositionTracker(pos);
	      return observer.on('after', cb);
	    }
	  }
	};

	module.exports.Stream = Stream;
	module.exports.Events = Events;
	module.exports.Buffer = Buffer;
	module.exports.Util = Util;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var morlock = __webpack_require__(9);
	var BreakpointController = __webpack_require__(3);
	var StickyElementController = __webpack_require__(7);
	var ResponsiveImage = __webpack_require__(8);

	function defineJQueryPlugins($) {
	  $.fn.morlockResize = function(options) {
	    return $(this).each(function() {
	      if (this !== window) {
	        // console.log('must attach event to window', this);
	        return;
	      }

	      var $this = $(this);
	      morlock.onResize(function(d) {
	        $this.trigger('morlockResize', d);
	      });
	      morlock.onResizeEnd(function(d) {
	        $this.trigger('morlockResizeEnd', d);
	      }, options);
	    });
	  };

	  $.fn.morlockScroll = function() {
	    return $(this).each(function() {
	      if (this !== window) {
	        // console.log('must attach event to window', this);
	        return;
	      }

	      var $this = $(this);
	      morlock.onScroll(function() {
	        $this.trigger('morlockScroll');
	      });
	      morlock.onScrollEnd(function() {
	        $this.trigger('morlockScrollEnd');
	      });
	    });
	  };

	  $.fn.morlockElementPosition = function(position) {
	    return $(this).each(function() {
	      if (this !== window) {
	        // console.log('must attach event to window', this);
	        return;
	      }

	      var $this = $(this);
	      morlock.position.before(position, function() {
	        $this.trigger('morlockElementPositionBefore', position);
	      });
	      morlock.position.after(position, function() {
	        $this.trigger('morlockElementPositionAfter', position);
	      });
	    });
	  };

	  $.fn.morlockBreakpoint = function(options) {
	    return $(this).each(function() {
	      if (this !== window) {
	        // console.log('must attach event to window', this);
	        return;
	      }

	      var $this = $(this);
	      var controller = new BreakpointController(options);
	      controller.on('breakpoint', function(e) {
	        $this.trigger('morlockBreakpoint', e);
	      });
	    });
	  };

	  $.fn.morlockElementVisible = function(options) {
	    return $(this).each(function() {
	      var $this = $(this);

	      var observer = morlock.observeElement(this, options);

	      observer.on('enter', function() {
	        $this.trigger('morlockElementVisibleEnter');
	      });
	      observer.on('exit', function() {
	        $this.trigger('morlockElementVisibleExit');
	      });
	    });
	  };

	  $.fn.morlockStickyElement = function(elementsSelector, options) {
	    return $(this).each(function() {
	      var container = this;
	      $(container).find(elementsSelector).each(function() {
	        $(this).data(
	          'morlockStickyElementController',
	          new StickyElementController(this, container, options)
	        );
	      });
	    });
	  };

	  $.fn.morlockResponsiveImage = function(options) {
	    return $(this).each(function() {
	      var $this = $(this);

	      var controller = ResponsiveImage.createFromElement(this, options);
	      controller.on('load', function(img) {
	        $this.trigger('morlockResponsiveImageLoaded', img);
	      });

	      $this.data(
	        'morlockResponsiveImageController',
	        controller
	      );
	    });
	  };
	}

	module.exports = { defineJQueryPlugins: defineJQueryPlugins };


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var NATIVE_ARRAY_SLICE = Array.prototype.slice;
	var NATIVE_ARRAY_INDEXOF = Array.prototype.indexOf;
	var NATIVE_ARRAY_MAP = Array.prototype.map;
	var NATIVE_ARRAY_FOREACH = Array.prototype.forEach;
	var NATIVE_ARRAY_REVERSE = Array.prototype.reverse;
	var NATIVE_ARRAY_REDUCE = Array.prototype.reduce;
	var NATIVE_ARRAY_FILTER = Array.prototype.filter;
	var NATIVE_ARRAY_UNSHIFT = Array.prototype.unshift;
	var NATIVE_ARRAY_SHIFT = Array.prototype.shift;
	var NATIVE_ARRAY_PUSH = Array.prototype.push;
	var NATIVE_ARRAY_POP = Array.prototype.pop;
	var NATIVE_ARRAY_SORT = Array.prototype.sort;
	var NATIVE_FUNCTION_BIND = Function.prototype.bind;

	/**
	 * Slice an array.
	 * @param {array} arr The original array.
	 * @param {number} pos The position to slice from.
	 * @return {array} New sliced array.
	 */
	function slice(arr, pos) {
	  return NATIVE_ARRAY_SLICE.call(arr, pos);
	}

	/**
	 * Shallow copy an array.
	 * @param {array} arr The original array.
	 * @return {array} New copied array.
	 */
	function copyArray(arr) {
	  return slice(arr, 0);
	}

	function concat(arr1, arr2) {
	  return arr1.concat(arr2);
	}

	/**
	 * Backwards compatible Array.prototype.indexOf
	 * @param {array} list List of items.
	 * @param {object} item Item to search for.
	 * @return {number} Index of match or -1 if not found.
	 */
	function indexOf(list, item) {
	  if (NATIVE_ARRAY_INDEXOF) {
	    return NATIVE_ARRAY_INDEXOF.call(list, item);
	  }

	  for (var i = 0; i < list.length; i++) {
	    if (list[i] === item) {
	      return i;
	    }
	  }

	  return -1;
	}

	/**
	 * Throttle a function.
	 * @param {function} f The function.
	 * @param {number} delay The delay in ms.
	 * @return {function} A function which calls the passed-in function throttled.
	 */
	function throttle(f, delay) {
	  var timeoutId;
	  var previous = 0;

	  return function throttleExecute_() {
	    var args = arguments;
	    var now = +(new Date());
	    var remaining = delay - (now - previous);

	    if (remaining <= 0) {
	      clearTimeout(timeoutId);
	      timeoutId = null;
	      previous = now;

	      f.apply(null, args);
	    } else if (!timeoutId) {
	      timeoutId = setTimeout(function() {
	        previous = +(new Date());
	        timeoutId = null;

	        f.apply(null, args);
	      }, remaining);
	    }
	  };
	}

	/**
	 * Debounce a function.
	 * @param {function} f The function.
	 * @param {number} delay The delay in ms.
	 * @return {function} A function which calls the passed-in function debounced.
	 */
	function debounce(f, delay) {
	  var timeoutId = null;

	  return function debounceExecute_() {
	    clearTimeout(timeoutId);
	    var lastArgs = arguments;

	    timeoutId = setTimeout(function() {
	      timeoutId = null;
	      f.apply(null, lastArgs);
	    }, delay);
	  };
	}

	function identity(val) {
	  return val;
	}

	function memoize(f, argsToStringFunc) {
	  var cache = Object.create(null);

	  argsToStringFunc = isDefined(argsToStringFunc) ? argsToStringFunc : JSON.stringify;

	  return function memoizedExecute_() {
	    var key = arguments.length > 0 ? argsToStringFunc.apply(this, arguments) : 'noargs';

	    if (!isDefined(cache[key])) {
	      cache[key] = f.apply(this, arguments);
	    }

	    return cache[key];
	  };
	}

	function curry(fn) {
	  var args = rest(arguments);

	  return function curriedFunction_() {
	    return fn.apply(null, args.concat(copyArray(arguments)));
	  };
	}

	function autoCurry(fn, numArgs) {
	  numArgs || (numArgs = fn.length);

	  var f = function autoCurriedFunction_() {
	    if (arguments.length < numArgs) {
	      var newLength = numArgs - arguments.length;
	      if (newLength > 0) {
	        return autoCurry(
	          curry.apply(null, concat([fn], copyArray(arguments))),
	          newLength
	        );
	      } else {
	        return curry.apply(null, concat([fn], copyArray(arguments)));
	      }
	    } else {
	      return fn.apply(null, arguments);
	    }
	  };

	  f.curried = true;
	  
	  f.toString = function curriedToString_() {
	    return fn.toString();
	  };

	  f.arity = fn.length; // can't seem to set .length of f

	  return f;
	}

	/**
	 * Map a function over an object.
	 * @param {object} obj The object.
	 * @param {function} f The function.
	 * @return {object} The resulting object.
	 */
	function mapObject(f, obj) {
	  return reduce(function mapObjectExecute_(sum, v) {
	    sum[v] = f(obj[v], v);
	    return sum;
	  }, objectKeys(obj), {});
	}

	function unary(fn) {
	  if (fn.length === 1) {
	    return fn;
	  } else {
	    return function unaryExecute_(firstParam) {
	      return fn.call(this, firstParam);
	    };
	  }
	}

	/**
	 * Map a function over an object.
	 * @param {object} obj The object.
	 * @param {function} f The function.
	 * @return {object} The resulting object.
	 */
	function map(f, arr) {
	  if (NATIVE_ARRAY_MAP) {
	    return arr ? NATIVE_ARRAY_MAP.call(arr, f) : arr;
	  }

	  var output = [];

	  for (var i = 0; arr && i < arr.length; i++) {
	    output.push(f(arr[i], i, arr));
	  }

	  return output;
	}

	/**
	 * Loop a function over an object, for side-effects.
	 * @param {object} obj The object.
	 * @param {function} f The function.
	 */
	function forEach(f, arr) {
	  if (NATIVE_ARRAY_FOREACH) {
	    if (arr) {
	      NATIVE_ARRAY_FOREACH.call(arr, f);
	    }

	    return;
	  }

	  for (var i = 0; i < arr.length; i++) {
	    f(arr[i], i, arr);
	  }
	}

	/**
	 * Get the keys of an object.
	 * @param {object} obj The object.
	 * @return {array} An array of keys.
	 */
	function objectKeys(obj) {
	  if (!obj) { return null; }

	  if (Object.keys) {
	    return Object.keys(obj);
	  }

	  var out = [];

	  for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
	      out.push(key);
	    }
	  }

	  return out;
	}

	/**
	 * Get a value on an object.
	 * @param {object} obj The object.
	 * @param {String} key The key.
	 * @return {object} Some result.
	 */
	var get = autoCurry(function get_(obj, key) {
	  return obj[key];
	});

	/**
	 * Set a value on an object.
	 * @param {object} obj The object.
	 * @param {String} key The key.
	 * @param {String} v The value.
	 */
	var set = autoCurry(function set_(obj, key, v) {
	  obj[key] = v;
	});

	/**
	 * Reverse the order of arguments.
	 * @param {function} f The original function.
	 * @return {function} The function with flipped arguments.
	 */
	function flip(f) {
	  return function flippedFunction_() {
	    return f.apply(null, NATIVE_ARRAY_REVERSE.call(arguments));
	  };
	}

	var pluck = flip(get);

	function isEmpty(arr) {
	  return !(arr && arr.length);
	}

	function isDefined(val) {
	  return 'undefined' !== typeof val;
	}

	function getOption(val, defaultValue, exec) {
	  if (isDefined(val)) {
	    return val;
	  } else if (exec) {
	    return defaultValue();
	  } else {
	    return defaultValue;
	  }
	}

	function objectVals(obj) {
	  var getPropertyByName = get(obj);
	  return map(getPropertyByName, objectKeys(obj));
	}

	function reduce(f, arr, val) {
	  if (NATIVE_ARRAY_REDUCE) {
	    return arr ? NATIVE_ARRAY_REDUCE.call(arr, f, val) : val;
	  }

	  for (var i = 0; arr && i < arr.length; i++) {
	    val = f(val, arr[i], i, arr);
	  }

	  return val;
	}

	function select(f, arr) {
	  if (NATIVE_ARRAY_FILTER) {
	    return arr ? NATIVE_ARRAY_FILTER.call(arr, f) : null;
	  }

	  var output = [];

	  for (var i = 0; arr && i < arr.length; i++) {
	    if (f(arr[i], i, arr) === true) {
	      output.push(arr[i]);
	    }
	  }

	  return output;
	}

	function reject(f, arr) {
	  return select(compose(not, f), arr);
	}

	function not(v) {
	  return !v;
	}

	// Recursive comparison function for `isEqual`.
	function eq(a, b, aStack, bStack) {
	  // Identical objects are equal. `0 === -0`, but they aren't identical.
	  // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
	  if (a === b) {
	    return a !== 0 || 1 / a == 1 / b;
	  }

	  // A strict comparison is necessary because `null == undefined`.
	  if (a == null || b == null) {
	    return a === b;
	  }

	  // Compare `[[Class]]` names.
	  var className = a.toString();
	  if (className != b.toString()) {
	    return false;
	  }
	  switch (className) {
	    // Strings, numbers, dates, and booleans are compared by value.
	    case '[object String]':
	      // Primitives and their corresponding object wrappers are equivalent; thus, `'5'` is
	      // equivalent to `new String('5')`.
	      return a == String(b);
	    case '[object Number]':
	      // `NaN`s are equivalent, but non-reflexive. An `egal` comparison is performed for
	      // other numeric values.
	      return a != +a ? b != +b : (a == 0 ? 1 / a == 1 / b : a == +b);
	    case '[object Date]':
	    case '[object Boolean]':
	      // Coerce dates and booleans to numeric primitive values. Dates are compared by their
	      // millisecond representations. Note that invalid dates with millisecond representations
	      // of `NaN` are not equivalent.
	      return +a == +b;
	    // RegExps are compared by their source patterns and flags.
	    case '[object RegExp]':
	      return a.source == b.source &&
	             a.global == b.global &&
	             a.multiline == b.multiline &&
	             a.ignoreCase == b.ignoreCase;
	  }

	  if (typeof a != 'object' || typeof b != 'object') {
	    return false;
	  }

	  // Assume equality for cyclic structures. The algorithm for detecting cyclic
	  // structures is adapted = require(ES 5.1 section 15.12.3, abstract operation `JO`.
	  var length = aStack.length;
	  while (length--) {
	    // Linear search. Performance is inversely proportional to the number of
	    // unique nested structures.
	    if (aStack[length] == a) {
	      return bStack[length] == b;
	    }
	  }

	  // Objects with different constructors are not equivalent, but `Object`s
	  // = require(different frames are.
	  var aCtor = a.constructor, bCtor = b.constructor;
	  if (aCtor !== bCtor && !(isFunction(aCtor) && (aCtor instanceof aCtor) &&
	                           isFunction(bCtor) && (bCtor instanceof bCtor)) &&
	      ('constructor' in a && 'constructor' in b)) {
	    return false;
	  }

	  // Add the first object to the stack of traversed objects.
	  aStack.push(a);
	  bStack.push(b);

	  var size = 0, result = true;
	  // Recursively compare objects and arrays.
	  if (className == '[object Array]') {
	    // Compare array lengths to determine if a deep comparison is necessary.
	    size = a.length;
	    result = size == b.length;
	    if (result) {
	      // Deep compare the contents, ignoring non-numeric properties.
	      while (size--) {
	        if (!(result = eq(a[size], b[size], aStack, bStack))) {
	          break;
	        }
	      }
	    }
	  } else {
	    // Deep compare objects.
	    for (var key in a) {
	      if (has(a, key)) {
	        // Count the expected number of properties.
	        size++;
	        // Deep compare each member.
	        if (!(result = has(b, key) && eq(a[key], b[key], aStack, bStack))) {
	          break;
	        }
	      }
	    }
	    // Ensure that both objects contain the same number of properties.
	    if (result) {
	      for (key in b) {
	        if (has(b, key) && !(size--)) {
	          break;
	        }
	      }
	      result = !size;
	    }
	  }

	  // Remove the first object = require(the stack of traversed objects.
	  aStack.pop();
	  bStack.pop();

	  return result;
	}

	function isFunction(obj) {
	  return typeof obj === 'function';
	}

	function has(obj, key) {
	  return hasOwnProperty.call(obj, key);
	}

	var equals = autoCurry(function equals_(a, b) {
	  return eq(a, b, [], []);
	});

	function when(truth, f) {
	  return function whenExecute_() {
	    var whatIsTruth = truth; // Do not mutate original var :(

	    if ('function' === typeof truth) {
	      whatIsTruth = truth.apply(null, arguments);
	    }

	    if (whatIsTruth) {
	      return f.apply(null, arguments);
	    }
	  };
	}

	/**
	 * Bind a function's 'this' value.
	 * @param {function} f The function.
	 * @param {object} obj The object.
	 * @return {function} The bound function.
	 */
	function functionBind(f, obj) {
	  if (NATIVE_FUNCTION_BIND) {
	    return NATIVE_FUNCTION_BIND.call(f, obj);
	  }

	  return function boundFunction_() {
	    return f.apply(obj, arguments);
	  };
	}

	/**
	 * Partially apply a function.
	 */
	function partial(f /*, args*/) {
	  var args = rest(arguments);

	  if (NATIVE_FUNCTION_BIND) {
	    args.unshift(undefined);
	    return NATIVE_FUNCTION_BIND.apply(f, args);
	  }

	  return function partialExecute_() {
	    var args2 = slice(arguments, 0);
	    return f.apply(this, args.concat(args2));
	  };
	}

	function delay(f, ms) {
	  return function delayedExecute_() {
	    setTimeout(partial(f, arguments), ms);
	  };
	}

	function defer(f, ms) {
	  return delay(f, isDefined(ms) ? ms : 1)();
	}

	function apply(f, args) {
	  return f.apply(null, args);
	}

	function rest(arr, fromStart) {
	  fromStart = isDefined(fromStart) ? fromStart : 1;
	  return slice(arr, fromStart);
	}

	function call(f /*, args */) {
	  return f.apply(null, rest(arguments));
	}

	var flippedCall = flip(call);

	function nth(idx, arr) {
	  return arr[idx];
	}

	function first(arr) {
	  return arr[0];
	}

	function last(arr) {
	  return arr[arr.length - 1];
	}

	var unshift = autoCurry(function unshift_(arr, v) {
	  var arr2 = copyArray(arr);
	  NATIVE_ARRAY_UNSHIFT.call(arr2, v);
	  return arr2;
	});

	function shift(arr) {
	  var arr2 = copyArray(arr);
	  NATIVE_ARRAY_SHIFT.call(arr2);
	  return arr2;
	}

	var push = autoCurry(function push_(arr, v) {
	  var arr2 = copyArray(arr);
	  NATIVE_ARRAY_PUSH.call(arr2, v);
	  return arr2;
	});

	function pop(arr) {
	  var arr2 = copyArray(arr);
	  NATIVE_ARRAY_POP.call(arr2);
	  return arr2;
	}

	var sortBy = autoCurry(function sortBy_(arr, f) {
	  var arr2 = copyArray(arr);
	  NATIVE_ARRAY_SORT.call(arr2, f);
	  return arr2;
	});

	function compose(/*fns*/) {
	  var fns = arguments;

	  return function composedExecute_(value) {
	    for (var i = fns.length - 1; i >= 0; --i) {
	      value = fns[i](value);
	    }
	    return value;
	  };
	}

	var pipeline = flip(compose);

	function once(f /*, args*/) {
	  var args = rest(arguments);
	  var hasRun = false;
	  return function onceExecute_() {
	    if (!hasRun) {
	      hasRun = true;
	      return f.apply(null, args);
	    }
	  };
	}

	function parseInteger(str) {
	  return parseInt(str, 10);
	}

	function constantly(val) {
	  return function constantlyExecute_() {
	    return val;
	  };
	}

	var isTrue = equals(true);

	module.exports = {
	  concat: concat,
	  indexOf: indexOf,
	  throttle: throttle,
	  debounce: debounce,
	  mapObject: mapObject,
	  objectKeys: objectKeys,
	  functionBind: functionBind,
	  partial: partial,
	  map: map,
	  apply: apply,
	  objectVals: objectVals,
	  call: call,
	  push: push,
	  pop: pop,
	  unshift: unshift,
	  equals: equals,
	  not: not,
	  delay: delay,
	  nth: nth,
	  first: first,
	  last: last,
	  compose: compose,
	  select: select,
	  get: get,
	  shift: shift,
	  when: when,
	  reduce: reduce,
	  once: once,
	  sortBy: sortBy,
	  parseInteger: parseInteger,
	  set: set,
	  flip: flip,
	  copyArray: copyArray,
	  defer: defer,
	  slice: slice,
	  isEmpty: isEmpty,
	  reject: reject,
	  rest: rest,
	  constantly: constantly,
	  identity: identity,
	  memoize: memoize,
	  autoCurry: autoCurry,
	  unary: unary,
	  forEach: forEach,
	  pluck: pluck,
	  isDefined: isDefined,
	  getOption: getOption,
	  flippedCall: flippedCall,
	  isFunction: isFunction,
	  isTrue: isTrue,
	  pipeline: pipeline
	};


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var registry_ = [];

	var addEventListener_ = window.addEventListener || function fallbackAddRemoveEventListener_(type, listener) {
	  var target = this;

	  registry_.unshift([target, type, listener, function (event) {
	    event.currentTarget = target;
	    event.preventDefault = function () { event.returnValue = false; };
	    event.stopPropagation = function () { event.cancelBubble = true; };
	    event.target = event.srcElement || target;

	    listener.call(target, event);
	  }]);

	  this.attachEvent('on' + type, registry_[0][3]);
	};

	var removeEventListener_ = window.removeEventListener || function fallbackRemoveEventListener_(type, listener) {
	  for (var index = 0, register; (register = registry_[index]); ++index) {
	    if (register[0] == this && register[1] == type && register[2] == listener) {
	      return this.detachEvent('on' + type, registry_.splice(index, 1)[0][3]);
	    }
	  }
	};

	var dispatchEvent_ = window.dispatchEvent || function(eventObject) {
	  return this.fireEvent('on' + (eventObject.type || eventObject.eventType), eventObject);
	};

	var eventListenerInfo = { count: 0 };

	function eventListener(target, eventName, cb) {
	  addEventListener_.call(target, eventName, cb, false);
	  eventListenerInfo.count++;

	  return function eventListenerRemove_() {
	    removeEventListener_.call(target, eventName, cb, false);
	    eventListenerInfo.count--;
	  };
	}

	function dispatchEvent(target, evType) {
	  var evObj;
	  if (document.createEvent) {
	    evObj = document.createEvent('HTMLEvents');
	    evObj.initEvent(evType, true, true);
	  } else {
	    evObj = document.createEventObject();
	    evObj.eventType = evType;
	  }
	  evObj.eventName = evType;

	  dispatchEvent_.call(target, evObj);
	}

	module.exports = {
	  eventListenerInfo: eventListenerInfo,
	  eventListener: eventListener,
	  dispatchEvent: dispatchEvent
	};


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Ghetto Record implementation.
	 */
	function Buffer(max, mode) {
	  if (!(this instanceof Buffer)) {
	    return new Buffer(max);
	  }

	  this.max = max;
	  this.singleValueMode = this.max === 1;

	  this.mode = mode;

	  this.values = null;

	  // Single item optimization
	  this.singleValue = null; 
	}

	function create(max, mode) {
	  return new Buffer(max, mode);
	}

	function len(buffer) {
	  if (buffer.singleValueMode) {
	    return buffer.singleValue ? 1 : 0;
	  } else {
	    return buffer.values ? buffer.values.length : 0;
	  }
	}

	function push(buffer, value) {
	  if (len(buffer) === buffer.max) {
	    if (!buffer.singleValueMode && ('sliding' === buffer.mode)) {
	      buffer.values.shift();
	    } else if ('dropping' === buffer.mode) {
	      return;
	    }
	  }

	  if (buffer.singleValueMode) {
	    buffer.singleValue = value;
	  } else {
	    if (!len(buffer)) {
	      buffer.values = [];
	    }

	    buffer.values.push(value);
	  }
	}

	function lastValue(buffer) {
	  if (buffer.singleValueMode) {
	    return buffer.singleValue;
	  } else {
	    return buffer.values && buffer.values[buffer.values.length - 1];
	  }
	}

	function fill(buffer, value) {
	  if (buffer.singleValueMode) {
	    buffer.singleValue = buffer.singleValue || value;
	  } else {
	    while (!buffer.values || (buffer.values.length < buffer.max)) {
	      push(buffer, value);
	    }
	  }
	}

	function sum(buffer) {
	  if (buffer.singleValueMode) {
	    return buffer.singleValue;
	  }

	  var total = 0;

	  for (var i = 0; buffer.values, i < buffer.values.length; i++) {
	    total += buffer.values[i];
	  }

	  return total;
	}

	function average(buffer) {
	  if (buffer.singleValueMode) {
	    return buffer.singleValue;
	  }

	  var total = sum(buffer);
	  
	  if (buffer.values) {
	    return buffer.values.length ? (total / buffer.values.length) : 0;
	  } else {
	    return null;
	  }
	}

	function clear(buffer) {
	  if (buffer.singleValueMode) {
	    buffer.singleValue = null;
	  } else {
	    if (buffer.values) {
	      buffer.values.length = 0;
	      buffer.values = null;
	    }
	  }
	}

	module.exports = {
	  create: create,
	  len: len,
	  push: push,
	  lastValue: lastValue,
	  fill: fill,
	  sum: sum,
	  average: average,
	  clear: clear
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var Events = __webpack_require__(12);
	var Buffer = __webpack_require__(13);
	var Util = __webpack_require__(11);

	// Internal tracking of how many streams have been created.
	var nextID = 0;

	var openStreams = {};

	/**
	 * Ghetto Record implementation.
	 */
	function Stream(trackSubscribers, buffer) {
	  if (!(this instanceof Stream)) {
	    return new Stream(trackSubscribers, buffer);
	  }

	  this.trackSubscribers = !!trackSubscribers;
	  this.subscribers = null;
	  this.subscriberSubscribers = null;
	  this.streamID = nextID++;
	  this.values = Util.isDefined(buffer) ? buffer : Buffer.create(1, 'sliding');
	  this.closed = false;
	  this.closeSubscribers = null;
	  this.emptySubscribers = null;

	  openStreams[this.streamID] = this;
	}

	function create(trackSubscribers, buffer) {
	  return new Stream(trackSubscribers, buffer);
	}

	var emit = Util.autoCurry(function emit_(stream, val) {
	  if (stream.closed) { return; }

	  if (stream.subscribers) {
	    for (var i = 0; i < stream.subscribers.length; i++) {
	      stream.subscribers[i](val);
	    }
	  }

	  Buffer.push(stream.values, val);
	});

	function getValue(stream) {
	  return Buffer.lastValue(stream.values);
	}

	function onValue(stream, f) {
	  if (stream.closed) { return; }

	  stream.subscribers = stream.subscribers || [];
	  stream.subscribers.push(f);

	  if (stream.trackSubscribers) {
	    Util.map(Util.unary(Util.partial(Util.flippedCall, f)), stream.subscriberSubscribers);
	  }

	  return Util.partial(offValue, stream, f);
	}

	function close(stream) {
	  if (stream.closed) { return; }

	  stream.closed = true;
	  Buffer.clear(stream.values);

	  if (stream.subscribers) {
	    stream.subscribers.length = 0;
	  }

	  if (stream.closeSubscribers) {
	    Util.map(Util.flippedCall, stream.closeSubscribers);
	    stream.closeSubscribers.length = 0;
	  }

	  delete openStreams[stream.streamID];
	}

	function offValue(stream, f) {
	  if (stream.subscribers) {
	    var idx = Util.indexOf(stream.subscribers, f);
	    if (idx !== -1) {
	      stream.subscribers.splice(idx, 1);
	    }

	    if (stream.subscribers.length < 1) {
	      stream.subscribers = null;
	      Util.map(Util.flippedCall, stream.emptySubscribers);
	    }
	  }
	}

	function onSubscription(stream, f) {
	  if (stream.trackSubscribers) {
	    stream.subscriberSubscribers || (stream.subscriberSubscribers = []);
	    stream.subscriberSubscribers.push(f);
	  }
	}

	function onClose(stream, f) {
	  stream.closeSubscribers || (stream.closeSubscribers = []);
	  stream.closeSubscribers.push(f);
	}

	function onEmpty(stream, f) {
	  stream.emptySubscribers || (stream.emptySubscribers = []);
	  stream.emptySubscribers.push(f);
	}

	function createFromEvents(target, eventName) {
	  var outputStream = create(true);
	  var boundEmit = emit(outputStream);

	  var isListening = false;
	  var unsubFunc;

	  function detachListener_() {
	    if (!isListening) { return; }

	    if (unsubFunc) {
	      unsubFunc();
	      unsubFunc = null;
	      isListening = false;
	    }
	  }

	  /**
	   * Lazily subscribes to a dom event.
	   */
	  function attachListener_() {
	    if (isListening) { return; }
	    isListening = true;

	    unsubFunc = Events.eventListener(target, eventName, function() {
	      if (outputStream.closed) {
	        detachListener_();
	      } else {
	        Util.apply(boundEmit, arguments);
	      }
	    });

	    onClose(outputStream, detachListener_);
	  }

	  onSubscription(outputStream, attachListener_);
	  onEmpty(outputStream, detachListener_);

	  return outputStream;
	}

	function interval(ms) {
	  var outputStream = create(true);
	  var boundEmit = emit(outputStream);

	  /**
	   * Lazily subscribes to a timeout event.
	   */
	  var attachListener = function attach_() {
	    var i = 0;
	    var intervalId = setInterval(function() {
	      if (outputStream.closed) {
	        clearInterval(intervalId);
	      } else {
	        boundEmit(i++);
	      }
	    }, ms);
	  };

	  onSubscription(outputStream, Util.once(attachListener));

	  return outputStream;
	}

	function timeout(ms) {
	  var outputStream = create(true);
	  var boundEmit = Util.partial(emit, outputStream, true);

	  /**
	   * Lazily subscribes to a timeout event.
	   */
	  var attachListener = Util.partial(setTimeout, boundEmit, ms);
	  onSubscription(outputStream, Util.once(attachListener));

	  return outputStream;
	}

	var createFromRAF = Util.memoize(function createFromRAF_() {
	  var rAFStream = create(true);
	  var boundEmit = emit(rAFStream);

	  /**
	   * Lazily subscribes to a raf event.
	   */
	  function sendEvent(t) {
	    if (!rAFStream.closed) {
	      requestAnimationFrame(sendEvent);
	      boundEmit(t);
	    }
	  }

	  onSubscription(rAFStream, Util.once(sendEvent));

	  return rAFStream;
	});

	function merge(/* streams */) {
	  var streams = Util.copyArray(arguments);
	  var outputStream = create();
	  var boundEmit = emit(outputStream);
	  
	  // var childStreams = {};

	  // Map used for side-effects
	  Util.map(function(stream) {
	    // childStreams[stream.streamID] = true;

	    var offValFunc = onValue(stream, boundEmit);
	    onClose(outputStream, offValFunc);

	    // function cleanup() {
	    //   delete childStreams[stream.streamID];

	    //   if (objectKeys(childStreams).length < 1) {
	    //     close(outputStream);
	    //   }
	    // }

	    // onClose(stream, cleanup);
	    // onEmpty(stream, cleanup);
	  }, streams);

	  // onEmpty(outputStream, function() {
	  //   debugger;
	  // });

	  return outputStream;
	}

	var EMIT_KEY = ':e:';

	function duplicateStreamOnEmit_(stream, f, args) {
	  var outputStream = create();
	  var boundEmit = Util.partial(emit, outputStream);
	  var boundArgs = Util.map(function(v) {
	    return v === EMIT_KEY ? boundEmit : v;
	  }, args);

	  // var offValFunc = 
	  onValue(stream, Util.apply(Util.apply, [f, boundArgs]));
	  // onClose(outputStream, offValFunc);
	  // onEmpty(outputStream, Util.partial(close, outputStream));

	  return outputStream;
	}

	function delay(ms, stream) {
	  if (ms <= 0) { return stream; }
	  return duplicateStreamOnEmit_(stream, Util.delay, [EMIT_KEY, ms]);
	}

	function throttle(ms, stream) {
	  if (ms <= 0) { return stream; }
	  return duplicateStreamOnEmit_(stream, Util.throttle, [EMIT_KEY, ms]);
	}

	function debounce(ms, stream) {
	  if (ms <= 0) { return stream; }
	  return duplicateStreamOnEmit_(stream, Util.debounce, [EMIT_KEY, ms]);
	}

	function map(f, stream) {
	  return duplicateStreamOnEmit_(stream, Util.compose, [EMIT_KEY, f]);
	}

	function filter(f, stream) {
	  return duplicateStreamOnEmit_(stream, Util.when, [f, EMIT_KEY]);
	}

	function filterFirst(val, stream) {
	  return filter(Util.compose(Util.equals(val), Util.first), stream);
	}

	function skipDuplicates(stream) {
	  var lastValue;
	  return filter(function checkDuplicate_(val) {
	    if (Util.equals(lastValue, val)) {
	      return false;
	    }
	    
	    lastValue = val;
	    return true;
	  }, stream);
	}

	function sample(sourceStream, sampleStream) {
	  return duplicateStreamOnEmit_(sampleStream,
	    Util.compose, [EMIT_KEY, Util.partial(getValue, sourceStream)]);
	}

	module.exports = {
	  create: create,
	  getValue: getValue,
	  onValue: onValue,
	  offValue: offValue,
	  onSubscription: onSubscription,
	  createFromEvents: createFromEvents,
	  timeout: timeout,
	  createFromRAF: createFromRAF,
	  merge: merge,
	  delay: delay,
	  throttle: throttle,
	  debounce: debounce,
	  map: map,
	  filter: filter,
	  filterFirst: filterFirst,
	  sample: sample,
	  interval: interval,
	  openStreams: openStreams,
	  skipDuplicates: skipDuplicates,
	  emit: emit,
	  close: close,
	  onClose: onClose,
	  onEmpty: onEmpty
	};


/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var Stream = __webpack_require__(14);
	var Util = __webpack_require__(11);

	/**
	 * Create a new Stream containing resize events.
	 * These events can be throttled (meaning they will only emit once every X milliseconds).
	 * @param {object=} options Map of optional parameters.
	 * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
	 * @return {Stream} The resulting stream.
	 */
	var create = Util.memoize(function create_(options) {
	  options = options || {};
	  var orientationChangeDelayMs = Util.getOption(options.orientationChangeDelayMs, 100);

	  var resizeEventStream = Stream.createFromEvents(window, 'resize');
	  var orientationChangeStream = Stream.createFromEvents(window, 'orientationchange');

	  var resizedStream = Stream.merge(
	    resizeEventStream,

	    // X milliseconds after an orientation change, send an event.
	    Stream.delay(orientationChangeDelayMs, orientationChangeStream)
	  );

	  Util.defer(Stream.emit(resizedStream), 10);

	  return Stream.skipDuplicates(Stream.map(windowDimensions_, resizedStream));
	});

	function windowDimensions_() {
	  return [
	    window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth,
	    window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
	  ];
	}

	module.exports = { create: create };


/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);

	function Emitter() {
	  if (!(this instanceof Emitter)) {
	    return new Emitter();
	  }

	  this.callbacks = {};
	  this.callbackScopes = {};
	}

	function on(emitter, eventName, callback, scope) {
	  if (!emitter.callbacks[eventName]) {
	    emitter.callbacks[eventName] = [];
	  }

	  if (!emitter.callbackScopes[eventName]) {
	    emitter.callbackScopes[eventName] = [];
	  }

	  if (Util.indexOf(emitter.callbacks[eventName], callback) === -1) {
	    emitter.callbacks[eventName].push(callback);
	    emitter.callbackScopes[eventName].push(scope);
	  }
	}

	function off(emitter, eventName, callback) {
	  if (!callback) {
	    emitter.callbacks[eventName] = [];
	    emitter.callbackScopes[eventName] = [];
	    return;
	  }

	  var idx = Util.indexOf(emitter.callbacks[eventName], callback);

	  if (idx !== -1) {
	    emitter.callbacks[eventName].splice(idx, 1);
	    emitter.callbackScopes[eventName].splice(idx, 1);
	  }
	}

	function trigger(emitter, eventName, options) {
	  if (!emitter.callbacks[eventName]) { return; }

	  for (var i = 0; i < emitter.callbacks[eventName].length; i++) {
	    if (emitter.callbackScopes[eventName][i]) {
	      emitter.callbacks[eventName][i].call(emitter.callbackScopes[eventName][i], options);
	    } else {
	      emitter.callbacks[eventName][i](options);
	    }
	  }
	}

	function mixin(object) {
	  var emitter = new Emitter();

	  object.on = Util.partial(on, emitter);
	  object.off = Util.partial(off, emitter);
	  object.trigger = Util.partial(trigger, emitter);

	  return object;
	}

	module.exports = { mixin: mixin };

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var DOM = __webpack_require__(18);
	var Stream = __webpack_require__(14);
	var ResizeStream = __webpack_require__(15);

	/**
	 * Create a new Stream containing events which fire when the browser
	 * enters and exits breakpoints (media queries).
	 * @param {Object} breakpoints Map containing the name of each breakpoint
	 *   as the key. The value can be either a media query string or a map
	 *   with min and/or max keys.
	 * @return {Stream} The resulting stream.
	 */
	function create(breakpoints, options) {
	  var baseStream = ResizeStream.create();
	  var resizeStream;

	  if (options.debounceMs) {
	    resizeStream = Stream.debounce(
	      options.debounceMs,
	      baseStream
	    );
	  } else if (options.throttleMs) {
	    resizeStream = Stream.throttle(
	      options.throttleMs,
	      baseStream
	    );
	  } else {
	    resizeStream = baseStream;
	  }

	  var breakpointStreams = Util.mapObject(function(val, key) {
	    var s = Stream.create();

	    var mq = 'string' === typeof val ? val : breakpointToString(val);

	    Stream.onValue(resizeStream, function() {
	      var wasActive = Stream.getValue(s);
	      wasActive = wasActive !== null ? wasActive : false;

	      if (wasActive !== DOM.testMQ(mq)) {
	        Stream.emit(s, !wasActive);
	      }
	    });

	    return Stream.map(Util.push([key]), s);
	  }, breakpoints);

	  return Util.apply(Stream.merge, Util.objectVals(breakpointStreams));
	}

	/**
	 * Convert a map with max/min values into a media query string.
	 * @param {Object} options The options.
	 * @param {number=} options.min The minimum size.
	 * @param {number=} options.max The maximum size.
	 * @return {string} The resulting media query.
	 */
	function breakpointToString(options) {
	  var mq;

	  if ('undefined' !== typeof options.mq) {
	    mq = options.mq;
	  } else {
	    var max = Util.getOption(options.max, Infinity);
	    var min = Util.getOption(options.min, 0);

	    mq = 'only screen';
	    if (max < Infinity) {
	      mq += ' and (max-width: ' + max + 'px)';
	    }
	    if (min > 0) {
	      mq += ' and (min-width: ' + min + 'px)';
	    }
	  }

	  return mq;
	}

	module.exports = { create: create };


/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var Util = __webpack_require__(11);
	var CustomModernizr = __webpack_require__(21);

	/**
	 * Backwards compatible Media Query matcher.
	 * @param {String} mq Media query to match.
	 * @return {Boolean} Whether it matched.
	 */
	var testMQ = CustomModernizr.mq;

	/**
	 * Return a function which gets the viewport width or height.
	 * @private
	 * @param {String} dimension The dimension to look up.
	 * @param {String} inner The inner dimension.
	 * @param {String} client The client dimension.
	 * @return {function} The getter function.
	 */
	function makeViewportGetter_(dimension, inner, client) {
	  if (testMQ('(min-' + dimension + ':' + window[inner] + 'px)')) {
	    return function getWindowDimension_() {
	      return window[inner];
	    };
	  } else {
	    var docElem = document.documentElement;
	    return function getDocumentDimension_() {
	      return docElem[client];
	    };
	  }
	}

	var getViewportWidth = makeViewportGetter_('width', 'innerWidth', 'clientWidth');
	var getViewportHeight = makeViewportGetter_('height', 'innerHeight', 'clientHeight');

	var detectedIE10_ = (navigator.userAgent.indexOf('MSIE 10') !== -1);

	/**
	 * Get the document scroll.
	 * @return {number}
	 */
	function documentScrollY() {
	  if (detectedIE10_ && (window.pageYOffset != document.documentElement.scrollTop)) {
	    return document.documentElement.scrollTop;
	  }

	  return window.pageYOffset || document.documentElement.scrollTop;
	}

	/**
	 * Calculate the rectangle of the element with an optional buffer.
	 * @param {Element} elem The element.
	 * @param {number} buffer An extra padding.
	 */
	function getRect(elem) {
	  if (elem && !elem.nodeType) {
	    elem = elem[0];
	  }

	  if (!elem || 1 !== elem.nodeType) {
	    return false;
	  }
	  
	  var bounds = elem.getBoundingClientRect();

	  return {
	    height: bounds.bottom - bounds.top,
	    width: bounds.right - bounds.left,
	    top: bounds.top,
	    left: bounds.left
	  };
	}

	var cssPrefix = Util.memoize(CustomModernizr.prefixed);

	var setStyle = Util.autoCurry(function setStyle_(elem, key, value) {
	  elem.style[cssPrefix(key)] = value;
	});

	function setStyles(elem, styles) {
	  Util.mapObject(Util.flip(setStyle(elem)), styles);
	}

	function getComputedStyle(elem, key) {
	  var doc = (elem.nodeType == 9) ? elem : (elem.ownerDocument || elem.document);

	  if (doc.defaultView && doc.defaultView.getComputedStyle) {
	    var styles = doc.defaultView.getComputedStyle(elem, null);
	    if (styles) {
	      return styles[key] || styles.getPropertyValue(key) || '';
	    }
	  }

	  return '';
	}

	function getCascadedStyle(elem, key) {
	  return elem.currentStyle ? elem.currentStyle[key] : null;
	}

	var getStyle = Util.autoCurry(function getStyle_(elem, key) {
	  var prefixedKey = cssPrefix(key);

	  return getComputedStyle(elem, prefixedKey) ||
	         getCascadedStyle(elem, prefixedKey) ||
	         (elem.style && elem.style[prefixedKey]);
	});

	function insertBefore(before, elem) {
	  elem.parentNode.insertBefore(before, elem);
	}

	function detachElement(elem) {
	  if (elem.parentNode) {
	    elem.parentNode.removeChild(elem); 
	  }
	}

	function inDocument_(elem) {
	  while (elem = elem.parentNode) {
	    if (elem == document) {
	      return true;
	    }
	  }

	  return false;
	}

	function isVisible(elem) {
	  if (!inDocument_(elem)) {
	    return false;
	  }

	  var isDisplayNone = (getStyle(elem, 'display') === 'none');

	  if (isDisplayNone) {
	    return false;
	  }

	  var parent = elem.parentNode;

	  if (parent) {
	    return isVisible(parent);
	  }

	  return true;
	}

	var hasClass_, addClass_, removeClass_;

	function getClasses(elem) {
	  return elem.className.length > 0 ? elem.className.split(' ') : [];
	}

	if (!Util.isDefined(window.Element) || ('classList' in document.documentElement)) {
	  hasClass_ = function hasClassNative_(elem, className) {
	    return elem.classList.contains(className);
	  };

	  addClass_ = function addClassNative_(elem, className) {
	    elem.classList.add(className);
	  };

	  removeClass_ = function removeClassNative_(elem, className) {
	    elem.classList.remove(className);
	  };
	} else {
	  hasClass_ = function hasClassPoly_(elem, className) {
	    return Util.indexOf(getClasses(elem), className) !== -1;
	  };

	  addClass_ = function addClassPoly_(elem, className) {
	    if (hasClass(elem)) { return; }

	    var currentClasses = getClasses(elem);
	    currentClasses.push(className);

	    elem.className = currentClasses.join(' ');
	  };

	  removeClass_ = function removeClassPoly_(elem, className) {
	    if (!hasClass(elem)) { return; }

	    var currentClasses = getClasses(elem);

	    var idx = Util.indexOf(currentClasses, className);
	    currentClasses.splice(idx, 1);

	    elem.className = currentClasses.join(' ');
	  };
	}

	var hasClass = Util.autoCurry(hasClass_);
	var addClass = Util.autoCurry(addClass_);
	var removeClass = Util.autoCurry(removeClass_);

	var addClasses = Util.autoCurry(function addClasses_(elem, classes) {
	  Util.forEach(addClass(elem), classes);
	});

	module.exports = {
	  testMQ: testMQ,
	  getViewportWidth: getViewportWidth,
	  getViewportHeight: getViewportHeight,
	  documentScrollY: documentScrollY,
	  getRect: getRect,
	  cssPrefix: cssPrefix,
	  setStyle: setStyle,
	  setStyles: setStyles,
	  getStyle: getStyle,
	  insertBefore: insertBefore,
	  detachElement: detachElement,
	  isVisible: isVisible,
	  getClasses: getClasses,
	  hasClass: hasClass,
	  addClass: addClass,
	  removeClass: removeClass,
	  addClasses: addClasses
	};


/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var Stream = __webpack_require__(14);
	var Util = __webpack_require__(11);
	var DOM = __webpack_require__(18);
	var Events = __webpack_require__(12);

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


/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var Stream = __webpack_require__(14);
	var ScrollStream = __webpack_require__(19);

	/**
	 * Create a new Stream containing events which fire when a position has
	 * been scrolled past.
	 * @param {number} targetScrollY The position we are tracking.
	 * @return {Stream} The resulting stream.
	 */
	function create(targetScrollY) {
	  var scrollPositionStream = ScrollStream.create();
	  var overTheLineStream = Stream.create();
	  var pastScrollY = false;
	  var firstRun = true;

	  Stream.onValue(scrollPositionStream, function onScrollTrackPosition_(currentScrollY) {
	    if ((firstRun || pastScrollY) && (currentScrollY < targetScrollY)) {
	      pastScrollY = false;
	      Stream.emit(overTheLineStream, ['before', targetScrollY]);
	    } else if ((firstRun || !pastScrollY) && (currentScrollY >= targetScrollY)) {
	      pastScrollY = true;
	      Stream.emit(overTheLineStream, ['after', targetScrollY]);
	    }

	    firstRun = false;
	  });

	  return overTheLineStream;
	}

	module.exports = { create: create };


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/* Modernizr 2.7.2 (Custom Build) | MIT & BSD
	 * Build: http://modernizr.com/download/#-backgroundsize-csstransforms-mq-addtest-prefixed-teststyles-testprop-testallprops-hasevent-prefixes-domprefixes
	 */
	;



	// window.Modernizr = (function( window, document, undefined ) {

	    var version = '2.7.2',

	    Modernizr = {},


	    docElement = document.documentElement,

	    mod = 'modernizr',
	    modElem = document.createElement(mod),
	    mStyle = modElem.style,

	    inputElem  ,


	    toString = {}.toString,

	    prefixes = ' -webkit- -moz- -o- -ms- '.split(' '),



	    omPrefixes = 'Webkit Moz O ms',

	    cssomPrefixes = omPrefixes.split(' '),

	    domPrefixes = omPrefixes.toLowerCase().split(' '),


	    tests = {},
	    inputs = {},
	    attrs = {},

	    classes = [],

	    slice = classes.slice,

	    featureName, 


	    injectElementWithStyles = function( rule, callback, nodes, testnames ) {

	      var style, ret, node, docOverflow,
	          div = document.createElement('div'),
	                body = document.body,
	                fakeBody = body || document.createElement('body');

	      if ( parseInt(nodes, 10) ) {
	                      while ( nodes-- ) {
	              node = document.createElement('div');
	              node.id = testnames ? testnames[nodes] : mod + (nodes + 1);
	              div.appendChild(node);
	          }
	      }

	                style = ['&#173;','<style id="s', mod, '">', rule, '</style>'].join('');
	      div.id = mod;
	          (body ? div : fakeBody).innerHTML += style;
	      fakeBody.appendChild(div);
	      if ( !body ) {
	                fakeBody.style.background = '';
	                fakeBody.style.overflow = 'hidden';
	          docOverflow = docElement.style.overflow;
	          docElement.style.overflow = 'hidden';
	          docElement.appendChild(fakeBody);
	      }

	      ret = callback(div, rule);
	        if ( !body ) {
	          fakeBody.parentNode.removeChild(fakeBody);
	          docElement.style.overflow = docOverflow;
	      } else {
	          div.parentNode.removeChild(div);
	      }

	      return !!ret;

	    },

	    testMediaQuery = function( mq ) {

	      var matchMedia = window.matchMedia || window.msMatchMedia;
	      if ( matchMedia ) {
	        return matchMedia(mq).matches;
	      }

	      var bool;

	      injectElementWithStyles('@media ' + mq + ' { #' + mod + ' { position: absolute; } }', function( node ) {
	        bool = (window.getComputedStyle ?
	                  getComputedStyle(node, null) :
	                  node.currentStyle)['position'] == 'absolute';
	      });

	      return bool;

	     },
	 

	    isEventSupported = (function() {

	      var TAGNAMES = {
	        'select': 'input', 'change': 'input',
	        'submit': 'form', 'reset': 'form',
	        'error': 'img', 'load': 'img', 'abort': 'img'
	      };

	      function isEventSupported( eventName, element ) {

	        element = element || document.createElement(TAGNAMES[eventName] || 'div');
	        eventName = 'on' + eventName;

	            var isSupported = eventName in element;

	        if ( !isSupported ) {
	                if ( !element.setAttribute ) {
	            element = document.createElement('div');
	          }
	          if ( element.setAttribute && element.removeAttribute ) {
	            element.setAttribute(eventName, '');
	            isSupported = is(element[eventName], 'function');

	                    if ( !is(element[eventName], 'undefined') ) {
	              element[eventName] = undefined;
	            }
	            element.removeAttribute(eventName);
	          }
	        }

	        element = null;
	        return isSupported;
	      }
	      return isEventSupported;
	    })(),


	    _hasOwnProperty = ({}).hasOwnProperty, hasOwnProp;

	    if ( !is(_hasOwnProperty, 'undefined') && !is(_hasOwnProperty.call, 'undefined') ) {
	      hasOwnProp = function (object, property) {
	        return _hasOwnProperty.call(object, property);
	      };
	    }
	    else {
	      hasOwnProp = function (object, property) { 
	        return ((property in object) && is(object.constructor.prototype[property], 'undefined'));
	      };
	    }


	    if (!Function.prototype.bind) {
	      Function.prototype.bind = function bind(that) {

	        var target = this;

	        if (typeof target != "function") {
	            throw new TypeError();
	        }

	        var args = slice.call(arguments, 1),
	            bound = function () {

	            if (this instanceof bound) {

	              var F = function(){};
	              F.prototype = target.prototype;
	              var self = new F();

	              var result = target.apply(
	                  self,
	                  args.concat(slice.call(arguments))
	              );
	              if (Object(result) === result) {
	                  return result;
	              }
	              return self;

	            } else {

	              return target.apply(
	                  that,
	                  args.concat(slice.call(arguments))
	              );

	            }

	        };

	        return bound;
	      };
	    }

	    function setCss( str ) {
	        mStyle.cssText = str;
	    }

	    function setCssAll( str1, str2 ) {
	        return setCss(prefixes.join(str1 + ';') + ( str2 || '' ));
	    }

	    function is( obj, type ) {
	        return typeof obj === type;
	    }

	    function contains( str, substr ) {
	        return !!~('' + str).indexOf(substr);
	    }

	    function testProps( props, prefixed ) {
	        for ( var i in props ) {
	            var prop = props[i];
	            if ( !contains(prop, "-") && mStyle[prop] !== undefined ) {
	                return prefixed == 'pfx' ? prop : true;
	            }
	        }
	        return false;
	    }

	    function testDOMProps( props, obj, elem ) {
	        for ( var i in props ) {
	            var item = obj[props[i]];
	            if ( item !== undefined) {

	                            if (elem === false) return props[i];

	                            if (is(item, 'function')){
	                                return item.bind(elem || obj);
	                }

	                            return item;
	            }
	        }
	        return false;
	    }

	    function testPropsAll( prop, prefixed, elem ) {

	        var ucProp  = prop.charAt(0).toUpperCase() + prop.slice(1),
	            props   = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

	            if(is(prefixed, "string") || is(prefixed, "undefined")) {
	          return testProps(props, prefixed);

	            } else {
	          props = (prop + ' ' + (domPrefixes).join(ucProp + ' ') + ucProp).split(' ');
	          return testDOMProps(props, prefixed, elem);
	        }
	    }    tests['backgroundsize'] = function() {
	        return testPropsAll('backgroundSize');
	    };



	    tests['csstransforms'] = function() {
	        return !!testPropsAll('transform');
	    };


	    for ( var feature in tests ) {
	        if ( hasOwnProp(tests, feature) ) {
	                                    featureName  = feature.toLowerCase();
	            Modernizr[featureName] = tests[feature]();

	            classes.push((Modernizr[featureName] ? '' : 'no-') + featureName);
	        }
	    }



	     Modernizr.addTest = function ( feature, test ) {
	       if ( typeof feature == 'object' ) {
	         for ( var key in feature ) {
	           if ( hasOwnProp( feature, key ) ) {
	             Modernizr.addTest( key, feature[ key ] );
	           }
	         }
	       } else {

	         feature = feature.toLowerCase();

	         if ( Modernizr[feature] !== undefined ) {
	                                              return Modernizr;
	         }

	         test = typeof test == 'function' ? test() : test;

	         if (typeof enableClasses !== "undefined" && enableClasses) {
	           docElement.className += ' ' + (test ? '' : 'no-') + feature;
	         }
	         Modernizr[feature] = test;

	       }

	       return Modernizr; 
	     };


	    setCss('');
	    modElem = inputElem = null;


	    Modernizr._version      = version;

	    Modernizr._prefixes     = prefixes;
	    Modernizr._domPrefixes  = domPrefixes;
	    Modernizr._cssomPrefixes  = cssomPrefixes;

	    Modernizr.mq            = testMediaQuery;

	    Modernizr.hasEvent      = isEventSupported;

	    Modernizr.testProp      = function(prop){
	        return testProps([prop]);
	    };

	    Modernizr.testAllProps  = testPropsAll;


	    Modernizr.testStyles    = injectElementWithStyles;
	    Modernizr.prefixed      = function(prop, obj, elem){
	      if(!obj) {
	        return testPropsAll(prop, 'pfx');
	      } else {
	            return testPropsAll(prop, obj, elem);
	      }
	    };

	    module.exports = Modernizr;

	    // return Modernizr;

	// })(this, this.document);


/***/ }
/******/ ])
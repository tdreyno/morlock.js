var Util = require('../core/util');
var CustomModernizr = require('../vendor/modernizr');

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
 * @param {Element} targetElement - Optional target element.
 * @return {number}
 */
function documentScrollY(targetElement) {
  if (targetElement && (targetElement !== window)) {
    return targetElement.scrollTop;
  }

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

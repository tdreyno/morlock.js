define("morlock/core/dom", 
  ["morlock/core/util","vendor/modernizr","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var memoize = __dependency1__.memoize;
    var isDefined = __dependency1__.isDefined;
    var mapObject = __dependency1__.mapObject;
    var flip = __dependency1__.flip;
    var indexOf = __dependency1__.indexOf;
    var forEach = __dependency1__.forEach;
    var autoCurry = __dependency1__.autoCurry;
    var CustomModernizr = __dependency2__["default"];

    /**
     * Backwards compatible Media Query matcher.
     * @param {String} mq Media query to match.
     * @return {Boolean} Whether it matched.
     */
    var testMQ = CustomModernizr.mq;
    __exports__.testMQ = testMQ;
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
    __exports__.getViewportWidth = getViewportWidth;var getViewportHeight = makeViewportGetter_('height', 'innerHeight', 'clientHeight');
    __exports__.getViewportHeight = getViewportHeight;
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

    __exports__.documentScrollY = documentScrollY;/**
     * Calculate the rectangle of the element with an optional buffer.
     * @param {Element} elem The element.
     * @param {number} buffer An extra padding.
     * @param {number} currentScrollY The known scrollY value.
     */
    function getRect(elem, buffer, currentScrollY) {
      buffer = typeof buffer == 'number' && buffer || 0;

      if (elem && !elem.nodeType) {
        elem = elem[0];
      }

      if (!elem || 1 !== elem.nodeType) {
        return false;
      }
      
      var bounds = elem.getBoundingClientRect();

      if (!isDefined(currentScrollY)) {
        currentScrollY = documentScrollY();
      }

      var topWithCeiling = (currentScrollY < 0) ? bounds.top + currentScrollY : bounds.top;
      
      var rect = {
        right: bounds.right + buffer,
        left: bounds.left - buffer,
        bottom: bounds.bottom + buffer,
        top: topWithCeiling - buffer
      };

      rect.width = rect.right - rect.left;
      rect.height = rect.bottom - rect.top;

      return rect;
    }

    __exports__.getRect = getRect;var cssPrefix = memoize(CustomModernizr.prefixed);
    __exports__.cssPrefix = cssPrefix;
    var setStyle = autoCurry(function setStyle_(elem, key, value) {
      elem.style[cssPrefix(key)] = value;
    });
    __exports__.setStyle = setStyle;
    function setStyles(elem, styles) {
      mapObject(flip(setStyle(elem)), styles);
    }

    __exports__.setStyles = setStyles;function getStyle(elem, key) {
      return elem.style[cssPrefix(key)];
    }

    __exports__.getStyle = getStyle;function insertBefore(before, elem) {
      elem.parentNode.insertBefore(before, elem);
    }

    __exports__.insertBefore = insertBefore;function detachElement(elem) {
      if (elem.parentNode) {
        elem.parentNode.removeChild(elem); 
      }
    }

    __exports__.detachElement = detachElement;function inDocument_(elem) {
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

    __exports__.isVisible = isVisible;var hasClass_, addClass_, removeClass_;

    function getClasses(elem) {
      return elem.className.length > 0 ? elem.className.split(' ') : [];
    }

    __exports__.getClasses = getClasses;if (!isDefined(window.Element) || ('classList' in document.documentElement)) {
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
        return indexOf(getClasses(elem), className) !== -1;
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

        var idx = indexOf(currentClasses, className);
        currentClasses.splice(idx, 1);

        elem.className = currentClasses.join(' ');
      };
    }

    var hasClass = autoCurry(hasClass_);
    __exports__.hasClass = hasClass;var addClass = autoCurry(addClass_);
    __exports__.addClass = addClass;var removeClass = autoCurry(removeClass_);
    __exports__.removeClass = removeClass;
    var addClasses = autoCurry(function addClasses_(elem, classes) {
      forEach(addClass(elem), classes);
    });
    __exports__.addClasses = addClasses;
  });
define("morlock/core/util", 
  ["exports"],
  function(__exports__) {
    "use strict";
    /**
     * Slice an array.
     * @param {array} arr The original array.
     * @param {number} pos The position to slice from.
     * @return {array} New sliced array.
     */
    function slice(arr, pos) {
      return Array.prototype.slice.call(arr, pos);
    }

    /**
     * Shallow copy an array.
     * @param {array} arr The original array.
     * @return {array} New copied array.
     */
    function copyArray(arr) {
      return slice(arr, 0);
    }

    /**
     * Backwards compatible Array.prototype.indexOf
     * @param {array} list List of items.
     * @param {object} item Item to search for.
     * @return {number} Index of match or -1 if not found.
     */
    function indexOf(list, item) {
      if (Array.prototype.indexOf) {
        return list.indexOf(item);
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

          apply(f, args);
        } else if (!timeoutId) {
          timeoutId = setTimeout(function() {
            previous = +(new Date());
            timeoutId = null;

            apply(f, args);
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

    /**
     * Backwards compatible Media Query matcher.
     * @param {String} mq Media query to match.
     * @return {Boolean} Whether it matched.
     */
    function testMQ() {
      return Modernizr['mq'].apply(Modernizr, arguments);
    }

    __exports__.testMQ = testMQ;/**
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

    /**
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

    /**
     * Map a function over an object.
     * @param {object} obj The object.
     * @param {function} f The function.
     * @return {object} The resulting object.
     */
    function mapObject(f, obj) {
      return reduce(function(sum, v) {
        sum[v] = f(obj[v], v);
        return sum;
      }, objectKeys(obj), {});
    }

    /**
     * Map a function over an object.
     * @param {object} obj The object.
     * @param {function} f The function.
     * @return {object} The resulting object.
     */
    function map(f, arr) {
      return reduce(function(sum, v) {
        return push(sum, f(v));
      }, arr, []);
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
    function get(obj, key) {
      return obj[key];
    }

    /**
     * Set a value on an object.
     * @param {object} obj The object.
     * @param {String} key The key.
     * @param {String} v The value.
     */
    function set(obj, key, v) {
      obj[key] = v;
    }

    // function invoke(fName/*, args */) {
    //   var args = rest(arguments);
    //   return function(obj) {
    //     return obj[fName].apply(obj, args);
    //   };
    // }

    /**
     * Reverse the order of arguments.
     * @param {function} f The original function.
     * @return {function} The function with flipped arguments.
     */
    function flip(f) {
      return function flippedFunction_() {
        return apply(f, Array.prototype.reverse.call(arguments));
      };
    }

    function isEmpty(arr) {
      return !(arr && arr.length);
    }

    function isDefined(val) {
      return 'undefined' !== typeof val;
    }

    __exports__.isDefined = isDefined;function objectVals(obj) {
      var getPropertyByName = partial(get, obj);
      return map(getPropertyByName, objectKeys(obj));
    }

    function reduce(f, arr, val) {
      for (var i = 0; arr && i < arr.length; i++) {
        val = f(val, arr[i]);
      }

      return val;
    }

    function select(f, arr) {
      return reduce(function(sum, v) {
        return isTrue(f(v)) ? push(sum, v) : sum;
      }, arr, []);
    }

    function reject(f, arr) {
      return reduce(function(sum, v) {
        return !isTrue(f(v)) ? push(sum, v) : sum;
      }, arr, []);
    }

    function not(v) {
      return !v;
    }

    function equals(a, b) {
      return a === b;
    }

    function when(truth, f) {
      return function whenExecute_() {
        var whatIsTruth = truth; // Do not mutate original var :(
        if ('function' === typeof truth) {
          whatIsTruth = apply(truth, arguments);
        }

        if (whatIsTruth) {
          return apply(f, arguments);
        }
      };
    }

    /**
     * Bind a function's "this" value.
     * @param {function} f The function.
     * @param {object} obj The object.
     * @return {function} The bound function.
     */
    function functionBind(f, obj) {
      if (Function.prototype.bind) {
        return f.bind(obj);
      }

      return function() {
        return f.apply(obj, arguments);
      };
    }

    /**
     * Partially apply a function.
     */
    function partial(f /*, args*/) {
      var args = rest(arguments);

      return function partialExecute_() {
        var args2 = slice(arguments, 0);
        return f.apply(this, args.concat(args2));
      };
    }

    function delay(f, ms) {
      return function() {
        setTimeout(partial(f, arguments), ms);
      };
    }

    function defer(f, ms) {
      return delay(f, isDefined(ms) ? ms : 1);
    }

    function apply(f, args) {
      return f.apply(null, args);
    }

    function rest(arr, fromStart) {
      fromStart = isDefined(fromStart) ? fromStart : 1;
      return slice(arr, fromStart);
    }

    function call(f /*, args */) {
      return apply(f, rest(arguments));
    }

    function eventListener(target, eventName, cb) {
      if (target.addEventListener) {
        target.addEventListener(eventName, cb, false);
        return function() {
          target.removeEventListener(eventName, cb, false);
        };
      } else if (target.attachEvent) {
        target.attachEvent('on' + eventName, cb);
        return function() {
          target.detachEvent('on' + eventName, cb);
        };
      }
    }

    function nth(idx, arr) {
      return arr[idx];
    }

    function first(arr) {
      return arr[0];
    }

    function last(arr) {
      return arr[arr.length - 1];
    }

    var isTrue = partial(equals, true);

    function unshift(arr, v) {
      var arr2 = copyArray(arr);
      Array.prototype.unshift.call(arr2, v);
      return arr2;
    }

    function shift(arr, v) {
      var arr2 = copyArray(arr);
      Array.prototype.shift.call(arr2, v);
      return arr2;
    }

    function push(arr, v) {
      var arr2 = copyArray(arr);
      Array.prototype.push.call(arr2, v);
      return arr2;
    }

    function pop(arr, v) {
      var arr2 = copyArray(arr);
      Array.prototype.pop.call(arr2, v);
      return arr2;
    }

    function sortBy(arr, f) {
      var arr2 = copyArray(arr);
      Array.prototype.sort.call(arr2, f);
      return arr2;
    }

    function compose(/*fns*/) {
      var fns = arguments;

      return function(value) {
        for (var i = fns.length - 1; i >= 0; --i) {
          value = fns[i](value);
        }
        return value;
      };
    }

    function once(f /*, args*/) {
      var args = rest(arguments);
      var hasRun = false;
      return function() {
        if (!hasRun) {
          hasRun = true;
          return apply(f, args);
        }
      };
    }

    function parseInteger(str) {
      return parseInt(str, 10);
    }

    function constantly(val) {
      return val;
    }

    var rAF = (function() {
      var correctRAF = window.requestAnimationFrame;
      var lastTime = 0;
      var vendors = ['webkit', 'moz'];

      for (var x = 0; x < vendors.length && !correctRAF; ++x) {
        correctRAF = window[vendors[x]+'RequestAnimationFrame'];
      }

      if (!correctRAF) {
        correctRAF = function(callback, element) {
          var currTime = new Date().getTime();
          var timeToCall = Math.max(0, 16 - (currTime - lastTime));
          var id = window.setTimeout(function() { callback(currTime + timeToCall); },
            timeToCall);
          lastTime = currTime + timeToCall;
          return id;
        };
      }

      return correctRAF;
    }());

    __exports__.indexOf = indexOf;
    __exports__.throttle = throttle;
    __exports__.debounce = debounce;
    __exports__.getRect = getRect;
    __exports__.mapObject = mapObject;
    __exports__.objectKeys = objectKeys;
    __exports__.functionBind = functionBind;
    __exports__.partial = partial;
    __exports__.map = map;
    __exports__.apply = apply;
    __exports__.objectVals = objectVals;
    __exports__.call = call;
    __exports__.push = push;
    __exports__.pop = pop;
    __exports__.unshift = unshift;
    __exports__.equals = equals;
    __exports__.not = not;
    __exports__.delay = delay;
    __exports__.unshift = unshift;
    __exports__.nth = nth;
    __exports__.first = first;
    __exports__.last = last;
    __exports__.compose = compose;
    __exports__.select = select;
    __exports__.isTrue = isTrue;
    __exports__.get = get;
    __exports__.shift = shift;
    __exports__.eventListener = eventListener;
    __exports__.when = when;
    __exports__.reduce = reduce;
    __exports__.once = once;
    __exports__.sortBy = sortBy;
    __exports__.parseInteger = parseInteger;
    __exports__.set = set;
    __exports__.flip = flip;
    __exports__.copyArray = copyArray;
    __exports__.defer = defer;
    __exports__.slice = slice;
    __exports__.isEmpty = isEmpty;
    __exports__.reject = reject;
    __exports__.rest = rest;
    __exports__.constantly = constantly;
    __exports__.rAF = rAF;
    __exports__.documentScrollY = documentScrollY;
  });
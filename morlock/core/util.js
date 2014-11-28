'use strict';

var R = require('ramda');
var { curry, flip, call, compose } = R;

var NATIVE_ARRAY_SLICE = Array.prototype.slice;
var NATIVE_ARRAY_MAP = Array.prototype.map;
var NATIVE_ARRAY_FOREACH = Array.prototype.forEach;
var NATIVE_ARRAY_REDUCE = Array.prototype.reduce;
var NATIVE_ARRAY_FILTER = Array.prototype.filter;
var NATIVE_ARRAY_UNSHIFT = Array.prototype.unshift;
var NATIVE_ARRAY_SHIFT = Array.prototype.shift;
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
 * Get a value on an object.
 * @param {object} obj The object.
 * @param {String} key The key.
 * @return {object} Some result.
 */
var getKey = curry(function get_(obj, key) {
  return obj[key];
});

/**
 * Set a value on an object.
 * @param {object} obj The object.
 * @param {String} key The key.
 * @param {String} v The value.
 */
var setKey = curry(function setKey_(obj, key, v) {
  obj[key] = v;
});

var pluck = flip(getKey);

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
      // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
      // equivalent to `new String("5")`.
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
  // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
  var length = aStack.length;
  while (length--) {
    // Linear search. Performance is inversely proportional to the number of
    // unique nested structures.
    if (aStack[length] == a) {
      return bStack[length] == b;
    }
  }

  // Objects with different constructors are not equivalent, but `Object`s
  // from different frames are.
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

  // Remove the first object from the stack of traversed objects.
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

var equals = curry(function equals_(a, b) {
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
 * Bind a function's "this" value.
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

function rest(arr, fromStart) {
  fromStart = isDefined(fromStart) ? fromStart : 1;
  return slice(arr, fromStart);
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

var unshift = curry(function unshift_(arr, v) {
  var arr2 = copyArray(arr);
  NATIVE_ARRAY_UNSHIFT.call(arr2, v);
  return arr2;
});

function shift(arr) {
  var arr2 = copyArray(arr);
  NATIVE_ARRAY_SHIFT.call(arr2);
  return arr2;
}

function pop(arr) {
  var arr2 = copyArray(arr);
  NATIVE_ARRAY_POP.call(arr2);
  return arr2;
}

var sortBy = curry(function sortBy_(arr, f) {
  var arr2 = copyArray(arr);
  NATIVE_ARRAY_SORT.call(arr2, f);
  return arr2;
});

var pipeline = flip(compose);

function parseInteger(str) {
  return parseInt(str, 10);
}

function constantly(val) {
  return function constantlyExecute_() {
    return val;
  };
}

var isTrue = equals(true);

var rAF = (function() {
  var correctRAF = window.requestAnimationFrame;
  var lastTime = 0;
  var vendors = ['webkit', 'moz'];

  for (var x = 0; x < vendors.length && !correctRAF; ++x) {
    correctRAF = window[vendors[x]+'RequestAnimationFrame'];
  }

  if (!correctRAF) {
    correctRAF = function rAFFallback_(callback) {
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

module.exports = {
  throttle, debounce, isTrue, isFunction, concat,
  unary, forEach, pluck, isDefined, getOption,
  flippedCall, pipeline, 
  functionBind, partial,
  map, pop, equals, not,
  delay, unshift, nth, first, last, select, getKey, shift,
  when, reduce, sortBy, parseInteger, setKey, 
  copyArray, defer, slice, isEmpty, reject, rest, constantly, rAF
};

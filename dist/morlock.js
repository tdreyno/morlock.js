(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    //Allow using this built library as an AMD module
    //in another project. That other project will only
    //see this AMD call, not the internal modules in
    //the closure below.
    define(factory);
  } else {
    //Browser globals case. Just assign the
    //result to a property on the global.
    var parts = factory();
    root.ResizeController = parts.ResizeController;
    root.BreakpointController = parts.BreakpointController;
    root.ResponsiveImage = parts.ResponsiveImage;
    root.ScrollController = parts.ScrollController;
    root.ElementVisibleController = parts.ElementVisibleController;
    root.ScrollPositionController = parts.ScrollPositionController;
    root.StickyElementController = parts.StickyElementController;
    root.morlock = parts.API;
  }
}(this, function () {
  //almond, and your modules will be inlined here

/**
 * @license almond 0.2.9 Copyright (c) 2011-2014, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*jslint sloppy: true */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseParts = baseParts.slice(0, baseParts.length - 1);
                name = name.split('/');
                lastIndex = name.length - 1;

                // Node .js allowance:
                if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                    name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
                }

                name = baseParts.concat(name);

                //start trimDots
                for (i = 0; i < name.length; i += 1) {
                    part = name[i];
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            } else if (name.indexOf('./') === 0) {
                // No baseName, so this is ID is resolved relative
                // to baseUrl, pull off the leading dot.
                name = name.substring(2);
            }
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relName) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("../../node_modules/almond/almond", function(){});

define("morlock/core/util", 
  ["exports"],
  function(__exports__) {
    
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

    __exports__.concat = concat;/**
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

    __exports__.identity = identity;function memoize(f, argsToStringFunc) {
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

    __exports__.memoize = memoize;function curry(fn) {
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

    __exports__.autoCurry = autoCurry;/**
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

    __exports__.unary = unary;/**
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

    __exports__.forEach = forEach;/**
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
    __exports__.pluck = pluck;
    function isEmpty(arr) {
      return !(arr && arr.length);
    }

    function isDefined(val) {
      return 'undefined' !== typeof val;
    }

    __exports__.isDefined = isDefined;function getOption(val, defaultValue, exec) {
      if (isDefined(val)) {
        return val;
      } else if (exec) {
        return defaultValue();
      } else {
        return defaultValue;
      }
    }

    __exports__.getOption = getOption;function objectVals(obj) {
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

    __exports__.isFunction = isFunction;function has(obj, key) {
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
    __exports__.flippedCall = flippedCall;
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
    __exports__.pipeline = pipeline;
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
    __exports__.isTrue = isTrue;
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

    __exports__.indexOf = indexOf;
    __exports__.throttle = throttle;
    __exports__.debounce = debounce;
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
    __exports__.get = get;
    __exports__.shift = shift;
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
  });
define("morlock/core/events", 
  ["exports"],
  function(__exports__) {
    
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

    var dispatchEvent_ = window.dispatchEvent || function (eventObject) {
      return this.fireEvent('on' + eventObject.type, eventObject);
    };

    var eventListenerInfo = { count: 0 };
    __exports__.eventListenerInfo = eventListenerInfo;
    function eventListener(target, eventName, cb) {
      addEventListener_.call(target, eventName, cb, false);
      eventListenerInfo.count++;

      return function eventListenerRemove_() {
        removeEventListener_.call(target, eventName, cb, false);
        eventListenerInfo.count--;
      };
    }

    __exports__.eventListener = eventListener;function dispatchEvent(target, evType) {
      var evObj = document.createEvent('HTMLEvents');
      evObj.initEvent(evType, true, true);
      dispatchEvent_.call(target, evObj);
    }

    __exports__.dispatchEvent = dispatchEvent;
  });
define("morlock/core/buffer", 
  ["exports"],
  function(__exports__) {
    
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

    __exports__.create = create;function len(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue ? 1 : 0;
      } else {
        return buffer.values ? buffer.values.length : 0;
      }
    }

    __exports__.len = len;function push(buffer, value) {
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

    __exports__.push = push;function lastValue(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue;
      } else {
        return buffer.values && buffer.values[buffer.values.length - 1];
      }
    }

    __exports__.lastValue = lastValue;function fill(buffer, value) {
      if (buffer.singleValueMode) {
        buffer.singleValue = buffer.singleValue || value;
      } else {
        while (!buffer.values || (buffer.values.length < buffer.max)) {
          push(buffer, value);
        }
      }
    }

    __exports__.fill = fill;function sum(buffer) {
      if (buffer.singleValueMode) {
        return buffer.singleValue;
      }

      var total = 0;

      for (var i = 0; buffer.values, i < buffer.values.length; i++) {
        total += buffer.values[i];
      }

      return total;
    }

    __exports__.sum = sum;function average(buffer) {
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

    __exports__.average = average;function clear(buffer) {
      if (buffer.singleValueMode) {
        buffer.singleValue = null;
      } else {
        if (buffer.values) {
          buffer.values.length = 0;
          buffer.values = null;
        }
      }
    }

    __exports__.clear = clear;
  });
define("morlock/core/stream", 
  ["morlock/core/events","morlock/core/buffer","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __exports__) {
    
    var eventListener = __dependency1__.eventListener;
    var createBuffer = __dependency2__.create;
    var pushBuffer = __dependency2__.push;
    var clearBuffer = __dependency2__.clear;
    var lastBufferValue = __dependency2__.lastValue;
    var debounceCall = __dependency3__.debounce;
    var throttleCall = __dependency3__.throttle;
    var delayCall = __dependency3__.delay;
    var mapArray = __dependency3__.map;
    var memoize = __dependency3__.memoize;
    var first = __dependency3__.first;
    var apply = __dependency3__.apply;
    var compose = __dependency3__.compose;
    var when = __dependency3__.when;
    var equals = __dependency3__.equals;
    var unary = __dependency3__.unary;
    var flippedCall = __dependency3__.flippedCall;
    var isDefined = __dependency3__.isDefined;
    var autoCurry = __dependency3__.autoCurry;
    var partial = __dependency3__.partial;
    var once = __dependency3__.once;
    var copyArray = __dependency3__.copyArray;
    var indexOf = __dependency3__.indexOf;
    var rAF = __dependency3__.rAF;

    // Internal tracking of how many streams have been created.
    var nextID = 0;

    var openStreams = {};
    __exports__.openStreams = openStreams;
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
      this.values = isDefined(buffer) ? buffer : createBuffer(1, 'sliding');
      this.closed = false;
      this.closeSubscribers = null;
      this.emptySubscribers = null;

      openStreams[this.streamID] = this;
    }

    function create(trackSubscribers, buffer) {
      return new Stream(trackSubscribers, buffer);
    }

    var emit = autoCurry(function emit_(stream, val) {
      if (stream.closed) { return; }

      if (stream.subscribers) {
        for (var i = 0; i < stream.subscribers.length; i++) {
          stream.subscribers[i](val);
        }
      }

      pushBuffer(stream.values, val);
    });
    __exports__.emit = emit;
    function getValue(stream) {
      return lastBufferValue(stream.values);
    }

    function onValue(stream, f) {
      if (stream.closed) { return; }

      stream.subscribers = stream.subscribers || [];
      stream.subscribers.push(f);

      if (stream.trackSubscribers) {
        mapArray(unary(partial(flippedCall, f)), stream.subscriberSubscribers);
      }

      return partial(offValue, stream, f);
    }

    function close(stream) {
      if (stream.closed) { return; }

      stream.closed = true;
      clearBuffer(stream.values);

      if (stream.subscribers) {
        stream.subscribers.length = 0;
      }

      if (stream.closeSubscribers) {
        mapArray(flippedCall, stream.closeSubscribers);
        stream.closeSubscribers.length = 0;
      }

      delete openStreams[stream.streamID];
    }

    __exports__.close = close;function offValue(stream, f) {
      if (stream.subscribers) {
        var idx = indexOf(stream.subscribers, f);
        if (idx !== -1) {
          stream.subscribers.splice(idx, 1);
        }

        if (stream.subscribers.length < 1) {
          stream.subscribers = null;
          mapArray(flippedCall, stream.emptySubscribers);
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

    __exports__.onClose = onClose;function onEmpty(stream, f) {
      stream.emptySubscribers || (stream.emptySubscribers = []);
      stream.emptySubscribers.push(f);
    }

    __exports__.onEmpty = onEmpty;function createFromEvents(target, eventName) {
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

        unsubFunc = eventListener(target, eventName, function() {
          if (outputStream.closed) {
            detachListener_();
          } else {
            apply(boundEmit, arguments);
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

      onSubscription(outputStream, once(attachListener));

      return outputStream;
    }

    function timeout(ms) {
      var outputStream = create(true);
      var boundEmit = partial(emit, outputStream, true);

      /**
       * Lazily subscribes to a timeout event.
       */
      var attachListener = partial(setTimeout, boundEmit, ms);
      onSubscription(outputStream, once(attachListener));

      return outputStream;
    }

    var createFromRAF = memoize(function createFromRAF_() {
      var rAFStream = create(true);
      var boundEmit = emit(rAFStream);

      /**
       * Lazily subscribes to a raf event.
       */
      function sendEvent(t) {
        if (!rAFStream.closed) {
          rAF(sendEvent);
          boundEmit(t);
        }
      }

      onSubscription(rAFStream, once(sendEvent));

      return rAFStream;
    });

    function merge(/* streams */) {
      var streams = copyArray(arguments);
      var outputStream = create();
      var boundEmit = emit(outputStream);
      
      // var childStreams = {};

      // Map used for side-effects
      mapArray(function(stream) {
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
      var boundEmit = partial(emit, outputStream);
      var boundArgs = mapArray(function(v) {
        return v === EMIT_KEY ? boundEmit : v;
      }, args);

      // var offValFunc = 
      onValue(stream, apply(apply, [f, boundArgs]));
      // onClose(outputStream, offValFunc);
      // onEmpty(outputStream, partial(close, outputStream));

      return outputStream;
    }

    function delay(ms, stream) {
      if (ms <= 0) { return stream; }
      return duplicateStreamOnEmit_(stream, delayCall, [EMIT_KEY, ms]);
    }

    function throttle(ms, stream) {
      if (ms <= 0) { return stream; }
      return duplicateStreamOnEmit_(stream, throttleCall, [EMIT_KEY, ms]);
    }

    function debounce(ms, stream) {
      if (ms <= 0) { return stream; }
      return duplicateStreamOnEmit_(stream, debounceCall, [EMIT_KEY, ms]);
    }

    function map(f, stream) {
      return duplicateStreamOnEmit_(stream, compose, [EMIT_KEY, f]);
    }

    function filter(f, stream) {
      return duplicateStreamOnEmit_(stream, when, [f, EMIT_KEY]);
    }

    function filterFirst(val, stream) {
      return filter(compose(equals(val), first), stream);
    }

    function skipDuplicates(stream) {
      var lastValue;
      return filter(function checkDuplicate_(val) {
        if (equals(lastValue, val)) {
          return false;
        }
        
        lastValue = val;
        return true;
      }, stream);
    }

    __exports__.skipDuplicates = skipDuplicates;function sample(sourceStream, sampleStream) {
      return duplicateStreamOnEmit_(sampleStream,
        compose, [EMIT_KEY, partial(getValue, sourceStream)]);
    }

    __exports__.create = create;
    __exports__.getValue = getValue;
    __exports__.onValue = onValue;
    __exports__.offValue = offValue;
    __exports__.onSubscription = onSubscription;
    __exports__.createFromEvents = createFromEvents;
    __exports__.timeout = timeout;
    __exports__.createFromRAF = createFromRAF;
    __exports__.merge = merge;
    __exports__.delay = delay;
    __exports__.throttle = throttle;
    __exports__.debounce = debounce;
    __exports__.map = map;
    __exports__.filter = filter;
    __exports__.filterFirst = filterFirst;
    __exports__.sample = sample;
    __exports__.interval = interval;
  });
define("morlock/streams/resize-stream", 
  ["morlock/core/stream","morlock/core/util","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Stream = __dependency1__;
    var getOption = __dependency2__.getOption;
    var memoize = __dependency2__.memoize;
    var defer = __dependency2__.defer;

    /**
     * Create a new Stream containing resize events.
     * These events can be throttled (meaning they will only emit once every X milliseconds).
     * @param {object=} options Map of optional parameters.
     * @param {number=100} options.orientationChangeDelayMs After rotation, how long do we wait to fire an event.
     * @return {Stream} The resulting stream.
     */
    var create = memoize(function create_(options) {
      options = options || {};
      var orientationChangeDelayMs = getOption(options.orientationChangeDelayMs, 100);

      var resizeEventStream = Stream.createFromEvents(window, 'resize');
      var orientationChangeStream = Stream.createFromEvents(window, 'orientationchange');

      var resizedStream = Stream.merge(
        resizeEventStream,

        // X milliseconds after an orientation change, send an event.
        Stream.delay(orientationChangeDelayMs, orientationChangeStream)
      );

      defer(Stream.emit(resizedStream), 10);

      return Stream.skipDuplicates(Stream.map(windowDimensions_, resizedStream));
    });
    __exports__.create = create;
    function windowDimensions_() {
      return [
        window.innerWidth  || document.documentElement.clientWidth  || document.body.clientWidth,
        window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
      ];
    }
  });
define("morlock/core/emitter", 
  ["morlock/core/util","exports"],
  function(__dependency1__, __exports__) {
    
    var partial = __dependency1__.partial;
    var indexOf = __dependency1__.indexOf;

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

      if (indexOf(emitter.callbacks[eventName], callback) === -1) {
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

      var idx = indexOf(emitter.callbacks[eventName], callback);

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

      object.on = partial(on, emitter);
      object.off = partial(off, emitter);
      object.trigger = partial(trigger, emitter);

      return object;
    }

    __exports__.mixin = mixin;
  });
define("morlock/controllers/resize-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/resize-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var getOption = __dependency1__.getOption;
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ResizeStream = __dependency3__;
    var Emitter = __dependency4__;

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
      Stream.onValue(resizeStream, partial(this.trigger, 'resize'));

      var debounceMs = getOption(options.debounceMs, 200);
      var resizeEndStream = debounceMs <= 0 ? resizeStream : Stream.debounce(
        debounceMs,
        resizeStream
      );
      Stream.onValue(resizeEndStream, partial(this.trigger, 'resizeEnd'));

      this.destroy = function() {
        Stream.close(resizeStream);
        this.off('resize');
        this.off('resizeEnd');
      };
    }

    __exports__["default"] = ResizeController;
  });
define("vendor/modernizr", 
  ["exports"],
  function(__exports__) {
    
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

        __exports__["default"] = Modernizr;

        // return Modernizr;

    // })(this, this.document);
  });
define("morlock/core/dom", 
  ["morlock/core/util","vendor/modernizr","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
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

    __exports__.getRect = getRect;var cssPrefix = memoize(CustomModernizr.prefixed);
    __exports__.cssPrefix = cssPrefix;
    var setStyle = autoCurry(function setStyle_(elem, key, value) {
      elem.style[cssPrefix(key)] = value;
    });
    __exports__.setStyle = setStyle;
    function setStyles(elem, styles) {
      mapObject(flip(setStyle(elem)), styles);
    }

    __exports__.setStyles = setStyles;function getComputedStyle(elem, key) {
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

    var getStyle = autoCurry(function getStyle_(elem, key) {
      var prefixedKey = cssPrefix(key);

      return getComputedStyle(elem, prefixedKey) ||
             getCascadedStyle(elem, prefixedKey) ||
             (elem.style && elem.style[prefixedKey]);
    });
    __exports__.getStyle = getStyle;
    function insertBefore(before, elem) {
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
define("morlock/streams/breakpoint-stream", 
  ["morlock/core/util","morlock/core/dom","morlock/core/stream","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var objectVals = __dependency1__.objectVals;
    var mapObject = __dependency1__.mapObject;
    var apply = __dependency1__.apply;
    var getOption = __dependency1__.getOption;
    var push = __dependency1__.push;
    var testMQ = __dependency2__.testMQ;
    var Stream = __dependency3__;
    var ResizeStream = __dependency4__;

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

      var breakpointStreams = mapObject(function(val, key) {
        var s = Stream.create();

        var mq = 'string' === typeof val ? val : breakpointToString(val);

        Stream.onValue(resizeStream, function() {
          var wasActive = Stream.getValue(s);
          wasActive = wasActive !== null ? wasActive : false;

          if (wasActive !== testMQ(mq)) {
            Stream.emit(s, !wasActive);
          }
        });

        return Stream.map(push([key]), s);
      }, breakpoints);

      return apply(Stream.merge, objectVals(breakpointStreams));
    }

    __exports__.create = create;/**
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
        var max = getOption(options.max, Infinity);
        var min = getOption(options.min, 0);

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
  });
define("morlock/controllers/breakpoint-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/breakpoint-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var objectKeys = __dependency1__.objectKeys;
    var compose = __dependency1__.compose;
    var isTrue = __dependency1__.isTrue;
    var select = __dependency1__.select;
    var get = __dependency1__.get;
    var Stream = __dependency2__;
    var BreakpointStream = __dependency3__;
    var Emitter = __dependency4__;

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
        var isActive = compose(isTrue, get(activeBreakpoints));
        return select(isActive, objectKeys(activeBreakpoints));
      };
    }

    __exports__["default"] = BreakpointController;
  });
define("morlock/streams/scroll-stream", 
  ["morlock/core/stream","morlock/core/util","morlock/core/dom","morlock/core/events","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var Stream = __dependency1__;
    var memoize = __dependency2__.memoize;
    var defer = __dependency2__.defer;
    var partial = __dependency2__.partial;
    var documentScrollY = __dependency3__.documentScrollY;
    var dispatchEvent = __dependency4__.dispatchEvent;

    /**
     * Create a stream of window.onscroll events, but only calculate their
     * position on requestAnimationFrame frames.
     * @return {Stream}
     */
    var create = memoize(function create_() {
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

        var newScrollY = documentScrollY();
        if (oldScrollY !== newScrollY) {
          oldScrollY = newScrollY;
          return true;
        }

        return false;
      }, rAF);

      // It's going to space, will you just give it a second!
      defer(partial(dispatchEvent, window, 'scroll'), 10);

      return Stream.map(function getWindowPosition_() {
        return oldScrollY;
      }, didChangeOnRAFStream);
    });
    __exports__.create = create;
  });
define("morlock/controllers/scroll-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var getOption = __dependency1__.getOption;
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ScrollStream = __dependency3__;
    var Emitter = __dependency4__;

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
      Stream.onValue(scrollStream, partial(this.trigger, 'scroll'));

      var scrollEndStream = Stream.debounce(
        getOption(options.debounceMs, 200),
        scrollStream
      );
      Stream.onValue(scrollEndStream, partial(this.trigger, 'scrollEnd'));
    }

    __exports__["default"] = ScrollController;
  });
define("morlock/controllers/element-visible-controller", 
  ["morlock/core/util","morlock/core/dom","morlock/core/stream","morlock/core/emitter","morlock/controllers/scroll-controller","morlock/streams/resize-stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __exports__) {
    
    var getOption = __dependency1__.getOption;
    var functionBind = __dependency1__.functionBind;
    var getRect = __dependency2__.getRect;
    var getViewportHeight = __dependency2__.getViewportHeight;
    var documentScrollY = __dependency2__.documentScrollY;
    var Stream = __dependency3__;
    var Emitter = __dependency4__;
    var ScrollController = __dependency5__["default"];
    var ResizeStream = __dependency6__;

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
      this.buffer = getOption(options.buffer, 0);
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

      Stream.onValue(ResizeStream.create(), functionBind(this.didResize, this));
      
      this.viewportRect = {
        height: window.innerHeight,
        top: 0
      };

      this.recalculateOffsets();
      setTimeout(functionBind(this.recalculateOffsets, this), 100);
    }

    ElementVisibleController.prototype.didResize = function() {
      this.recalculateOffsets();
    };

    ElementVisibleController.prototype.didScroll = function(currentScrollY) {
      this.update(currentScrollY);
    };

    ElementVisibleController.prototype.recalculateOffsets = function() {
      this.viewportRect.height = getViewportHeight();
      this.recalculatePosition();
      this.update(null, true);
    };

    ElementVisibleController.prototype.recalculatePosition = function(currentScrollY) {
      currentScrollY || (currentScrollY = documentScrollY());

      this.rect = getRect(this.elem);
      this.rect.top += currentScrollY;

      this.rect.top -= this.buffer;
      this.rect.height += (this.buffer * 2);
    };

    ElementVisibleController.prototype.update = function(currentScrollY, ignoreCurrentVisibility) {
      currentScrollY || (currentScrollY = documentScrollY());

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

    __exports__["default"] = ElementVisibleController;
  });
define("morlock/streams/scroll-tracker-stream", 
  ["morlock/core/stream","morlock/streams/scroll-stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    
    var Stream = __dependency1__;
    var ScrollStream = __dependency2__;

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

    __exports__.create = create;
  });
define("morlock/controllers/scroll-position-controller", 
  ["morlock/core/util","morlock/core/stream","morlock/streams/scroll-tracker-stream","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var partial = __dependency1__.partial;
    var Stream = __dependency2__;
    var ScrollTrackerStream = __dependency3__;
    var Emitter = __dependency4__;

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
      Stream.onValue(trackerStream, partial(this.trigger, 'both'));

      var beforeStream = Stream.filterFirst('before', trackerStream);
      Stream.onValue(beforeStream, partial(this.trigger, 'before'));

      var afterStream = Stream.filterFirst('after', trackerStream);
      Stream.onValue(afterStream, partial(this.trigger, 'after'));
    }

    __exports__["default"] = ScrollPositionController;
  });
define("morlock/controllers/sticky-element-controller", 
  ["morlock/core/util","morlock/core/dom","morlock/core/stream","morlock/streams/scroll-stream","morlock/streams/resize-stream","morlock/controllers/scroll-position-controller","vendor/modernizr","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __exports__) {
    
    var getOption = __dependency1__.getOption;
    var autoCurry = __dependency1__.autoCurry;
    var partial = __dependency1__.partial;
    var forEach = __dependency1__.forEach;
    var call = __dependency1__.call;
    var functionBind = __dependency1__.functionBind;
    var isFunction = __dependency1__.isFunction;
    var getStyle = __dependency2__.getStyle;
    var setStyle = __dependency2__.setStyle;
    var setStyles = __dependency2__.setStyles;
    var addClass = __dependency2__.addClass;
    var removeClass = __dependency2__.removeClass;
    var insertBefore = __dependency2__.insertBefore;
    var documentScrollY = __dependency2__.documentScrollY;
    var detachElement = __dependency2__.detachElement;
    var Stream = __dependency3__;
    var ScrollStream = __dependency4__;
    var ResizeStream = __dependency5__;
    var ScrollPositionController = __dependency6__["default"];
    var CustomModernizr = __dependency7__["default"];

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

      this.positionType = getOption(options.positionType, 'absolute');
      this.zIndex = getOption(options.zIndex, 1000);
      this.marginTop = getOption(options.marginTop, 0);
      this.marginBottom = getOption(options.marginBottom, 0);
      this.fixCallBack = getOption(options.fixCallBack, null);
      this.unfixCallBack = getOption(options.unfixCallBack, null);

      this.useTransform = CustomModernizr.csstransforms && getOption(options.useTransform, true);

      this.subscribedListeners_ = [
        Stream.onValue(ScrollStream.create(), onScroll(this)),
        Stream.onValue(
          Stream.debounce(64, ResizeStream.create()),
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
        // 'overflow': '',
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
      stickyElement.originalOffsetTop = getStyle(stickyElement.elem, 'top');
      stickyElement.originalWidth = getStyle(stickyElement.elem, 'width');
      stickyElement.originalHeight = getStyle(stickyElement.elem, 'height');
      stickyElement.originalDisplay = getStyle(stickyElement.elem, 'display');
      // stickyElement.originalOverflow = getStyle(stickyElement.elem, 'overflow');

      if (stickyElement.useTransform) {
        stickyElement.originalTransform = getStyle(stickyElement.elem, 'transform');
      }

      // Slow, avoid
      var dimensions = stickyElement.elem.getBoundingClientRect();
      stickyElement.elemWidth = dimensions.width;
      stickyElement.elemHeight = dimensions.height;

      var currentScroll = documentScrollY();

      var containerDimensions = stickyElement.container.getBoundingClientRect();
      stickyElement.containerTop = containerDimensions.top + currentScroll;
      stickyElement.containerHeight = containerDimensions.height;
      stickyElement.originalTop = stickyElement.elem.offsetTop;

      setStyles(stickyElement.elem, {
        'position': 'absolute',
        'top': stickyElement.originalTop + 'px',
        'left': stickyElement.elem.offsetLeft + 'px',
        'width': stickyElement.elemWidth + 'px',
        'height': stickyElement.elemHeight + 'px',
        // 'overflow': 'hidden',
        'display': 'block'
      });

      if (stickyElement.originalPosition !== 'absolute') {
        addClass(stickyElement.spacer, 'stick-element-spacer');

        setStyles(stickyElement.spacer, {
          // 'width': stickyElement.elemWidth + 'px',
          'height': stickyElement.elemHeight + 'px',
          'display': getStyle(stickyElement.elem, 'display'),
          'float': getStyle(stickyElement.elem, 'float'),
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
            setStyle(stickyElement.elem, 'transform', 'translate3d(0, ' + newTop + 'px, 0)');
          } else {
            setStyle(stickyElement.elem, 'top', newTop + 'px');
          }
        }

        stickyElement.currentTop = newTop;
      }
    });

    function fix(stickyElement) {
      if (stickyElement.fixed) { return; }

      addClass(stickyElement.elem, 'fixed');
      setStyles(stickyElement.elem, {
        'position': stickyElement.positionType,
        'zIndex': stickyElement.zIndex
      });

      stickyElement.fixed = true;

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
        'top': stickyElement.originalTop
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

    __exports__["default"] = StickyElementController;
  });
define("morlock/core/responsive-image", 
  ["morlock/core/util","morlock/core/dom","morlock/controllers/resize-controller","morlock/controllers/element-visible-controller","morlock/core/emitter","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __exports__) {
    
    var map = __dependency1__.map;
    var mapObject = __dependency1__.mapObject;
    var sortBy = __dependency1__.sortBy;
    var parseInteger = __dependency1__.parseInteger;
    var set = __dependency1__.set;
    var flip = __dependency1__.flip;
    var getOption = __dependency1__.getOption;
    var partial = __dependency1__.partial;
    var setStyle = __dependency2__.setStyle;
    var getRect = __dependency2__.getRect;
    var ResizeController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var Emitter = __dependency5__;

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
      image.getPath = getOption(imageMap.getPath, getPath);

      mapObject(flip(set(image)), imageMap);

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
        debounceMs: getOption(imageMap.debounceMs, 200)
      });

      controller.on('resizeEnd', partial(update, image));

      Emitter.mixin(image);

      return image;
    }

    function createFromElement(elem, options) {
      options || (options = {});

      var imageMap = {
        element: elem,
        src: getOption(options.src, elem.getAttribute('data-src')),
        lazyLoad: getOption(options.lazyLoad, elem.getAttribute('data-lazyload') === 'true'),
        isFlexible: getOption(options.isFlexible, elem.getAttribute('data-isFlexible') !== 'false'),
        hasRetina: getOption(options.hasRetina, (elem.getAttribute('data-hasRetina') === 'true') && (window.devicePixelRatio > 1.5)),
        preserveAspectRatio: getOption(options.preserveAspectRatio, elem.getAttribute('data-preserveAspectRatio') === 'true'),
        checkIfVisible: getOption(options.checkIfVisible, function() {
          return true;
        })
      };

      imageMap.knownDimensions = getOption(options.knownDimensions, function() {
        var dimensionsString = elem.getAttribute('data-knownDimensions');
        if (dimensionsString && (dimensionsString !== 'false')) {
          return [
            parseInteger(dimensionsString.split('x')[0]),
            parseInteger(dimensionsString.split('x')[1])
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
      setStyle(image.element, 'paddingBottom', ratioPadding + '%');
    }

    /**
     * Parse the breakpoints from the `data-breakpoints` attribute.
     * @param {Element} element The source element.
     * @return {Array} Sorted array of known sizes.
     */
    function getBreakpointSizes(element) {
      var breakpointString = element.getAttribute('data-breakpoints');

      var knownSizes = map(function(s) {
        return parseInteger(s);
      }, breakpointString ? breakpointString.split(',') : []);

      if (knownSizes.length <= 0) {
        return [0];
      } else {
        return sortBy(knownSizes, function sortAscending(a, b) {
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

      var rect = getRect(image.element);
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

    __exports__.checkVisibility = checkVisibility;/**
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
      var setElemStyle = setStyle(image.element);
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

    __exports__.create = create;
    __exports__.createFromElement = createFromElement;
    __exports__.update = update;
    __exports__.checkVisibility = checkVisibility;
  });
define("morlock/api", 
  ["morlock/controllers/resize-controller","morlock/controllers/breakpoint-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/controllers/sticky-element-controller","morlock/core/util","morlock/core/events","morlock/core/buffer","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __dependency10__, __exports__) {
    
    var ResizeController = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var ScrollController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var ScrollPositionController = __dependency5__["default"];
    var StickyElementController = __dependency6__["default"];
    var Util = __dependency7__;
    var Events = __dependency8__;
    var Buffer = __dependency9__;
    var Stream = __dependency10__;

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

    var morlock = {
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

    morlock.Stream = Stream;
    morlock.Events = Events;
    morlock.Buffer = Buffer;
    morlock.Util = Util;

    __exports__["default"] = morlock;
  });
define("morlock/jquery", 
  ["morlock/api","morlock/controllers/breakpoint-controller","morlock/controllers/sticky-element-controller","morlock/core/responsive-image","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __exports__) {
    
    var morlock = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var StickyElementController = __dependency3__["default"];
    var ResponsiveImage = __dependency4__;

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
          var container = this;
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
    __exports__.defineJQueryPlugins = defineJQueryPlugins;
  });
define("morlock/base", 
  ["morlock/controllers/resize-controller","morlock/controllers/breakpoint-controller","morlock/controllers/scroll-controller","morlock/controllers/element-visible-controller","morlock/controllers/scroll-position-controller","morlock/controllers/sticky-element-controller","morlock/core/responsive-image","morlock/api","morlock/jquery","exports"],
  function(__dependency1__, __dependency2__, __dependency3__, __dependency4__, __dependency5__, __dependency6__, __dependency7__, __dependency8__, __dependency9__, __exports__) {
    
    var ResizeController = __dependency1__["default"];
    var BreakpointController = __dependency2__["default"];
    var ScrollController = __dependency3__["default"];
    var ElementVisibleController = __dependency4__["default"];
    var ScrollPositionController = __dependency5__["default"];
    var StickyElementController = __dependency6__["default"];
    var ResponsiveImage = __dependency7__;
    var API = __dependency8__["default"];
    var defineJQueryPlugins = __dependency9__.defineJQueryPlugins;

    API.enableJQuery = function enableJQuery($) {
      $ || ($ = jQuery);

      if (!$) { return; }

      defineJQueryPlugins($);
    };

    __exports__.API = API;
    __exports__.ResizeController = ResizeController;
    __exports__.BreakpointController = BreakpointController;
    __exports__.ResponsiveImage = ResponsiveImage;
    __exports__.ScrollController = ScrollController;
    __exports__.ElementVisibleController = ElementVisibleController;
    __exports__.ScrollPositionController = ScrollPositionController;
    __exports__.StickyElementController = StickyElementController;
  });
require(["morlock/base"]);
  //The modules for your project will be inlined above
  //this snippet. Ask almond to synchronously require the
  //module value for 'main' here and return it as the
  //value to use for the public API for the built file.
  return require('morlock/base');
}));
define("morlock/streams/breakpoint-stream", 
  ["morlock/core/util","morlock/core/stream","exports"],
  function(__dependency1__, __dependency2__, __exports__) {
    "use strict";
    var objectVals = __dependency1__.objectVals;
    var partial = __dependency1__.partial;
    var mapObject = __dependency1__.mapObject;
    var apply = __dependency1__.apply;
    var push = __dependency1__.push;
    var testMQ = __dependency1__.testMQ;
    var Stream = __dependency2__;

    /**
     * Create a new Stream containing events which fire when the browser
     * enters and exits breakpoints (media queries).
     * @param {Object} breakpoints Map containing the name of each breakpoint
     *   as the key. The value can be either a media query string or a map
     *   with min and/or max keys.
     * @param {Stream} resizeStream A stream emitting resize events.
     * @return {Stream} The resulting stream.
     */
    function create(breakpoints, resizeStream) {
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

        return Stream.map(partial(push, [key]), s);
      }, breakpoints);

      return apply(Stream.merge, objectVals(breakpointStreams));
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
        options.max = ('undefined' !== typeof options.max) ? options.max : Infinity;
        options.min = ('undefined' !== typeof options.min) ? options.min : 0;

        mq = 'only screen';
        if (options.max < Infinity) {
          mq += ' and (max-width: ' + options.max + 'px)';
        }
        if (options.min > 0) {
          mq += ' and (min-width: ' + options.min + 'px)';
        }
      }

      return mq;
    }

    __exports__.create = create;
  });